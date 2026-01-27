import {
  ConflictException,
  BadRequestException, 
  Injectable,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client'; 
import CreateUserDto from './dto/user-create.dto';
import { hash } from 'bcrypt';
import { CurrentUserType } from 'src/types/current-user-type';

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

  async delete(id: string, currentUser: CurrentUserType) {
    const hasUser = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!hasUser) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (hasUser.id == currentUser.id) {
      throw new BadRequestException('Usuário não pode se deletar');
    }

    const userDeleted = await this.prisma.user.delete({
      where: {
        id,
      },
    });

    const { password, ...userWithoutPassword } = userDeleted;
    return userWithoutPassword;
  }
}
