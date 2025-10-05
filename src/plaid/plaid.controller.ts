import { Controller, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { PlaidService } from './plaid.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ExchangePublicTokenDto, ExchangePublicTokenSchema, SyncTransactionsDto, SyncTransactionsSchema } from './dto/plaid.dto';

@Controller('plaid')
export class PlaidController {
  constructor(private readonly plaidService: PlaidService) {}

  @Post('link-token')
  @UseGuards(JwtAuthGuard)
  async createLinkToken(@CurrentUser() user: any) {
    const result = await this.plaidService.createLinkToken(user.id);
    return {
      link_token: result.link_token,
    };
  }

  @Post('exchange')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(ExchangePublicTokenSchema))
  async exchangePublicToken(
    @Body() exchangeDto: ExchangePublicTokenDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.plaidService.exchangePublicToken(
      exchangeDto.public_token,
      user.id,
    );
    
    return {
      success: result.success,
      accounts: result.accounts,
    };
  }

  @Post('sync-transactions')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(SyncTransactionsSchema))
  async syncTransactions(
    @Body() syncDto: SyncTransactionsDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.plaidService.syncTransactions(syncDto.account_id);
    
    return {
      success: result.success,
      transactions: result.transactions,
    };
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    // Handle Plaid webhooks
    // This would typically process different webhook types like:
    // - ITEM_UPDATE
    // - TRANSACTIONS_REMOVED
    // - ERROR
    // etc.
    
    return {
      success: true,
      message: 'Webhook received',
    };
  }
}
