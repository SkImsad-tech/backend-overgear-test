import { Module } from '@nestjs/common'
import { AppController } from './controller'
import { AppProvider } from './provider'

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppProvider],
})

export class AppModule {}