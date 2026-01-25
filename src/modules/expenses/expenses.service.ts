import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import ExpensesCreateDto from './dto/expenses-create.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: ExpensesCreateDto, token: string) {

      const decodedToken = await this.jwtService.decode(token);

      const user = await this.prisma.user.findUnique({
        where: {
          id: decodedToken.id,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario criador não encontrado');
      }

      const expense = await this.prisma.expense.create({
        data: {
          name: data.name,
          amount: data.amount,
          description: data.description,
          date: new Date(data.date),
          categoryExpensesId: data.categoryExpensesId,
          createdBy: { connect: { id: user.id } },
        },
      });
      return expense;

  }
}
