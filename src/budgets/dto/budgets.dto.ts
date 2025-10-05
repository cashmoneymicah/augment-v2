import { z } from 'zod';

export const CreateBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  category: z.string().min(1),
  limitAmount: z.number().positive('Limit amount must be positive'),
});

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;

export const UpdateBudgetSchema = z.object({
  limitAmount: z.number().positive('Limit amount must be positive').optional(),
});

export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;

export const GetBudgetsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type GetBudgetsQueryDto = z.infer<typeof GetBudgetsQuerySchema>;

export const ComputeSpentSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  category: z.string().min(1),
});

export type ComputeSpentDto = z.infer<typeof ComputeSpentSchema>;
