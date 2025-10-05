import { z } from 'zod';

export const GetCashflowQuerySchema = z.object({
  period: z.enum(['3months', '6months', '12months', 'all']).default('12months'),
});

export type GetCashflowQueryDto = z.infer<typeof GetCashflowQuerySchema>;

export const GetSpendingByCategoryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export type GetSpendingByCategoryQueryDto = z.infer<typeof GetSpendingByCategoryQuerySchema>;

export const GetNetworthQuerySchema = z.object({
  asOfDate: z.string().datetime().optional(),
});

export type GetNetworthQueryDto = z.infer<typeof GetNetworthQuerySchema>;
