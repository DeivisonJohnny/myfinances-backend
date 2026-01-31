import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import ExpensesCreateDto from './dto/expenses-create.dto';
import ParamsListExpensesDto from './dto/params-list-expense.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentUserType } from '../../types/current-user-type';

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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ExpensesCreateDto>,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.expensesService.update(id, data, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.expensesService.delete(id, user);
  }

  @Get()
  async findAll(
    @Query() params: ParamsListExpensesDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.expensesService.findAll(params, user.accountId);
  }

  @Get('reports')
  async getReports(
    @Query() params: ParamsListExpensesDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.expensesService.getReports(params, user.accountId);
  }
}
