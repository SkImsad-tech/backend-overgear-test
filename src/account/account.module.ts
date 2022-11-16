import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "../transactions/transaction.entity";
import { AccountController } from "./account.controller";
import { Account } from "./account.entity";
import { AccountProvider } from "./account.provider";
import { AccountService } from "./account.service";

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction])],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
