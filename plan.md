# OmniBusiness AI – plan.md

## 0. High-Level Vision

Build a single platform where a business can:
- Store and link **all records** (legal, financial, HR, ops, docs, social, etc.)
- Connect to **external tools** (banking, social media, email, CRM, etc.)
- Let **AI act as analyst + assistant + operator**, doing:
  - Summaries
  - Predictions
  - Recommendations
  - Auto-generated content
  - Automated actions (send emails, create invoices, schedule posts, etc.)

Goal: One app that can answer:
> “What’s going on in my business, what should I worry about, and what should be done next?”  
> and then actually does it.

---

## 1. Core Modules & Scope

### 1.1 Primary Modules (MVP)

- [ ] **Identity & Legal**
  - Business info, registrations, licenses, contracts, policies

- [ ] **Finance & Accounting**
  - Transactions, invoices, receipts, P&L, cashflow, AR/AP

- [ ] **HR / People**
  - Employees, roles, payroll meta, time-off, performance notes

- [ ] **Operations & Inventory**
  - SOPs, inventory, vendors, maintenance, workflows

- [ ] **Sales & CRM**
  - Leads, deals, customers, pipelines, activities

- [ ] **Marketing & Social**
  - Campaigns, posts, ads, analytics, content calendar

- [ ] **Customer Support**
  - Tickets, FAQs, conversations, feedback

- [ ] **Documents & Knowledge**
  - All documents (PDFs, Word, spreadsheets), SOPs, notes

- [ ] **Analytics & Strategy**
  - KPIs, dashboards, goals, alerts, AI insights

---

## 2. Architecture Overview

### 2.1 Suggested Stack (can be adjusted)

- **Frontend**
  - React / Next.js or similar SPA
  - Component library + charts

- **Backend**
  - Node/TypeScript or similar
  - REST/GraphQL API

- **Database**
  - Postgres or equivalent relational DB

- **Storage**
  - Object storage for documents, images, exports

- **AI Layer**
  - LLM for:
    - Summarization & Q&A over company data
    - Content generation (emails, posts, reports)
    - Agents for task execution

- **Integrations Layer**
  - Separate microservices / workers that:
    - Poll APIs
    - Listen to webhooks
    - Normalize external data into internal models

### 2.2 Core Principles

- [x] All data is **normalized** into internal schemas
- [x] **Audit logs** for AI actions and integrations
- [x] Clear **permissions & roles** (Owner, Manager, Staff, Accountant)
- [ ] All entities are **taggable** and cross-linkable
- [x] AI access is **scoped** by role and permissions

---

## 3. Data Model (High-Level)

### 3.1 Global

- [x] `businesses`
- [x] `users`
- [x] `memberships` (user ↔ business, role)
- [x] `integrations` (type, auth config)
- [x] `events` (system & AI events, audit log)
- [x] `files` (documents, images, metadata, links)

### 3.2 Identity & Legal

- [x] `legal_entities` (DBA, LLC, Corp)
- [x] `licenses_permits`
- [x] `contracts` (vendor, client, internal)
- [x] `policies` (employee handbook, compliance docs)

### 3.3 Finance

- [x] `accounts` (bank, credit, cash)
- [x] `transactions`
- [x] `invoices`
- [x] `bills`
- [x] `vendors`
- [x] `customers`
- [x] `budget_lines`
- [x] `tax_records`

### 3.4 HR / People

- [x] `employees`
- [x] `positions`
- [x] `payroll_records` (meta only; no actual payment processing in v1)
- [x] `time_off_requests`
- [x] `performance_notes`
- [x] `training_items`

### 3.5 Operations & Inventory

- [x] `sops`
- [x] `inventory_items`
- [x] `inventory_movements`
- [x] `purchase_orders`
- [x] `equipment`
- [x] `maintenance_events`
- [x] `vendors` (shared with finance)

### 3.6 Sales & CRM

