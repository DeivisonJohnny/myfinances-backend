import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import ExpensesCreateDto from './dto/expenses-create.dto';

@Controller('expenses')
export class ExpensesController {


    constructor(private readonly expensesService: ExpensesService) {}

    @Post()
    async create(@Body() data: ExpensesCreateDto, @Headers('Authorization') token: string) {
        const tokenWithoutBearer = token.split(' ')[1];
        return this.expensesService.create(data, tokenWithoutBearer);
    }

}
