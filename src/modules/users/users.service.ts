import {
  ConflictException,
  BadRequestException, 
  Injectable,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; 
import CreateUserDto from './dto/user-create.dto';
import UserUpdateDto from './dto/user-update.dto';
import { hash } from 'bcrypt';
import { CurrentUserType } from '../../types/current-user-type';

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
        role: user.role,
      },
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findByAccount(accountId: string) {
    return this.prisma.user.findMany({
      where: {
        accountId,
      },
    });
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

  async update(id: string, user: UserUpdateDto) {
    if (user.password) {
      user.password = await hash(user.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...user,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
