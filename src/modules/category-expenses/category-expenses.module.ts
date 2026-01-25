import { Module } from '@nestjs/common';
import { CategoryExpensesController } from './category-expenses.controller';
import { CategoryExpensesService } from './category-expenses.service';

@Module({
  controllers: [CategoryExpensesController],
  providers: [CategoryExpensesService]
})
export class CategoryExpensesModule {}
