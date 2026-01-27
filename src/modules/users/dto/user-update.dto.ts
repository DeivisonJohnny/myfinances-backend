import { PartialType } from '@nestjs/swagger';
import CreateUserDto from './user-create.dto';

export default class UserUpdateDto extends PartialType(CreateUserDto) {}
