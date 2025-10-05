import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  accountId: z.string().min(1),
  postedAt: z.string().datetime(),
  amount: z.number(),
  type: z.enum(['debit', 'credit']),
  merchant: z.string().optional(),
  normalizedName: z.string().optional(),
  rawCategory: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  isManual: z.boolean().default(true),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = z.object({
  category: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;

export const GetTransactionsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  accountId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type GetTransactionsQueryDto = z.infer<typeof GetTransactionsQuerySchema>;
