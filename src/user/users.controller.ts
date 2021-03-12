import { Controller, Get, Post, HttpCode, Body, Param } from '@nestjs/common'
import { UserProvider } from './users.provider'
import { User } from './user.entity'
import { ApiBody, ApiCreatedResponse, ApiProperty } from '@nestjs/swagger'

export class UserBody {
    @ApiProperty({ type: String, description: 'email' })
    email: string;
}

export class UserParams {
    id: string;
}

@Controller('user')
export class UserController {
    constructor(private readonly userProvider: UserProvider) {}

    @Get('/list')
    @ApiCreatedResponse({ description: 'Метод отдаёт список всех Пользователей и связанных с ними аккаунтов' })
    findAll(): Promise<User[]> {
        return this.userProvider.findAll();
    }
    
    @Get(':id')
    @ApiCreatedResponse({ description: 'Метод отдаёт одного пользователя и связанный с ним аккаунт, поиск ведётся по id' })
    findOne(@Param() params: UserParams): Promise<User | undefined> {
        return this.userProvider.findOne(params);
    }

    @Post()
    @ApiCreatedResponse({ description: 'Метод создания пользователя, Аккаунт для пользователя создаётся автоматически' })
    @HttpCode(200)
    @ApiBody({ type: UserBody })
    createOne(@Body() body: UserBody): void {
        return this.userProvider.createOne(body);
    }
}
