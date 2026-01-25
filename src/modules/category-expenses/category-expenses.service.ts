import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import Utils from 'src/common/utils/Utils';
import CategoryExpensesDto from './dto/category-expenses.dto';

@Injectable()
export class CategoryExpensesService {
  constructor(readonly prisma: PrismaClient) {}

  async create(category: CategoryExpensesDto) {
    try {
      const id = Utils.generateIdCategoryExpenses(category.name);

      if (!id) {
        throw new BadRequestException('Invalid category name');
      }

      const categoryExpenses = await this.prisma.categoryExpenses.findFirst({
        where: { id: id },
      });

      if (categoryExpenses) {
        throw new BadRequestException('Category already exists');
      }

      const categoryExpensesCreated = await this.prisma.categoryExpenses.create(
        {
          data: {
            id,
            name: category.name,
          },
        },
      );

      return categoryExpensesCreated;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getAll() {
    const categoryExpenses = await this.prisma.categoryExpenses.findMany();

    return categoryExpenses;
  }
}
