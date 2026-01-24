import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import UsersService from './users.service';
import CreateUserDto from './dto/create-user.dto';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';


@Controller('users')
export default class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
}
