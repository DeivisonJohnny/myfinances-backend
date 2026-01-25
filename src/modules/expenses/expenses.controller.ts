import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import ExpensesCreateDto from './dto/expenses-create.dto';
import ParamsListExpensesDto from './dto/params-list-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(
    @Body() data: ExpensesCreateDto,
    @Headers('Authorization') token: string,
  ) {
    const tokenWithoutBearer = token.split(' ')[1];
    return this.expensesService.create(data, tokenWithoutBearer);
  }

  @Get()
  async findAll(@Query() params: ParamsListExpensesDto) {
    return this.expensesService.findAll(params);
  }
}
