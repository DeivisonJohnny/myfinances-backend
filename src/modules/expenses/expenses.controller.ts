import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import ExpensesCreateDto from './dto/expenses-create.dto';
import ParamsListExpensesDto from './dto/params-list-expense.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserType } from 'src/types/current-user-type';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(
    @Body() data: ExpensesCreateDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.expensesService.create(data, user);
  }

  @Get()
  async findAll(
    @Query() params: ParamsListExpensesDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.expensesService.findAll(params, user.accountId);
  }
}
