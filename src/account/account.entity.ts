import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Transaction } from "../transactions/transaction.entity";

@Entity()
@Unique(["userId", "accountId"])
export class Account {
  @PrimaryGeneratedColumn()
  accountId: number;

  @Column()
  amount: number;

  @OneToOne((type) => User, (user) => user.userId)
  @JoinColumn()
  userId: User;

  @OneToMany(
    () => Transaction,
    (transaction: Transaction) => transaction.accountFrom
  )
  transaction: Transaction[];
}
