# OmniBusiness AI

A unified business management platform with AI capabilities. Manage finance, sales, marketing, operations, HR, and more - all in one place with intelligent automation.

## Features (Phase 0 - Foundation)

- **Multi-tenant Architecture**: Support for multiple businesses per user
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Comprehensive Database Schema**: Ready for finance, CRM, marketing, HR, operations, and more
- **Modern Tech Stack**: Next.js, Express, TypeScript, Prisma, PostgreSQL
- **Monorepo Structure**: Organized with pnpm workspaces

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form** - Form validation

### Backend
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **Winston** - Logging
- **Zod** - Schema validation

### AI Integration
- **Anthropic Claude** - LLM for AI features

## Project Structure

```
.
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # App router pages
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── store/
│   │   └── package.json
│   └── backend/           # Express API
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── utils/
│       │   └── lib/
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
├── packages/              # Shared packages (future)
└── package.json           # Root package.json

```

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** >= 14

### Installation

1. **Clone the repository**
   ```bash
   cd bussiness
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Backend (.env):
   ```bash
   cd apps/backend
   cp .env.example .env
   ```

   Edit `apps/backend/.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Strong secret key for JWT
   - `ANTHROPIC_API_KEY` - Your Anthropic API key

   Frontend (.env.local):
   ```bash
   cd apps/frontend
   cp .env.example .env.local
   ```

4. **Set up the database**
   ```bash
   # From the project root
   pnpm db:migrate
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   pnpm dev
   ```

   Or start them separately:
   ```bash
   # Backend (http://localhost:3001)
   cd apps/backend
   pnpm dev

   # Frontend (http://localhost:3000)
   cd apps/frontend
   pnpm dev
   ```

### Database Commands

```bash
# Run migrations
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Generate Prisma Client
cd apps/backend
pnpm db:generate
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (requires auth)

### Business
- `GET /api/businesses` - List user's businesses (requires auth)
- `POST /api/businesses` - Create business (requires auth)
- `GET /api/businesses/:id` - Get business details (requires auth)
- `PATCH /api/businesses/:id` - Update business (requires auth, OWNER/MANAGER only)
- `DELETE /api/businesses/:id` - Delete business (requires auth, OWNER only)

## User Roles

- **OWNER** - Full access, can delete business
- **MANAGER** - Can manage business settings and data
- **STAFF** - Can view and edit assigned data
- **ACCOUNTANT** - Can view financial data, limited editing
- **VIEWER** - Read-only access

## Development Workflow

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/backend
pnpm build
```

### Linting

```bash
pnpm lint
```

### Cleaning Build Artifacts

```bash
pnpm clean
```

## Next Steps (Roadmap)

### Phase 1 - Data & Core CRUD
- [ ] Implement CRUD for contacts, invoices, transactions
- [ ] File upload and storage
- [ ] Basic search and filters

### Phase 2 - Integrations & Sync
- [ ] Email integration
- [ ] Bank account integration
- [ ] Social media integration
- [ ] Sync framework and webhooks

### Phase 3 - AI Layer (Read & Summarize)
- [ ] Global AI search and Q&A
- [ ] Weekly summaries
- [ ] Financial snapshots
- [ ] Document summarization

### Phase 4 - AI Content & Suggestions
- [ ] Email draft generator
- [ ] Social post generator
- [ ] Insight cards and recommendations
- [ ] KPI analytics dashboard

### Phase 5 - AI Actions
- [ ] AI-recommended actions with approval
- [ ] Automated email sending
- [ ] Invoice generation
- [ ] Task creation and scheduling

## Contributing

This is a private project. Please contact the project owner for contribution guidelines.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
