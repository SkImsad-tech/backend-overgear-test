import { Controller, Get, Post, HttpCode, Body,  } from '@nestjs/common'
import { AppProvider } from './provider'
import { User } from './db/models/user.entity'
import { Account } from './db/models/account.entity'
import { ApiBody, ApiCreatedResponse, ApiProperty } from '@nestjs/swagger'

export class UserBody {
    @ApiProperty({ type: String, description: 'email' })
    email: string;
}

export class PaymentBody {
    @ApiProperty({ type: Number, description: 'cash amount' })
    amount: number;
    @ApiProperty({ type: String, description: 'transaction ID, used for idempotence' })
    paymentId: string;
    @ApiProperty({ type: String, description: 'email' })
    email: string;
}

export class TransferBody {
    @ApiProperty({ type: String, description: 'transaction ID, used for idempotence, May not be provided' })
    paymentId?: String;
    @ApiProperty({ type: Number, description: 'cash amount' })
    amount: number;
    @ApiProperty({ type: String, description: 'email of the account where the money is withdrawn from' })
    userFrom: string;
    @ApiProperty({ type: String, description: 'email of the account where the money is accrue' })
    userTo: string;
}

@Controller()
export class AppController {
    constructor(private readonly appProvider: AppProvider = new AppProvider) {}

    @Get('/users')
    @ApiCreatedResponse({ description: 'Метод отдаёт список всех Пользователей и связанных с ними аккаунтов' })
    getUser(): Promise<User[]> {
        return this.appProvider.getUsers();
    }

    @Get('/accounts')
    @ApiCreatedResponse({ description: 'Метод отдаёт список всех аккаунтов. Довольно бесполезен))' })
    getAccount(): Promise<Account[]> {
        return this.appProvider.getAccounts();
    }
    
    @Post('/user')
    @ApiCreatedResponse({ description: 'Метод создания пользователя, Аккаунт для пользователя создаётся автоматически' })
    @HttpCode(200)
    @ApiBody({ type: UserBody })
    createUser(@Body() body: UserBody): void {
        return this.appProvider.createUser(body);
    }

    @Post('/accounts/payment')
    @ApiCreatedResponse({ description: 'Метод зачисления денежных средств на аккаунт из сторонней систему' })
    @HttpCode(200)
    @ApiBody({ type: PaymentBody })
    Payment(@Body() body: PaymentBody) {
        return this.appProvider.makePayment(body);
    }

    @Post('/accounts/transfer')
    @ApiCreatedResponse({ description: 'Метод перевода денежных средств с аккаунта на аккаунт' })
    @HttpCode(200)
    @ApiBody({ type: TransferBody })
    Transfer(@Body() body: TransferBody) {
        return this.appProvider.makeTransfer(body);
    }
}
