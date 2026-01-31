import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import ExpensesCreateDto from './dto/expenses-create.dto';
import { JwtService } from '@nestjs/jwt';
import ParamsListExpensesDto from './dto/params-list-expense.dto';
import { CurrentUserType } from '../../types/current-user-type';

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
    { year, month, day, createdById }: ParamsListExpensesDto,
    accountId: string,
  ) {
    const where: any = {
      accountId,
      createdById,
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

  async getReports({ year, month }: ParamsListExpensesDto, accountId: string) {
    const where: any = {
      accountId,
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

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        categoryExpenses: true,
        createdBy: true,
      },
    });

    const userSpending: Record<string, { user: any; total: number }> = {};
    const categorySpending: Record<string, { category: any; total: number }> =
      {};
    const daySpending: Record<string, number> = {};

    expenses.forEach((expense) => {
      // Top User
      if (expense.createdById) {
        const userId = expense.createdById;
        if (!userSpending[userId]) {
          userSpending[userId] = {
            user: expense.createdBy,
            total: 0,
          };
        }
        userSpending[userId].total += expense.amount;
      }

      // Top Category
      const catId = expense.categoryExpensesId;
      if (!categorySpending[catId]) {
        categorySpending[catId] = {
          category: expense.categoryExpenses,
          total: 0,
        };
      }
      categorySpending[catId].total += expense.amount;

      // Peak Day
      const dayKey = expense.date.toISOString().split('T')[0];
      if (!daySpending[dayKey]) daySpending[dayKey] = 0;
      daySpending[dayKey] += expense.amount;
    });

    const topUser = Object.values(userSpending)
      .map((u) => ({ ...u, total: Number(u.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total)[0];

    const topCategory = Object.values(categorySpending)
      .map((c) => ({ ...c, total: Number(c.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total)[0];

    // Find peak day
    const peakDayEntry = Object.entries(daySpending).sort(
      ([, a], [, b]) => b - a,
    )[0];

    const peakDay = peakDayEntry
      ? {
          date: peakDayEntry[0],
          total: Number(peakDayEntry[1].toFixed(2)),
        }
      : null;

    return {
      topUser,
      topCategory,
      peakDay,
    };
  }
}
