import { Entity, Column, Unique, ManyToOne, PrimaryColumn } from "typeorm";
import { Account } from "../account/account.entity";

@Entity()
@Unique(["paymentId"])
export class Transaction {
  @PrimaryColumn()
  paymentId: string;

  @Column({
    default: 0,
  })
  accountFrom: number;

  @Column({
    default: 0,
  })
  accountTo: number;

  @Column()
  type: string;

  @Column()
  amount: number;

  @ManyToOne(() => Account, (account: Account) => account.accountId)
  account: Account;
}
