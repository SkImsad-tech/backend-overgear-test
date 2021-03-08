import { Entity, Column, Unique, ManyToOne, PrimaryColumn } from "typeorm";
import { Account } from './account'

@Entity()
@Unique(['paymentId'])
export class Transaction {

    @PrimaryColumn()
    paymentId: String;
    
    @Column({
        default: 0
    })
    accountFrom: Number;

    @Column({
        default: 0
    })
    accountTo: Number;

    @Column()
    type: String;

    @Column()
    amount: Number;

    @ManyToOne(() => Account, (account: Account) => account.accountId)
    account: Account;
}
