import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import UsersService from './users.service';
import CreateUserDto from './dto/user-create.dto';
import UserUpdateDto from './dto/user-update.dto';
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

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.userService.findAll();
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  async delete(
    @Param('id') userForDelete: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.userService.delete(userForDelete, currentUser);
  }

  @Patch('/:id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() body: UserUpdateDto) {
    return this.userService.update(id, body);
  }
}
