import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export type SignupDto = z.infer<typeof SignupSchema>;
