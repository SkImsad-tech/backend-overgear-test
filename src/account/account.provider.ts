import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Account } from './account.entity'
import { Transaction } from './transaction.entity'
import { PaymentBody, TransferBody } from './account.controller'
import { Connection, getConnection } from 'typeorm';
import { User } from '../user/user.entity'
import customId from 'custom-id';

@Injectable()
export class AccountProvider {
    constructor(private connection: Connection) {}

    getAccounts(): Promise<Account[]> {
        try {
            let accountsRepository = this.connection.getRepository(Account);
            return accountsRepository.find();
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);
        }
    }

    async makePayment(@Body() body: PaymentBody): Promise<void> {
        const userRepository = this.connection.getRepository(User);
        const transactionRepository = this.connection.getRepository(Transaction);

        const user = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :email", { email: body.email })
            .getOne()

        const transactionObject = await transactionRepository.findOne({ paymentId: body.paymentId }) 

        try {
        if (!transactionObject && user) {
                await getConnection().transaction(async transactionalEntityManager => {
                    let transaction = new Transaction();
                    transaction.paymentId = body.paymentId;
                    transaction.accountTo = user.account.accountId;
                    transaction.amount = body.amount;
                    transaction.type = 'refill';
    
                    await transactionalEntityManager.save(transaction);
    
                    let account = user.account;
                    const accountsRepository = await transactionalEntityManager.getRepository(Account);
    
                    account.amount = account.amount + body.amount;
                    await accountsRepository.save(account);
                });
            } else throw Error()
        } catch (error) {
            throw new HttpException('not modified', HttpStatus.NOT_MODIFIED);
        }
    }

    async makeTransfer(@Body() body: TransferBody): Promise<void> {
        const userRepository = this.connection.getRepository(User);

        const users = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :userFrom OR user.email = :userTo", { userFrom: body.userFrom, userTo: body.userTo })
            .getMany()

        const userFrom = users.find(user => user.email === body.userFrom)
        const userTo = users.find(user => user.email === body.userTo)

        try {
            if (userFrom && userTo && userFrom.account.amount > body.amount) {
                await getConnection().transaction(async transactionalEntityManager => {
                    let transaction = new Transaction();
                    transaction.paymentId = body.paymentId || customId({});
                    transaction.accountTo = userTo.account.accountId;
                    transaction.accountFrom = userFrom.account.accountId;
                    transaction.amount = body.amount;
                    transaction.type = 'transfer';
    
                    await transactionalEntityManager.save(transaction);
    
                    const accountsRepository = await transactionalEntityManager.getRepository(Account);
                    
                    let accountFrom = userFrom.account;
                    accountFrom.amount = accountFrom.amount - body.amount;
                    await accountsRepository.save(accountFrom);
    
                    let accountTo = userTo.account;
                    accountTo.amount = accountTo.amount + body.amount;
                    await accountsRepository.save(accountTo);
                });
            } else throw Error()
        } catch (error) {
            throw new HttpException('not modified', HttpStatus.NOT_MODIFIED);
        }
    }
}
