import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppProvider } from './app.provider'
import { TypeOrmModule, } from '@nestjs/typeorm';
import { getConnectionOptions, Connection } from 'typeorm'

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: async () =>
            Object.assign(await getConnectionOptions(), {
              autoLoadEntities: true,
            }),
        })
    ],
    controllers: [AppController],
    providers: [AppProvider],
})

export class AppModule {
    constructor(private connection: Connection) {}
}