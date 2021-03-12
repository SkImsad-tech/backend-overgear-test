import { Body, Param, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserBody, UserParams } from './users.controller';
import { Connection } from 'typeorm';
import { Account } from '../account/account.entity'

@Injectable()
export class UserProvider {
    constructor(private connection: Connection) {}

    findAll(): Promise<User[]> {
        try {
            let userRepository = this.connection.getRepository(User);
            return userRepository.find({ relations: ['account'] });
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);
        }
    }

    findOne(@Param() params: UserParams): Promise<User | undefined> {
        try {
            let userRepository = this.connection.getRepository(User);
            return userRepository.findOne({ userId: params.id }, { relations: ['account'] })
        } catch (error) {
            throw new HttpException('not found', HttpStatus.NOT_FOUND);
        }
    }

    createOne(@Body() body: UserBody): void {
        try {
            let user = new User();
            user.email = body.email;
    
            let account = new Account();
            account.amount = 0; 
    
            user.account = account;
    
            let userRepository = this.connection.getRepository(User);
            userRepository.save(user);
        } catch (error) {
            throw new HttpException('not modified', HttpStatus.NOT_MODIFIED);
        }
    }
}
