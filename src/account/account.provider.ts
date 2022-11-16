import { DataSource } from "typeorm";
import { Transaction } from "../transactions/transaction.entity";
import { Account } from "./account.entity";

export const AccountProvider = [
  {
    provide: "ACCOUNT_REPOSITORY",
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Account),
    inject: ["DATA_SOURCE"],
  },
  {
    provide: "TRANSACTION_REPOSITORY",
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Transaction),
    inject: ["DATA_SOURCE"],
  },
];
