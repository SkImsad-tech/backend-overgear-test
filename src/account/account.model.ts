import { Module } from '@nestjs/common'
import { AccountController } from './account.controller'
import { AccountProvider } from './account.provider'
import { Connection } from 'typeorm';


@Module({
    controllers: [AccountController],
    providers: [AccountProvider],
})

export class AccountModule {
    constructor(private connection: Connection) {}
}