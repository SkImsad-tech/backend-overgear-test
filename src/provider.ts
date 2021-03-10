import { Body, HttpStatus, Injectable } from '@nestjs/common';
import { db } from './db/index'
import { User } from './db/models/user.entity'
import { Account } from './db/models/account.entity'
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
        db.createUser(body);
    }

    makePayment(@Body() body: PaymentBody): Promise<void> {
        return db.makePayment(body);
    }

    makeTransfer(@Body() body: TransferBody): Promise<void> {
        return db.makeTransfer(body);
    }
}
