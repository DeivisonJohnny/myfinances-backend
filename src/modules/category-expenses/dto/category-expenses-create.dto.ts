import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class CategoryExpensesCreateDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  name: string;

  @IsString({ message: 'A cor deve ser um texto' })
  @IsNotEmpty({ message: 'A cor é obrigatória' })
  @MinLength(3, { message: 'A cor deve ter no mínimo 3 caracteres' })
  color: string;

  @IsString({ message: 'O ícone deve ser um texto' })
  @IsNotEmpty({ message: 'O ícone é obrigatório' })
  @MinLength(3, { message: 'O ícone deve ter no mínimo 3 caracteres' })
  icon: string;
}
