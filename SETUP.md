# Setup Guide for OmniBusiness AI

## Quick Start

### 1. Install Dependencies

```bash
# Ensure you have pnpm installed
npm install -g pnpm

# Install all project dependencies
pnpm install
```

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb omnibusiness

# Your DATABASE_URL will be:
# postgresql://YOUR_USERNAME@localhost:5432/omnibusiness
```

**Option B: Docker**

```bash
# Run PostgreSQL in Docker
docker run --name omnibusiness-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=omnibusiness \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL will be:
# postgresql://postgres:postgres@localhost:5432/omnibusiness
```

**Option C: Cloud Service** (Recommended for production)

Use a managed PostgreSQL service like:
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Render](https://render.com)

### 3. Configure Environment Variables

**Backend (.env)**

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database - Update with your PostgreSQL URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/omnibusiness?schema=public"

# JWT - Generate a strong secret (use openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Anthropic AI - Get your key from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-xxxxx

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local)**

```bash
cd apps/frontend
cp .env.example .env.local
```

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run Database Migrations

```bash
# From project root
pnpm db:migrate

# Or from backend directory
cd apps/backend
pnpm db:migrate
```

This will:
- Create all database tables
- Set up relationships
- Apply indexes

### 5. Start Development Servers

**Option A: Start both servers at once**

```bash
# From project root
pnpm dev
```

**Option B: Start separately**

```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## Verification Steps

### 1. Check Backend

```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### 2. Test Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Test Login via Frontend

1. Navigate to http://localhost:3000
2. Click "Get Started"
3. Fill in registration form
4. You should be redirected to the dashboard

## Database Management

### Prisma Studio

View and edit your database with a GUI:

```bash
pnpm db:studio
```

Opens at http://localhost:5555

### Reset Database

**WARNING: This will delete all data!**

```bash
cd apps/backend
pnpm exec prisma migrate reset
```

### Create New Migration

```bash
cd apps/backend

# 1. Edit prisma/schema.prisma
# 2. Create migration
pnpm exec prisma migrate dev --name your_migration_name
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list

   # Docker
   docker ps
   ```

2. **Test connection:**
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/omnibusiness
   ```

3. **Check DATABASE_URL format:**
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
   ```

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Find process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Errors

```bash
# Regenerate Prisma Client
cd apps/backend
pnpm exec prisma generate
```

### pnpm Lock File Issues

```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clean all build artifacts
pnpm clean

# Rebuild
pnpm build
```

## Production Deployment

### Environment Variables for Production

Ensure these are set securely:

```env
NODE_ENV=production
DATABASE_URL=<your-production-db-url>
JWT_SECRET=<strong-random-secret>
ANTHROPIC_API_KEY=<your-api-key>
CORS_ORIGIN=<your-frontend-url>
```

### Build for Production

```bash
# Build all apps
pnpm build

# Start backend
cd apps/backend
pnpm start

# Frontend (Next.js)
cd apps/frontend
pnpm start
```

### Recommended Hosting

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Fly.io, AWS
- **Database**: Neon, Supabase, Railway, AWS RDS

## Next Steps

1. Create your first business via the dashboard
2. Explore the database schema in Prisma Studio
3. Check the API documentation in README.md
4. Review the plan.md for upcoming features

## Getting Help

- Check the main README.md for API documentation
- Review the plan.md for project structure
- Check GitHub Issues for known problems
