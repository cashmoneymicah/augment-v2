import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UsePipes } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateTransactionDto,
  CreateTransactionSchema,
  UpdateTransactionDto,
  UpdateTransactionSchema,
  GetTransactionsQueryDto,
  GetTransactionsQuerySchema,
} from './dto/transactions.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(GetTransactionsQuerySchema))
  async getTransactions(
    @CurrentUser() user: any,
    @Query() query: GetTransactionsQueryDto,
  ) {
    return this.transactionsService.getTransactions(user.id, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(CreateTransactionSchema))
  async createTransaction(
    @CurrentUser() user: any,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(user.id, createTransactionDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getTransactionStats(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.getTransactionStats(user.id, startDate, endDate);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getTransactionCategories(@CurrentUser() user: any) {
    return this.transactionsService.getTransactionCategories(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTransactionById(
    @CurrentUser() user: any,
    @Param('id') transactionId: string,
  ) {
    return this.transactionsService.getTransactionById(user.id, transactionId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UpdateTransactionSchema))
  async updateTransaction(
    @CurrentUser() user: any,
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(user.id, transactionId, updateTransactionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(
    @CurrentUser() user: any,
    @Param('id') transactionId: string,
  ) {
    return this.transactionsService.deleteTransaction(user.id, transactionId);
  }
}
