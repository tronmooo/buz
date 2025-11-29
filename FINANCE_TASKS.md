# Finance Micro Development Task Prompts

## Data Model (10 tasks)
1. Create a chart of accounts table with fields: account_id, name, type (asset/liability/equity/revenue/expense), parent_account_id.
2. Add a transactions table capturing: transaction_id, date, description, amount, currency, account_id, counterparty.
3. Create a journal_entries table with fields: entry_id, posted_at, memo, created_by, status.
4. Add journal_entry_lines table linking to journal_entries with fields: line_id, entry_id, account_id, debit, credit.
5. Create a budgets table with fields: budget_id, fiscal_year, department, amount, version.
6. Add a recurring_expenses table with fields: name, cadence (monthly/quarterly/annual), amount, next_due_date, vendor.
7. Create an invoices table with fields: invoice_id, customer_id, issue_date, due_date, total, status.
8. Add payments table with fields: payment_id, invoice_id, received_date, amount, method, reference_number.
9. Create an approvals table for expenses with fields: approval_id, requester_id, approver_id, amount, status, requested_at, decided_at.
10. Add audit_trail table capturing: event_id, entity_type, entity_id, action, performed_by, performed_at, metadata (JSON).

## API / CRUD (10 tasks)
11. Define CRUD endpoints for chart of accounts with validation on type and parent references.
12. Create endpoints for posting transactions with double-entry validation (sum debits = sum credits).
13. Add endpoints for creating and updating budgets with versioning rules.
14. Build invoice CRUD endpoints with filtering by status and due_date.
15. Create payment endpoints ensuring amount does not exceed invoice balance.
16. Add endpoints for recurring expenses including pause/resume actions.
17. Create approvals API with actions: request, approve, reject; enforce role-based checks.
18. Add endpoint to fetch audit trail events with pagination and date filters.
19. Create report endpoint that returns trial balance grouped by account type.
20. Define RBAC matrix specifying which roles can create, approve, and post financial entries.

## AI Features (10 tasks)
21. Build a workflow to categorize uncoded transactions into chart of accounts using ML suggestions.
22. Create prompt template for explaining variances between actuals and budget in bullet points.
23. Add workflow where AI flags invoices likely to be paid late based on customer history.
24. Create prompt for summarizing a month-end close checklist tailored to the ledger data.
25. Build logic to detect duplicate invoices using fuzzy matching on vendor, amount, and date.
26. Add AI workflow that extracts invoice totals and due dates from uploaded PDF invoices.
27. Create a monthly cash flow forecast generator using historical transactions and seasonality.
28. Define AI rules to highlight abnormal spend spikes by department versus prior periods.
29. Add workflow for generating approval recommendations based on amount, vendor risk, and budget alignment.
30. Create AI scoring model for payment risk (1–10) using days-past-due, disputes, and credit notes.
