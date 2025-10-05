import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CategorizationService } from './categorization/categorization.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, CategorizationService, PrismaService],
  exports: [TransactionsService, CategorizationService],
})
export class TransactionsModule {}
