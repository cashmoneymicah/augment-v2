# Personal Finance Platform Backend API

A comprehensive backend API for personal finance management built with NestJS, TypeScript, and modern technologies.

## Tech Stack

- **Node.js 20+** with NestJS framework
- **TypeScript** in strict mode
- **Prisma ORM** + PostgreSQL database
- **Redis** (Upstash) for caching & BullMQ job queues
- **Plaid SDK v14+** for bank connections
- **JWT authentication** with HTTP-only cookies
- **Bcrypt** for password hashing (12 rounds)
- **Zod** for request validation
- **Winston** for logging

## Features

- 🔐 JWT Authentication with HTTP-only cookies
- 📧 Email verification system for user registration
- 🔄 Password reset flow via email
- 👤 User management and profiles
- 🏦 Bank account integration via Plaid (placeholder)
- 💰 Transaction management and categorization (placeholder)
- 📊 Account balance tracking (placeholder)
- 🔄 Background job processing with BullMQ
- 📝 Comprehensive logging
- ✅ Input validation with class-validator
- 🧪 Test suite with Jest

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis instance (local or Upstash)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration including:
# - DATABASE_URL (PostgreSQL connection)
# - SMTP settings for email functionality
# - JWT_SECRET for authentication
```

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/api/v1`

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user (requires email verification)
- `POST /api/v1/auth/login` - Login user (requires verified email)
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `DELETE /api/v1/users/profile` - Delete user account

### Health Check
- `GET /api/v1/health` - API health status

## Environment Variables

See `env.example` for all required environment variables.

## Database Schema

The application uses Prisma with PostgreSQL and includes models for:
- Users
- Accounts
- Transactions
- Categories
- Plaid Items

## Development

### Project Structure
```
src/
├── config/          # Configuration files
├── modules/         # Feature modules
│   ├── auth/        # Authentication
│   ├── users/       # User management
│   ├── accounts/    # Account management
│   ├── transactions/ # Transaction handling
│   ├── categories/  # Category management
│   └── plaid/       # Plaid integration
├── common/          # Shared utilities
│   ├── logger/      # Winston logging
│   └── redis/       # Redis service
└── database/        # Database configuration
```

### Adding New Features

1. Create a new module in `src/modules/`
2. Define DTOs for request/response validation
3. Implement service logic
4. Add controller endpoints
5. Write tests
6. Update database schema if needed

## Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use conventional commit messages
4. Ensure all tests pass before submitting

## License

ISC
