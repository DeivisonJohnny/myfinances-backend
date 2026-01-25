import {
  ConflictException,
  BadRequestException, 
  Injectable,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client'; 
import CreateUserDto from './dto/user-create.dto';
import { hash } from 'bcrypt';

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

    const hashedPassword = await hash(user.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}
