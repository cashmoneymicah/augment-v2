import { Controller, Get, Query, UseGuards, UsePipes } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  GetCashflowQueryDto,
  GetCashflowQuerySchema,
  GetSpendingByCategoryQueryDto,
  GetSpendingByCategoryQuerySchema,
  GetNetworthQueryDto,
  GetNetworthQuerySchema,
} from './dto/insights.dto';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('cashflow')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(GetCashflowQuerySchema))
  async getCashflow(
    @CurrentUser() user: any,
    @Query() query: GetCashflowQueryDto,
  ) {
    return this.insightsService.getCashflow(user.id, query);
  }

  @Get('spending-by-category')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(GetSpendingByCategoryQuerySchema))
  async getSpendingByCategory(
    @CurrentUser() user: any,
    @Query() query: GetSpendingByCategoryQueryDto,
  ) {
    return this.insightsService.getSpendingByCategory(user.id, query);
  }

  @Get('networth')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(GetNetworthQuerySchema))
  async getNetworth(
    @CurrentUser() user: any,
    @Query() query: GetNetworthQueryDto,
  ) {
    return this.insightsService.getNetworth(user.id, query);
  }

  @Get('spending-trends')
  @UseGuards(JwtAuthGuard)
  async getSpendingTrends(
    @CurrentUser() user: any,
    @Query('months') months?: string,
  ) {
    const monthsNum = months ? parseInt(months, 10) : 6;
    return this.insightsService.getSpendingTrends(user.id, monthsNum);
  }

  @Get('top-merchants')
  @UseGuards(JwtAuthGuard)
  async getTopMerchants(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.insightsService.getTopMerchants(user.id, month, limitNum);
  }
}
