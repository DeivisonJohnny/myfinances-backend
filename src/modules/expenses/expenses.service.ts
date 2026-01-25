import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import ExpensesCreateDto from './dto/expenses-create.dto';
import { JwtService } from '@nestjs/jwt';
import ParamsListExpensesDto from './dto/params-list-expense.dto';

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

  async findAll({ year, month }: ParamsListExpensesDto) {
    const where = {
      date: {
        gte:
          year && month
            ? new Date(parseInt(year), parseInt(month), 1)
            : undefined,
        lte:
          year && month
            ? new Date(parseInt(year), parseInt(month) + 1, 0)
            : undefined,
      },
    };

    return this.prisma.expense.findMany({ where });
  }
}
