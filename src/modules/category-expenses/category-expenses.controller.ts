import { Body, Controller, Post } from '@nestjs/common';
import CategoryExpensesDto from './dto/category-expenses.dto';
import { CategoryExpensesService } from './category-expenses.service';

@Controller('category-expenses')
export class CategoryExpensesController {

    constructor(private readonly categoryExpensesService: CategoryExpensesService) {}


    @Post()
    async create(@Body() category: CategoryExpensesDto) {
        return this.categoryExpensesService.create(category);
    }

}
