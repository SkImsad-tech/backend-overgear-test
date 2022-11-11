import { Module } from '@nestjs/common'
import { TypeOrmModule, } from '@nestjs/typeorm';
import { getConnectionOptions, Connection } from 'typeorm'
import { UsersModule } from './user/users.model'
import { AccountModule } from './account/account.model'

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: async () =>
            Object.assign(await getConnectionOptions(), {
              autoLoadEntities: true,
            }),
        }),
        UsersModule,
        AccountModule
    ],
})

export class AppModule {}