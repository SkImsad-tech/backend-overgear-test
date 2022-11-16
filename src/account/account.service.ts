import { Body, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository, EntityManager } from "typeorm";
import { idGenerator } from "generate-custom-id";
import { Account } from "./account.entity";
import { Transaction } from "../transactions/transaction.entity";
import { PaymentBody, TransferBody } from "./account.controller";
import { User } from "../user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly manager: EntityManager
  ) {}

  private reduceAmount(accountId: Number, amount: number) {
    return this.manager
      .createQueryBuilder()
      .update("Account")
      .set({
        amount: () => `amount - ${+amount.toFixed(2)}`,
      })
      .where("account.accountId = :accountId", { accountId })
      .andWhere("account.amount >= :amount", { amount })
      .execute();
  }

  private increaseAmount(accountId: Number, amount: number) {
    return this.manager
      .createQueryBuilder()
      .update("Account")
      .set({
        amount: () => `amount + ${+amount.toFixed(2)}`,
      })
      .where("account.accountId = :accountId", { accountId })
      .execute();
  }

  private async recordTransaction(
    paymentId: string,
    amount: number,
    type: string,
    accountTo: number,
    accountFrom?: number
  ) {
    let transaction = new Transaction();
    transaction.paymentId = paymentId;
    transaction.accountTo = accountTo;
    if (accountFrom) {
      transaction.accountFrom = accountFrom;
    }
    transaction.amount = +amount.toFixed(2);
    transaction.type = type;

    await this.manager.save(transaction);
  }

  private async getUserAccounts(emailTo?: string, emailFrom?: string) {
    const users = await this.manager
      .getRepository(User)
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.account", "account")
      .where("user.email = :emailFrom OR user.email = :emailTo", {
        emailFrom,
        emailTo,
      })
      .getMany();

    const userFrom = users.find((user) => user.email === emailFrom);
    const userTo = users.find((user) => user.email === emailTo);

    return { userFrom, userTo };
  }

  async getAccounts(): Promise<Account[]> {
    try {
      return this.accountRepository.find();
    } catch (error) {
      throw new HttpException("not found", HttpStatus.NOT_FOUND);
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      return this.transactionRepository.find();
    } catch (error) {
      throw new HttpException("not found", HttpStatus.NOT_FOUND);
    }
  }

  async makePayment(@Body() body: PaymentBody): Promise<void> {
    try {
      await this.manager.transaction(async (manager) => {
        const transactionObject = await manager
          .getRepository(Transaction)
          .findOneBy({ paymentId: body.paymentId });
        if (transactionObject) {
          throw Error("Transaction already exist");
        }

        const { userTo } = await this.getUserAccounts(body.email);
        if (!userTo) {
          throw Error("did not found receiver account");
        }

        await this.recordTransaction(
          body.paymentId,
          body.amount,
          "refill",
          userTo.account.accountId
        );
        await this.increaseAmount(userTo.account.accountId, body.amount);
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || "not modified",
        HttpStatus.NOT_MODIFIED
      );
    }
  }

  async makeTransfer(@Body() body: TransferBody): Promise<void> {
    try {
      await this.manager.transaction(async (manager) => {
        if (body.paymentId) {
          const transactionObject = await manager
            .getRepository(Transaction)
            .findOneBy({ paymentId: body.paymentId });
          if (transactionObject) {
            throw Error("Transaction already exist");
          }
        }

        const { userFrom, userTo } = await this.getUserAccounts(
          body.userTo,
          body.userFrom
        );

        if (!userFrom) {
          throw Error("did not found user originator account");
        }
        if (!userTo) {
          throw Error("did not found receiver account");
        }

        await this.recordTransaction(
          body.paymentId || idGenerator("random"),
          body.amount,
          "transfer",
          userTo.account.accountId,
          userFrom.account.accountId
        );

        const res = await this.reduceAmount(
          userFrom.account.accountId,
          body.amount
        );
        if (res.affected) {
          this.increaseAmount(userTo.account.accountId, body.amount);
        }
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || "not modified",
        HttpStatus.NOT_MODIFIED
      );
    }
  }
}
