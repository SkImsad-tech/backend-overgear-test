import { NestFactory } from '@nestjs/core'
import { AppModule } from './model'
import { db } from './db/index'

async function bootstrap() {
    const app = NestFactory.create(AppModule);
    (await app).listen(3000);
}

bootstrap();
