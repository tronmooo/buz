# Identity & Legal Micro Development Task Prompts

## Data Model (10 tasks)
1. Create a small table for storing basic business identity info: name, EIN, entity type, formation date. Include field types only.
2. Add fields to the business_identity table for state registrations and renewal dates. No relationships yet.
3. Create a table for licenses and permits with fields: license_name, license_number, renewal_date, issuing_agency, status.
4. Create a table for storing Articles of Incorporation documents: file_id, uploaded_at, business_id. No logic. Just schema.
5. Create a basic table for contracts with fields: contract_title, party, start_date, end_date, renewal_terms, file_id.
6. Create a table for insurance policies with fields: policy_number, provider, coverage_type, premium_amount, renewal_date.
7. Create a table for intellectual property: ip_type, registration_number, jurisdiction, expiration_date, file_id.
8. Create a table for compliance documents: doc_type, authority, expiration_date, file_id, status.
9. Create a table for employee handbooks and internal policies: policy_name, version, effective_date, file_id.
10. Add business_id foreign keys to every Identity & Legal table created so far.

## API / CRUD (10 tasks)
11. Create API endpoints for CRUD on business_identity. Only list the routes and request bodies.
12. Create CRUD API endpoints for licenses and permits. Include validation rules.
13. Create endpoints for uploading and retrieving Articles of Incorporation documents.
14. Create CRUD endpoints for contracts with filtering by renewal_date.
15. Create CRUD endpoints for insurance policies with sorting by renewal_date.
16. Create CRUD endpoints for intellectual property assets. Include search by registration number.
17. Create CRUD endpoints for compliance documents with a status field filter.
18. Create CRUD endpoints for internal policies (employee handbook). Include versioning.
19. Create a unified endpoint to list all documents in Identity & Legal across all tables.
20. Add RBAC rules defining which roles can modify Identity & Legal data.

## AI Features (10 tasks)
21. Create a system for detecting approaching renewal dates for licenses, permits, insurance, and IP.
22. Write a small workflow where AI reads a contract PDF and extracts end_date and renewal_terms.
23. Create an AI prompt template for summarizing contracts into bullet points.
24. Create a workflow where AI flags missing mandatory compliance docs (OSHA, HIPAA, PCI, SOC2).
25. Create a prompt template for generating employee policy drafts for the handbook.
26. Create a workflow where AI auto-tags uploaded documents by type (contract, license, policy).
27. Create logic where AI analyzes all renewal dates and generates a monthly alert list.
28. Create a short spec for AI-generated legal summaries: what info it must include and exclude.
29. Create a workflow for extracting issue date and expiration date from scanned PDFs.
30. Create a workflow where AI scores compliance risk on a scale of 1–10 based on missing docs and renewals.
