import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, Role } from 'generated/prisma/client';
import AccountCreateDto from './dto/account-create.dto';
import { hash, hashSync } from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(readonly prisma: PrismaClient) {}

  async create({  passwordConfirmation, ...account }: AccountCreateDto) {
      if (account.password !== passwordConfirmation) {
          throw new BadRequestException('As senhas não coincidem');
        }

    const hasAccount = await this.prisma.account.findFirst({
      where: {
        email: account.email,
      },
    });

    if (hasAccount) {
      throw new BadRequestException('Conta já cadastrada');
    }

    const hasUser = await this.prisma.user.findUnique({
      where: {
        email: account.email,
      },
    });

    if (hasUser) {
      throw new BadRequestException('Este email já possui uma conta');
    }

    const password = hashSync(account.password, 10);

    const [newUser, newAccount] = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: account.name,
          email: account.email,
          password: password,
          role: Role.ADMIN,
        },
      });

      const newAccount = await tx.account.create({
        data: { name: account.name, email: account.email, users: { connect: { id: newUser.id } } },
      });

      return [newUser, newAccount];
    });

    return {newUser, newAccount}
  }
}
