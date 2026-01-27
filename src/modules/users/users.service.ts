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

  async create(user: CreateUserDto, accountId: string) {
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
        accountId: accountId,
      },
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
