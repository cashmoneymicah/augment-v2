import { User } from '@prisma/client';

export class UserEntity implements User {
  id!: string;
  email!: string;
  passwordHash!: string;
  planType!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  // Remove sensitive data when returning user data
  toJSON(): Omit<UserEntity, 'passwordHash' | 'toJSON'> {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
