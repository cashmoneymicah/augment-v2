import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationService } from '../config/configuration';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '7d',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signupDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        planType: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'user-1',
          email: 'test@test.com',
          planType: 'free',
        }),
        token: 'jwt-token',
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@test.com',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const signupDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const existingUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        planType: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        planType: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'user-1',
          email: 'test@test.com',
          planType: 'free',
        }),
        token: 'jwt-token',
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        planType: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        planType: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');

      expect(result).toEqual(expect.objectContaining({
        id: 'user-1',
        email: 'test@test.com',
        planType: 'free',
      }));
    });

    it('should return null if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent-user');

      expect(result).toBeNull();
    });
  });
});