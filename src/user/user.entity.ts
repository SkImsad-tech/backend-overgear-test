import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToOne } from "typeorm";
import { Account } from '../account/account.entity'

@Entity()
@Unique(['email', 'userId'])
export class User {

    @PrimaryGeneratedColumn()
    userId: Number;
    
    @Column()
    email: String;

    @OneToOne(type => Account, account => account.userId, {
        cascade: true
    })
    account: Account
}
