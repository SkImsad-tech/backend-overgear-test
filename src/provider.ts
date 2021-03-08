import { Body, Injectable } from '@nestjs/common';
import { db } from './db/index'
import { User } from './db/models/user'
import { Account } from './db/models/account'
import { UserBody, PaymentBody, TransferBody } from './controller'

@Injectable()
export class AppProvider {
    getUsers(): Promise<User[]> {
        return db.getUsers()
    }

    getAccounts(): Promise<Account[]> {
        return db.getAccounts();
    }

    createUser(@Body() body: UserBody): void {
        db.createUser(body.email)
    }

    makePayment(@Body() body: PaymentBody): Promise<void> {
        return db.makePayment(body.amount, body.paymentId, body.email);
    }

    makeTransfer(@Body() body: TransferBody): Promise<void> {
        return db.makeTransfer(body.amount, body.userFrom, body.userTo);
    }
}
