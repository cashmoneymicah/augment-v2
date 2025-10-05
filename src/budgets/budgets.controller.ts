import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UsePipes } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateBudgetDto,
  CreateBudgetSchema,
  UpdateBudgetDto,
  UpdateBudgetSchema,
  GetBudgetsQueryDto,
  GetBudgetsQuerySchema,
  ComputeSpentDto,
  ComputeSpentSchema,
} from './dto/budgets.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(GetBudgetsQuerySchema))
  async getBudgets(
    @CurrentUser() user: any,
    @Query() query: GetBudgetsQueryDto,
  ) {
    return this.budgetsService.getBudgets(user.id, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateBudgetSchema))
  async createBudget(
    @CurrentUser() user: any,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.createBudget(user.id, createBudgetDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getBudgetStats(
    @CurrentUser() user: any,
    @Query('month') month?: string,
  ) {
    return this.budgetsService.getBudgetStats(user.id, month);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getBudgetCategories(@CurrentUser() user: any) {
    return this.budgetsService.getBudgetCategories(user.id);
  }

  @Get('months')
  @UseGuards(JwtAuthGuard)
  async getBudgetMonths(@CurrentUser() user: any) {
    return this.budgetsService.getBudgetMonths(user.id);
  }

  @Post('compute-spent')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(ComputeSpentSchema))
  async computeSpent(
    @CurrentUser() user: any,
    @Body() computeSpentDto: ComputeSpentDto,
  ) {
    const { month, category } = computeSpentDto;
    const spentAmount = await this.budgetsService.computeSpent(user.id, month, category);
    
    return {
      month,
      category,
      spentAmount,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getBudgetById(
    @CurrentUser() user: any,
    @Param('id') budgetId: string,
  ) {
    return this.budgetsService.getBudgetById(user.id, budgetId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UpdateBudgetSchema))
  async updateBudget(
    @CurrentUser() user: any,
    @Param('id') budgetId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.updateBudget(user.id, budgetId, updateBudgetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBudget(
    @CurrentUser() user: any,
    @Param('id') budgetId: string,
  ) {
    return this.budgetsService.deleteBudget(user.id, budgetId);
  }
}
