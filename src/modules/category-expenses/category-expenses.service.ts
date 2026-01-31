import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import CategoryExpensesDto from './dto/category-expenses-create.dto';

@Injectable()
export class CategoryExpensesService {
  constructor(readonly prisma: PrismaClient) {}

  async create(category: CategoryExpensesDto, accountId: string) {
    if (!accountId) {
      throw new BadRequestException('Usuário sem conta vinculada');
    }

    const categoryExpenses = await this.prisma.categoryExpenses.findFirst({
      where: {
        name: category.name,
        accountId: accountId,
      },
    });

    if (categoryExpenses) {
      throw new BadRequestException('Categoria já existe');
    }

    const categoryExpensesCreated = await this.prisma.categoryExpenses.create({
      data: {
        name: category.name,
        color: category.color,
        icon: category.icon,
        accountId,
      },
    });

    return categoryExpensesCreated;
  }

  async getAll(accountId: string) {
    if (!accountId) {
      return [];
    }
    const categoryExpenses = await this.prisma.categoryExpenses.findMany({
      where: {
        accountId: accountId,
      },
    });

    return categoryExpenses;
  }
}
