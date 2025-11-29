# Changelog

All notable changes to OmniBusiness AI will be documented in this file.

## [Unreleased]

### Added
- Added `plan.md` and aligned roadmap checkboxes with current implementation status.
- Added dashboard top bar (global search + AI prompt) and right-side context panel wired to AI ask/insights endpoints.
- Added shared AI hooks (`useAISummary`, `useAIInsights`, `useAIAsk`) and reused them in the AI page and dashboard shell.
- Added global search results page (`/dashboard/search`) that queries contacts and customers with search terms from the top bar.
- Added Identity & Legal schemas: BusinessIdentity, LicensePermit, ArticlesOfIncorporation, Contract, InsurancePolicy, IntellectualProperty, ComplianceDocument, InternalPolicy with business scoping.

## [0.1.0] - Phase 0: Foundation - 2025-11-29

### Added

#### Project Structure
- Monorepo setup with pnpm workspaces
- Root configuration (package.json, tsconfig.json, .gitignore, .prettierrc)
- Separate apps for frontend and backend
- GitHub Actions CI/CD workflow

#### Backend
- Express server with TypeScript
- Comprehensive Prisma schema with all core modules:
  - Users and authentication
  - Businesses and memberships (multi-tenant)
  - Legal entities
  - Finance (accounts, transactions, invoices, bills, customers, vendors)
  - HR (employees)
  - Sales & CRM (leads, contacts, deals)
  - Marketing (campaigns, social accounts, posts)
  - Customer Support (tickets)
  - Files and documents
  - Events and audit log
  - Integrations framework
  - Analytics (KPI definitions, AI insights)
- JWT-based authentication system
- Role-based access control (OWNER, MANAGER, STAFF, ACCOUNTANT, VIEWER)
- Password hashing with bcrypt
- Request validation with Zod
- Error handling middleware
- Winston logging
- CORS and security headers (Helmet)
- Health check endpoint
- RESTful API routes:
  - Authentication (register, login, logout, me)
  - Business management (CRUD with permissions)

#### Frontend
- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS styling
- React Query for data fetching
- Zustand for state management
- Axios API client with interceptors
- Authentication pages (login, register)
- Dashboard page
- Auth hooks and store
- Responsive layout
- Error handling

#### Database
- PostgreSQL with Prisma ORM
- Complete schema for all planned modules
- Indexes for performance
- Cascading deletes
- Multi-tenant architecture

#### Documentation
- Comprehensive README.md with:
  - Feature overview
  - Tech stack details
  - Project structure
  - Getting started guide
  - API documentation
  - Development workflow
  - Roadmap
- Detailed SETUP.md with:
  - Step-by-step installation
  - Database setup options
  - Environment configuration
  - Verification steps
  - Troubleshooting guide
  - Production deployment guide
- CHANGELOG.md (this file)
- Environment variable examples

#### Developer Experience
- Hot reload for both frontend and backend
- Prisma Studio for database management
- Parallel development server startup
- Centralized scripts in root package.json
- TypeScript for type safety
- Prettier for code formatting
- ESLint configuration

### Technical Decisions

- **Monorepo**: Chosen for easier code sharing and unified versioning
- **Prisma**: Selected for type-safe database access and great DX
- **JWT**: Stateless authentication for scalability
- **Next.js App Router**: Latest routing paradigm from Next.js
- **Zustand**: Lightweight state management vs Redux
- **Express**: Mature, flexible backend framework
- **Anthropic Claude**: Chosen as AI provider per requirements

## [0.2.0] - Phase 1: Data & Core CRUD - 2025-11-29

### Added

#### Backend API
- **Contacts Controller**: Full CRUD operations with pagination and search
  - Create, read, update, delete contacts
  - Search by name, email, company
  - Permission-based access control
  - Event logging for all actions
- **Invoices Controller**: Complete invoice management
  - Create invoices with line items
  - Track status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
  - Automatic total calculations
  - Customer relationships
  - Status-based filtering
- **Transactions Controller**: Financial transaction tracking
  - Income, expense, and transfer tracking
  - Automatic account balance updates
  - Date range filtering
  - Category and account filtering
  - Reconciliation support
- **File Upload System**:
  - Multer integration for file uploads
  - Support for images, PDFs, documents, spreadsheets
  - File type detection
  - Storage management
  - Tagging system
  - 10MB file size limit (configurable)

#### Frontend UI Components
- **Reusable Components**:
  - Button component with variants (primary, secondary, outline, danger, ghost)
  - Input component with labels, errors, and helper text
  - Table component with sorting and pagination
  - Modal component with sizes and keyboard support
  - Card component for consistent layouts
- **Dashboard Layout**:
  - Sidebar navigation with icons
  - Active page highlighting
  - User info display
  - Logout functionality
  - Responsive design
- **Business Management**:
  - Business selection dropdown
  - Create new business modal
  - Business context management with Zustand
  - Automatic slug generation

#### Frontend Pages
- **Dashboard**:
  - Business selector and creation
  - Statistics cards (contacts, invoices, revenue)
  - Quick actions
  - Welcome state for new users
- **Contacts Page**:
  - Contact list with search
  - Create contact modal
  - Table view with company and position info
  - Real-time search functionality
- **Invoices Page**:
  - Invoice statistics (total, outstanding, overdue, paid)
  - Empty state with call-to-action
  - Prepared for invoice CRUD (UI ready)
- **Transactions Page**:
  - Income vs expense tracking
  - Net cash flow display
  - Monthly statistics
  - Empty state with call-to-action
- **Files Page**:
  - Upload interface
  - Storage usage tracking
  - Empty state with call-to-action
- **Settings Page**:
  - Business information management
  - Account settings
  - Security options (2FA placeholder)
  - Danger zone for business deletion

#### API Routes
- `GET/POST /api/businesses/:id/contacts`
- `GET/PATCH/DELETE /api/businesses/:id/contacts/:contactId`
- `GET/POST /api/businesses/:id/invoices`
- `GET/PATCH/DELETE /api/businesses/:id/invoices/:invoiceId`
- `GET/POST /api/businesses/:id/transactions`
- `GET/PATCH/DELETE /api/businesses/:id/transactions/:transactionId`
- `POST /api/businesses/:id/files`
- `GET/DELETE /api/businesses/:id/files/:fileId`

#### Data Management
- Pagination support for all list endpoints
- Search functionality for contacts
- Filtering by status, date ranges, categories
- Automatic event logging for all CRUD operations
- Balance management for transactions

### Technical Improvements
- Lucide React icons for consistent iconography
- React Hook Form ready for complex forms
- Zustand persist middleware for business context
- API hooks pattern for data fetching
- Error handling in API hooks
- Loading states throughout UI

## [Unreleased] - Future Phases

### Planned for Phase 2
- Complete invoice and transaction forms
- Customer management
- Account management

### Planned for Phase 2
- Email integration
- Banking integration
- Social media integration
- Webhook framework

### Planned for Phase 3
- Global AI search
- Business summaries
- Financial insights
- Document summarization

### Planned for Phase 4
- AI content generation
- Recommendation system
- KPI analytics dashboard

### Planned for Phase 5
- AI-powered automation
- Automated actions with approval
- Task scheduling
