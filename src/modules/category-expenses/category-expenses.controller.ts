import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import CategoryExpensesDto from './dto/category-expenses-create.dto';
import { CategoryExpensesService } from './category-expenses.service';
import { CurrentUserType } from 'src/types/current-user-type';

@Controller('category-expenses')
export class CategoryExpensesController {
  constructor(
    private readonly categoryExpensesService: CategoryExpensesService,
  ) {}

  @Post()
  async create(
    @Body() category: CategoryExpensesDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoryExpensesService.create(category, user.accountId);
  }

  @Get()
  async listAll(@CurrentUser() user: CurrentUserType) {
    return this.categoryExpensesService.getAll(user.accountId);
  }
}
