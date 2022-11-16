import { Controller, Get, Post, HttpCode, Body, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { ApiBody, ApiCreatedResponse, ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class UserBody {
  @ApiProperty({ type: String, description: "email" })
  @IsEmail()
  email: string;
}

export class UserParams {
  @IsString()
  id: number;
  relations?: [string];
}

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/list")
  @ApiCreatedResponse({
    description:
      "Метод отдаёт список всех Пользователей и связанных с ними аккаунтов",
  })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  @ApiCreatedResponse({
    description:
      "Метод отдаёт одного пользователя и связанный с ним аккаунт, поиск ведётся по id",
  })
  findOne(@Param() params: UserParams): Promise<User | null> {
    return this.userService.findOne(params);
  }

  @Post()
  @ApiCreatedResponse({
    description:
      "Метод создания пользователя, Аккаунт для пользователя создаётся автоматически",
  })
  @HttpCode(200)
  @ApiBody({ type: UserBody })
  createOne(@Body() body: UserBody): void {
    return this.userService.createOne(body);
  }
}
