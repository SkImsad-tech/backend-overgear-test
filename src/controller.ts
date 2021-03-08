import { Controller, Get, Post, HttpCode, Body,  } from '@nestjs/common'
import { AppProvider } from './provider'
import { User } from './db/models/user'
import { Account } from './db/models/account'

export type UserBody = {
    email: string;
}

export type PaymentBody = {
    amount: number;
    paymentId: string;
    email: string;
}

export type TransferBody = {
    amount: number;
    userFrom: string;
    userTo: string;
}

@Controller()
export class AppController {
    constructor(private readonly appProvider: AppProvider = new AppProvider) {}

    @Get('/users')
    getUser(): Promise<User[]> {
        return this.appProvider.getUsers();
    }

    @Get('/accounts')
    getAccount(): Promise<Account[]> {
        return this.appProvider.getAccounts();
    }

    @Post('/user')
    @HttpCode(200)
    createUser(@Body() body: UserBody): void {
        return this.appProvider.createUser(body);
    }

    @Post('/accounts/payment')
    @HttpCode(200)
    Payment(@Body() body: PaymentBody) {
        return this.appProvider.makePayment(body);
    }

    @Post('/accounts/transfer')
    Transfer(@Body() body: TransferBody) {
        return this.appProvider.makeTransfer(body);
    }
}
