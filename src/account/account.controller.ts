import { Controller, Get, Post, HttpCode, Body,  } from '@nestjs/common'
import { AccountProvider } from './account.provider'
import { Account } from './account.entity'
import { ApiBody, ApiCreatedResponse, ApiProperty } from '@nestjs/swagger'

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

@Controller('accounts')
export class AccountController {
    constructor(private readonly accountProvider: AccountProvider) {}

    @Get('/list')
    @ApiCreatedResponse({ description: 'Метод отдаёт список всех аккаунтов. Довольно бесполезен))' })
    getAccount(): Promise<Account[]> {
        return this.accountProvider.getAccounts();
    }

    @Post('/payment')
    @ApiCreatedResponse({ description: 'Метод зачисления денежных средств на аккаунт из сторонней систему' })
    @HttpCode(200)
    @ApiBody({ type: PaymentBody })
    Payment(@Body() body: PaymentBody) {
        return this.accountProvider.makePayment(body);
    }

    @Post('/transfer')
    @ApiCreatedResponse({ description: 'Метод перевода денежных средств с аккаунта на аккаунт. Изначально не идемпотентен. Желательно передавать paymentId' })
    @HttpCode(200)
    @ApiBody({ type: TransferBody })
    Transfer(@Body() body: TransferBody) {
        return this.accountProvider.makeTransfer(body);
    }
}
