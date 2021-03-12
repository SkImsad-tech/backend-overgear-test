import { Module } from '@nestjs/common'
import { UserController } from './users.controller'
import { UserProvider } from './users.provider'
import { Connection } from 'typeorm';


@Module({
    controllers: [UserController],
    providers: [UserProvider],
})

export class UsersModule {
    constructor(private connection: Connection) {}
}