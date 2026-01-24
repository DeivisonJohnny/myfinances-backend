import {
  ConflictException,
  BadRequestException, 
  Injectable,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client'; 
import CreateUserDto from './dto/create-user.dto';

@Injectable()
export default class UsersService {
  constructor(readonly prisma: PrismaClient) {}

  async create(user: CreateUserDto) {
    if (user.confirmPassword !== user.password) {
      throw new BadRequestException('As senhas não coincidem');
    }

    const hasUser = await this.prisma.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (hasUser) {
      throw new ConflictException('Usuário já registrado');
    }

    const newUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    return newUser;
  }
}
