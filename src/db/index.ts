import "reflect-metadata";
import { createConnection, Connection, getConnection } from "typeorm";
import { User } from "./models/user.entity";
import { Account } from "./models/account.entity";
import { Transaction } from './models/transaction.entity'
import customId from 'custom-id';
import { UserBody, PaymentBody, TransferBody } from '../controller'
import { HttpException, HttpStatus } from "@nestjs/common";

class MysqlORM {
    private connection: Connection;
    constructor() {
        createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "123698741",
            database: "test",
            entities: [
                Account,
                User,
                Transaction
            ],
            synchronize: true,
            logging: false
        }).then(connection => {
            this.connection = connection;
            console.log('logged in mysql db');
        }).catch(error => console.log(error));
    }

    async makeTransfer(body: TransferBody): Promise<void> {
        const userRepository = this.connection.getRepository(User);

        const users = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :userFrom OR user.email = :userTo", { userFrom: body.userFrom, userTo: body.userTo })
            .getMany()

        const userFrom = users.find(user => user.email === body.userFrom)
        const userTo = users.find(user => user.email === body.userTo)

        if (userFrom && userTo && userFrom.account.amount > body.amount) {
            try {
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
            } catch (error) {
                throw new HttpException('not modified', HttpStatus.NOT_MODIFIED);
            }
        }
    }

    async makePayment(body: PaymentBody): Promise<void> {
        const userRepository = this.connection.getRepository(User);
        const transactionRepository = this.connection.getRepository(Transaction);

        const user = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :email", { email: body.email })
            .getOne()

        const transactionObject = await transactionRepository.findOne({ paymentId: body.paymentId }) 

        if (!transactionObject && user) {
            try {
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
            } catch (error) {
                throw new HttpException('not modified', HttpStatus.NOT_MODIFIED);
            }
        }
    }

    getUsers(): Promise<User[]> {
        try {
            let userRepository = this.connection.getRepository(User);
            return userRepository.find({ relations: ['account'] })
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);
        }
    }

    getAccounts(): Promise<Account[]> {
        try {
            let accountsRepository = this.connection.getRepository(Account);
            return accountsRepository.find();
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);

        }
    }

    createUser(body: UserBody): void {
        try {
            let user = new User();
            user.email = body.email;
    
            let account = new Account();
            account.amount = 0; 
    
            user.account = account;
    
            let userRepository = this.connection.getRepository(User);
            userRepository.save(user);
        } catch (error) {
            throw new HttpException('not modified', HttpStatus.NOT_MODIFIED);
        }
    }
}

export const db = new MysqlORM();
