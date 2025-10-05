import { Module } from '@nestjs/common';
import { PlaidController } from './plaid.controller';
import { PlaidService } from './plaid.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PlaidController],
  providers: [PlaidService, PrismaService],
  exports: [PlaidService],
})
export class PlaidModule {}
