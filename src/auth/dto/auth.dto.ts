import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class AuthDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;


  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
