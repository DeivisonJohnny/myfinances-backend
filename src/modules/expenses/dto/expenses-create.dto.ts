import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export default class ExpensesCreateDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    description: string;

    @IsNotEmpty()
    @IsString()
    date: string;

    @IsNotEmpty()
    @IsString()
    categoryExpensesId: string;

    
}