import {
  Injectable,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { UserBody, UserParams } from "./user.controller";
import { Account } from "../account/account.entity";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return this.userRepository.find({ relations: ["account"] });
    } catch (error) {
      throw new HttpException("not found", HttpStatus.NOT_FOUND);
    }
  }

  async findOne(@Param() params: UserParams): Promise<User | null> {
    try {
      return this.userRepository.findOneBy({
        userId: params.id,
        // relations: ["account"],
      });
    } catch (error) {
      throw new HttpException("not found", HttpStatus.NOT_FOUND);
    }
  }

  createOne(@Body() body: UserBody): void {
    try {
      let user = new User();
      user.email = body.email;

      let account = new Account();
      account.amount = 0;

      user.account = account;

      this.userRepository.save(user);
    } catch (error) {
      throw new HttpException("not modified", HttpStatus.NOT_MODIFIED);
    }
  }
}
