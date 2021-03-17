import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Account } from './account.entity'
import { Transaction } from './transaction.entity'
import { PaymentBody, TransferBody } from './account.controller'
import { Connection, getConnection, EntityManager } from 'typeorm';
import { User } from '../user/user.entity'
import customId from 'custom-id';

@Injectable()
export class AccountProvider {
    constructor(private connection: Connection) {}

    private reduceAmount(manager: EntityManager, accountId: Number, amount: number) {
        return manager
            .createQueryBuilder()
            .update('Account')
            .set({
                amount: () => `amount - ${+amount.toFixed(2)}`
            })
            .where('account.accountId = :accountId', { accountId })
            .andWhere('account.amount >= :amount', { amount })
            .execute();
    }

    private increaseAmount(manager: EntityManager, accountId: Number, amount: number) {
        return manager
            .createQueryBuilder()
            .update('Account')
            .set({
                amount: () => `amount + ${+amount.toFixed(2)}`
            })
            .where('account.accountId = :accountId', { accountId })
            .execute();
    } 

    private async recordTransaction(
        manager: EntityManager,
        paymentId: string,
        amount: Number,
        type: string,
        accountTo: Number,
        accountFrom?: Number
    ) {
        let transaction = new Transaction();
        transaction.paymentId = paymentId;
        transaction.accountTo = accountTo;
        if (accountFrom) { transaction.accountFrom = accountFrom; }
        transaction.amount = +amount.toFixed(2);
        transaction.type = type;

        await manager.save(transaction);
    }

    private async getUserAccounts (manager: EntityManager, emailTo?: string, emailFrom?: string ) {
        const users = await manager
            .getRepository(User)
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :emailFrom OR user.email = :emailTo", { emailFrom, emailTo })
            .getMany()

            const userFrom = users.find(user => user.email === emailFrom)
            const userTo = users.find(user => user.email === emailTo)

            return { userFrom, userTo }
    }

    getAccounts(): Promise<Account[]> {
        try {
            let accountsRepository = this.connection.getRepository(Account);
            return accountsRepository.find();
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);
        }
    }

    getTransactions(): Promise<Transaction[]>{
        try {
            let transactionRepository = this.connection.getRepository(Transaction);
            return transactionRepository.find();
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);
        }
    }

    async makePayment(@Body() body: PaymentBody): Promise<void> {
        try {
            await getConnection().transaction(async transactionalEntityManager => {
                const transactionObject = await transactionalEntityManager.getRepository(Transaction).findOne({ paymentId: body.paymentId }) 
                if (transactionObject) { throw Error('Transaction already exist') }

                const { userTo } = await this.getUserAccounts(transactionalEntityManager, body.email)
                if (!userTo) { throw Error('did not found receiver account') }

                await this.recordTransaction(transactionalEntityManager, body.paymentId, body.amount, 'refill', userTo.account.accountId)
                await this.increaseAmount(transactionalEntityManager, userTo.account.accountId, body.amount);
            });
        } catch (error: any) {
            throw new HttpException(error.message || 'not modified', HttpStatus.NOT_MODIFIED);
        }
    }

    async makeTransfer(@Body() body: TransferBody): Promise<void> {
        try {
            await getConnection().transaction(async transactionalEntityManager => {
                if (body.paymentId) {
                    const transactionObject = await transactionalEntityManager.getRepository(Transaction).findOne({ paymentId: body.paymentId })
                    if (transactionObject) { throw Error('Transaction already exist') }
                }

                const { userFrom, userTo } = await this.getUserAccounts(transactionalEntityManager, body.userTo, body.userFrom)

                if (!userFrom) { throw Error('did not found user originator account') }
                if (!userTo) { throw Error('did not found receiver account') }

                await this.recordTransaction(
                    transactionalEntityManager,
                    body.paymentId || customId({}),
                    body.amount,
                    'transfer',
                    userTo.account.accountId,
                    userFrom.account.accountId
                )

                const res = await this.reduceAmount(transactionalEntityManager, userFrom.account.accountId, body.amount)
                if (res.affected) { this.increaseAmount(transactionalEntityManager, userTo.account.accountId, body.amount) }
            });
        } catch (error) {
            throw new HttpException(error.message || 'not modified', HttpStatus.NOT_MODIFIED);
        }
    }
}
