import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import ExpensesCreateDto from './dto/expenses-create.dto';
import { JwtService } from '@nestjs/jwt';
import ParamsListExpensesDto from './dto/params-list-expense.dto';
import { CurrentUserType } from 'src/types/current-user-type';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: ExpensesCreateDto, user: CurrentUserType) {
    if (!user.accountId || !user.id) {
      throw new UnauthorizedException('Usuário sem conta vinculada ou sem id');
    }

    const expense = await this.prisma.expense.create({
      data: {
        name: data.name,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        categoryExpensesId: data.categoryExpensesId,
        accountId: user.accountId,
        createdById: user.id,
      },
    });
    return expense;
  }

  async findAll(
    { year, month, day }: ParamsListExpensesDto,
    accountId: string,
  ) {
    const where: any = {
      accountId,
      date: {
        gte:
          year && month && day
            ? new Date(parseInt(year), parseInt(month), parseInt(day))
            : year && month
              ? new Date(parseInt(year), parseInt(month), 1)
              : undefined,
        lte:
          year && month && day
            ? new Date(parseInt(year), parseInt(month), parseInt(day) + 1)
            : year && month
              ? new Date(parseInt(year), parseInt(month) + 1, 0)
              : undefined,
      },
    };

    return this.prisma.expense.findMany({ where });
  }
}
