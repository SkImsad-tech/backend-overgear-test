import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { AccountModule } from "./account/account.module";
import { User } from "./user/user.entity";
import { Account } from "./account/account.entity";
import { Transaction } from "./transactions/transaction.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.MYSQL_CONNECTION_STRING || "localhost",
      port: 3306,
      username: "root",
      password: "123698741",
      database: "test",
      synchronize: true,
      logging: false,
      entities: [User, Account, Transaction],
    }),
    UserModule,
    AccountModule,
  ],
  controllers: [],
})
export class AppModule {}