- [x] `leads`
- [x] `contacts`
- [x] `deals`
- [x] `pipelines`
- [x] `activities` (calls, emails, meetings)

### 3.7 Marketing & Social

- [x] `campaigns`
- [x] `ad_accounts`
- [x] `ad_sets`
- [x] `ad_creatives`
- [x] `social_accounts`
- [x] `posts`
- [x] `social_metrics` (engagement, reach, etc.)

### 3.8 Support

- [x] `tickets`
- [x] `ticket_messages`
- [x] `support_channels` (email, chat, phone)
- [x] `feedback_entries`

### 3.9 Analytics & Strategy

- [x] `kpi_definitions`
- [x] `kpi_values`
- [x] `goals`
- [x] `ai_insights` (generated suggestions, risk alerts)

---

## 4. AI Capabilities (MVP)

### 4.1 Read & Answer

- [ ] Global AI Search:
  - “Ask anything about your business”
  - Reads from all modules (finance, HR, sales, etc.)

- [ ] Summaries:
  - Weekly summary: “What happened this week?”
  - Financial summary: “How’s cash flow, AR/AP?”
  - Sales summary: “Pipeline status, closed deals”

### 4.2 Generate Content

- [ ] Email drafts:
  - Invoices, follow-ups, cold outreach
- [ ] Internal docs:
  - SOP drafts, policy drafts, job descriptions
- [ ] Marketing content:
  - Post ideas, captions, ad copy, subject lines

### 4.3 Predict & Recommend

- [ ] Risk alerts:
  - “Cash flow might be negative in 30 days”
  - “License is expiring in 2 weeks”
- [ ] Sales:
  - “These leads are most likely to close”
- [ ] Ops:
  - “You are low on inventory for X”

### 4.4 Act (with approval)

- [ ] AI Suggestions with “Apply” buttons:
  - Generate & send email (user confirms)
  - Create invoice
  - Schedule a social post
  - Create a task / reminder
- [ ] Logged as `ai_actions` in `events` table

---

## 5. Integrations – Phase 1

Start with low-friction, high value integrations.

- [ ] **Accounting/Finance**
  - Banking API (read-only)
  - Invoice/Expense tools (export/import)

- [ ] **Email**
  - Business email provider
  - Sync inbox & sent mail for CRM + support

- [ ] **Calendars**
  - Sync events for meetings, follow-ups

- [ ] **Social Media**
  - Scheduler + analytics for 1–2 platforms

- [ ] **File Storage**
  - Connect cloud storage OR use built-in storage
  - Index PDFs, docs for AI search

Each integration requires:
- [ ] OAuth/auth config screen
- [ ] Background sync job
- [ ] Mapping to internal tables
- [ ] Logging of sync activity and errors

---

## 6. UX & Feature Flow (MVP)

### 6.1 Global Layout

- [x] Left sidebar: Modules (Dashboard, Finance, Sales, etc.)
- [x] Top bar: Global search, AI command box (wired to AI ask endpoint)
- [x] Main panel: Tables, forms, dashboards
- [x] Right panel: Contextual AI assistant & insights (shows quick answers + recent insights)

### 6.2 Key Flows

#### 6.2.1 Onboarding Flow

- [x] Create business
- [x] Basic business info
- [ ] Connect integrations (email, bank, social, etc.)
- [ ] Import initial data (CSV, uploads)
- [ ] AI-generated “Business Overview” card

#### 6.2.2 Daily Dashboard

- [ ] “Today’s Alerts”
  - Invoices due
  - Cash flow risk
  - Renewals
  - Suggested actions
- [ ] Quick actions
  - “Create invoice”
  - “Send follow-up”
  - “Post to social”
- [ ] AI panel:
  - “What should I focus on today?”

#### 6.2.3 AI Ask Bar

User: `What happened in my business last week?`  
System:
- [ ] Run aggregated queries across:
  - Transactions
  - Deals
  - Tickets
  - Campaigns
