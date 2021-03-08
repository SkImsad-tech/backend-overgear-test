import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from './user'
import { Transaction } from './transaction'

@Entity()
@Unique(['userId', 'accountId'])
export class Account {

    @PrimaryGeneratedColumn()
    accountId: Number;

    @Column()
    amount: number;

    @OneToOne(type => User, user => user.userId)
    @JoinColumn()
    userId: User;

    @OneToMany(() => Transaction, (transaction: Transaction) => transaction.accountFrom)
    transaction: Transaction[];
}
