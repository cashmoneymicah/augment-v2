import { z } from 'zod';

export const ExchangePublicTokenSchema = z.object({
  public_token: z.string().min(1),
});

export type ExchangePublicTokenDto = z.infer<typeof ExchangePublicTokenSchema>;

export const SyncTransactionsSchema = z.object({
  account_id: z.string().min(1),
});

export type SyncTransactionsDto = z.infer<typeof SyncTransactionsSchema>;
