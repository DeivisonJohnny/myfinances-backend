import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import UsersService from './users.service';
import CreateUserDto from './dto/user-create.dto';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserType } from 'src/types/current-user-type';


@Controller('users')
export default class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body() body: CreateUserDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.userService.create(body, user.accountId);
  }
}
