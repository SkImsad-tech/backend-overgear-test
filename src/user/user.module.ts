import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserProvider } from "./user.provider";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