- [ ] Generate narrative summary
- [ ] Include quick links to related views

---

## 7. Build Phases

### Phase 0 – Foundation

- [x] Define MVP scope & modules
- [x] Choose stack & hosting
- [x] Set up repo, CI/CD
- [x] Base UI shell (layout, theming)
- [x] Base auth (sign up, login, businesses, roles)

### Phase 1 – Data & Core CRUD

- [x] Implement DB schema for:
  - Businesses, users, memberships
  - Finance basics (accounts, transactions, invoices)
  - CRM basics (contacts, leads, deals)
  - Docs & files
- [x] CRUD screens for:
  - Contacts
  - Invoices
  - Transactions (manual)
- [x] File upload & tagging
- [x] Basic search & filters

### Phase 2 – Integrations & Sync

- [ ] Integrations framework (tokens, webhooks, sync jobs)
- [ ] Implement 1–2 integrations (e.g. email + bank)
- [ ] Show synced data in standard tables
- [ ] Error handling + logs screen

### Phase 3 – AI Layer (Read & Summarize)

- [ ] Ingest + index data for AI (RAG setup)
- [ ] Global AI “Ask” bar
- [ ] Weekly summary generator
- [ ] Financial snapshots with narrative description
- [ ] Doc summarization (contracts, policies, PDFs)

### Phase 4 – AI Content & Suggestions

- [ ] Email draft generator (from context)
- [ ] Social post generator with scheduler
- [ ] Insight cards:
  - “Top 3 things to pay attention to”
- [ ] KPI definitions + basic analytics dashboard

### Phase 5 – AI Actions

- [ ] AI recommended actions with explicit “Apply”:
  - Create invoice
  - Send email
  - Create task
- [ ] Action audit log (`ai_actions` table)
- [ ] Role-based approvals for AI actions

---

## 8. AI Agent Workflow (For Automation)

This section is for using AI agents to work through the plan.

### 8.1 Agent Rules

- [ ] Always update `plan.md` checkboxes as tasks complete
- [ ] Log significant changes in a `CHANGELOG.md`
- [ ] When stuck, generate a “PROBLEM.md” entry describing:
  - Context
  - Error
  - Suspected cause
  - Possible fixes

### 8.2 Agent Task Sequence (High-Level)

1. [x] Scaffold repo & base project
2. [x] Implement auth & multi-tenant business model
3. [x] Implement core DB schema
4. [x] Build base UI shell
5. [x] Implement Finance & CRM core CRUD
6. [ ] Add file upload & AI doc summaries
   - [x] File upload
   - [ ] AI doc summaries
7. [ ] Build global AI ask bar
8. [ ] Add first external integration (email or bank)
9. [ ] Implement dashboards & KPI views
10. [ ] Implement AI suggestions & action buttons

---

## 9. Security & Compliance Considerations

- [x] Role-based access control
- [x] Granular permissions per module
- [x] Audit log of:
  - User actions
  - Integrations
  - AI actions
- [ ] Encryption at rest & in transit
- [ ] Data export & deletion paths (per business)
- [ ] Legal docs: Terms, Privacy, DPA templates

---

## 10. Future Extensions (Post-MVP)

- [ ] Voice interface for “tell me about my business”
- [ ] Mobile app
- [ ] Multi-business agency mode (manage many clients)
- [ ] Industry-specific templates:
  - SaaS
  - E-commerce
  - Agencies
  - Local services
- [ ] Marketplace for “AI playbooks”:
  - Prebuilt workflows (e.g., “Invoice chasing,” “Social posting,” “Quarterly review”)

---

## 11. Open Questions (to refine later)

- [ ] Which industry to target first for best product-market fit?
- [ ] Which integrations are non-negotiable for v1?
- [ ] How opinionated should the workflows be vs. flexible?
- [ ] Pricing model: per seat, per business, or usage-based?
