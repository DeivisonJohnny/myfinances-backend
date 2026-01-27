import { IsNotEmpty, IsString } from 'class-validator';

export default class UserDeleteDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
