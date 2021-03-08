import "reflect-metadata";
import { createConnection, Connection, getConnection } from "typeorm";
import { User } from "./models/user";
import { Account } from "./models/account";
import { Transaction } from './models/transaction'
import customId from 'custom-id';

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

    async makeTransfer(amount: number, emailUserFrom: String, emailUserTo: String): Promise<void> {
        const userRepository = this.connection.getRepository(User);

        const users = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :emailUserFrom OR user.email = :emailUserTo", { emailUserFrom, emailUserTo })
            .getMany()

        const userFrom = users.find(user => user.email === emailUserFrom)
        const userTo = users.find(user => user.email === emailUserTo)

        if (userFrom && userTo && userFrom.account.amount > amount) {
            await getConnection().transaction(async transactionalEntityManager => {
                let transaction = new Transaction();
                transaction.paymentId = customId({});
                transaction.accountTo = userTo.account.accountId;
                transaction.accountFrom = userFrom.account.accountId;
                transaction.amount = amount;
                transaction.type = 'transfer';

                await transactionalEntityManager.save(transaction);

                const accountsRepository = await transactionalEntityManager.getRepository(Account);
                
                let accountFrom = userFrom.account;
                accountFrom.amount = accountFrom.amount - amount;
                await accountsRepository.save(accountFrom);

                let accountTo = userTo.account;
                accountTo.amount = accountTo.amount + amount;
                await accountsRepository.save(accountTo);
            });
        }
    }

    async makePayment(amount: number, paymentId: String, email: String): Promise<void> {
        const userRepository = this.connection.getRepository(User);
        const transactionRepository = this.connection.getRepository(Transaction);

        const user = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.account', 'account')
            .where("user.email = :email", { email })
            .getOne()

        const transactionObject = await transactionRepository.findOne({ paymentId }) 

        if (!transactionObject && user) {
            await getConnection().transaction(async transactionalEntityManager => {
                let transaction = new Transaction();
                transaction.paymentId = paymentId;
                transaction.accountTo = user.account.accountId;
                transaction.amount = amount;
                transaction.type = 'payment';

                await transactionalEntityManager.save(transaction);

                let account = user.account;
                const accountsRepository = await transactionalEntityManager.getRepository(Account);

                account.amount = account.amount + amount;
                await accountsRepository.save(account);
            });
        }

        const result = await transactionRepository.findOne({ paymentId }) 

    }

    getUsers(): Promise<User[]> {
        let userRepository = this.connection.getRepository(User);
        return userRepository.find({ relations: ['account'] })
    }

    getAccounts(): Promise<Account[]> {
        let accountsRepository = this.connection.getRepository(Account);
        return accountsRepository.find();
    }

    createUser(email: string): void {
        let user = new User();
        user.email = email;

        let account = new Account();
        account.amount = 0; 

        user.account = account;

        let userRepository = this.connection.getRepository(User);
        userRepository.save(user);
    }
}

export const db = new MysqlORM();
