import { Test, TestingModule } from '@nestjs/testing';
import { CategoryExpensesController } from './category-expenses.controller';

describe('CategoryExpensesController', () => {
  let controller: CategoryExpensesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryExpensesController],
    }).compile();

    controller = module.get<CategoryExpensesController>(CategoryExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
