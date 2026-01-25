import { IsNotEmpty, IsString, MinLength } from "class-validator";


export default class CategoryExpensesDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;
}