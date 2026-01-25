import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import Utils from 'src/common/utils/Utils';
import CategoryExpensesDto from './dto/category-expenses.dto';

@Injectable()
export class CategoryExpensesService {
  constructor(readonly prisma: PrismaClient) {}

  async create(category: CategoryExpensesDto) {
    const id = Utils.generateIdCategoryExpenses(category.name);

    if (!id) {
      throw new BadRequestException('Nome da categoria inválido');
    }

    const categoryExpenses = await this.prisma.categoryExpenses.findFirst({
      where: { id: id },
    });

    if (categoryExpenses) {
      throw new BadRequestException('Categoria já existe');
    }

    const categoryExpensesCreated = await this.prisma.categoryExpenses.create({
      data: {
        id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
    });

    return categoryExpensesCreated;
  }

  async getAll() {
    const categoryExpenses = await this.prisma.categoryExpenses.findMany();

    return categoryExpenses;
  }
}
