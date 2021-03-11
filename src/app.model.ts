import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppProvider } from './app.provider'
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "mysql",
            host: "mysql",
            port: 3306,
            username: "root",
            password: "123698741",
            database: "test",
            entities: [
                Account,
                User,
                Transaction
            ],
            synchronize: true,
            logging: false,
            retryAttempts: 10,
            retryDelay: 1000
        })
    ],
    controllers: [AppController],
    providers: [AppProvider],
})

export class AppModule {}