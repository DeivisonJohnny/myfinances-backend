import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import UsersService from './users.service';
import CreateUserDto from './dto/create-user.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users')
export default class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()

  async create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
}
