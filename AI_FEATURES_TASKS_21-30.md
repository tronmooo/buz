# AI Features Tasks 21–30

This document outlines ten AI-driven workflows and prompt templates to extend OmniBusiness AI. Each task includes goals, required inputs, processing steps, and expected outputs to support implementation in the existing architecture.

## Task 21 – Renewal Date Detection for Licenses, Permits, Insurance, and IP
- **Goal:** Continuously detect upcoming renewals across regulatory and insurance documents and trigger timely alerts.
- **Data Inputs:**
  - Structured records in `licenses_permits`, `policies`, `contracts`, and file metadata (issue date, renewal cadence, jurisdiction, carrier/issuer).
  - Extracted text from uploaded documents via OCR + parsing.
  - Business calendar (holidays, working days) for lead-time calculations.
- **Workflow:**
  1. Nightly cron job queries records with `renewal_date`, `expiration_date`, or `term_end` within configurable windows (e.g., 30/60/90 days).
  2. For documents lacking explicit dates, run AI extractor over text/OCR to infer renewal cycles (e.g., “auto-renews annually unless terminated 30 days prior”).
  3. Normalize all dates to ISO with timezone-aware handling and align to business timezone.
  4. Apply lead-time rules by document type (e.g., insurance = 60 days, permits = 45 days, IP filings = 90 days) to set `alert_date`.
  5. Emit events to `ai_insights` + notification queue (email/SMS/Slack) with severity based on urgency and compliance impact.
- **Outputs:** Alert cards, calendar entries, and audit log entries linking to the source record and document snippet for verification.

## Task 22 – Contract PDF Reader: Extract `end_date` and `renewal_terms`
- **Goal:** Automate extraction of contract end dates and renewal language from uploaded PDFs.
- **Workflow:**
  1. Ingest PDF → run OCR (if scanned) → convert to text with page/section anchors.
  2. Chunk text by section headers and apply a contract-specific extraction prompt that returns JSON: `{ end_date, renewal_terms, notice_window_days, auto_renewal: boolean, source_snippet }`.
  3. Validate date formats, map relative terms (“12 months from Effective Date”) by locating Effective Date, and resolve to absolute date.
  4. Store extracted values in contract metadata table and attach `source_snippet` for human review.
  5. Flag low-confidence parses (<0.75 score) for manual confirmation in the UI.

## Task 23 – Prompt Template: Contract Summary Bullets
- **Purpose:** Summarize any contract into executive bullet points.
- **Template:**
  - System: “You are a contract analyst. Produce concise bullet points for busy business owners.”
  - Instructions:
    1. Output 5–8 bullets, each ≤20 words.
    2. Cover: parties, effective/end dates, payment terms, termination & renewal, obligations, liabilities/indemnities, key SLAs, penalties.
    3. Include 1 bullet for risks or unusual clauses.
    4. Use neutral tone; no legal advice; avoid speculation.
    5. Return Markdown bullets only; no intro/outro text.

## Task 24 – Compliance Doc Gaps (OSHA, HIPAA, PCI, SOC2)
- **Goal:** Detect missing mandatory compliance documents per business profile.
- **Workflow:**
  1. Profile business attributes (industry, employee count, handles PHI/PCI, SaaS status) from onboarding + existing records.
  2. Define required artifacts per framework (e.g., OSHA: injury log, safety training records; HIPAA: BAA, privacy notice; PCI: SAQ, quarterly scans; SOC2: policies, control evidence).
  3. Map uploaded files and policy records to these requirements using AI document classifier and keyword heuristics.
  4. Produce a gap report with statuses: `present`, `stale` (older than renewal cadence), or `missing`.
  5. Generate remediation actions (upload, request signatures, schedule assessment) and push to tasks/notifications.

## Task 25 – Prompt Template: Employee Policy Drafts
- **Purpose:** Generate first-draft handbook policies.
- **Template:**
  - System: “You are an HR policy writer producing clear, compliant drafts.”
  - Inputs: policy topic, jurisdiction/state, company size/industry, tone (formal/friendly), optional constraints (unionized, remote-first).
  - Instructions:
    1. Output Markdown with title + 4–6 sections (Purpose, Scope, Responsibilities, Procedures, Consequences, References).
    2. Keep plain language at 9th-grade readability; avoid legal advice phrasing.
    3. Add placeholders where company-specific details are needed (e.g., `[Insert time-off accrual]`).
    4. Include compliance considerations specific to jurisdiction/industry when relevant.

## Task 26 – Auto-Tag Uploaded Documents by Type
- **Goal:** Automatically classify documents into contract, license/permit, policy, invoice, receipt, ID, or other.
- **Workflow:**
  1. On upload, capture filename, MIME type, and run OCR/text extraction.
  2. Apply lightweight rules (e.g., presence of “Invoice #”, “Permit No.”) to seed labels.
  3. Run an AI classifier prompt returning `{document_type, confidence, rationale, suggested_tags[]}`.
  4. Persist tags to `files` metadata; if confidence < threshold, request user confirmation.
  5. Expose tags for search filters and downstream workflows (renewal detection, compliance gaps).

## Task 27 – Monthly Renewal Alert List
- **Goal:** Aggregate all renewal events into a monthly digest and rolling calendar.
- **Workflow:**
  1. Daily job aggregates normalized renewal and expiration dates from licenses, permits, insurance, contracts, and policies.
  2. Bucket events by month (current + next two months) and sort by urgency/impact.
  3. Generate AI-written digest with: item, due date, lead-time status, risk level, and next action.
  4. Publish to dashboard widget, email summary, and ICS calendar feed; log in `ai_insights`.
  5. Include quick links to source documents and assigned owners for accountability.

## Task 28 – Spec: AI-Generated Legal Summaries
- **Must Include:**
  - Parties, effective/end dates, governing law, payment/fees, termination & renewal terms, obligations/deliverables, liability/indemnity caps, SLAs, notice requirements, and unusual clauses.
- **Must Exclude:**
  - Legal advice, subjective risk ratings without evidence, confidential or PII beyond what is in the document, and speculation about intent.
- **Quality Guardrails:**
  - Cite source sections or quote snippets for each key point.
  - Mark low-confidence items explicitly; avoid hallucinating missing data.
  - Enforce concise bullets (≤25 words) and neutral tone.

## Task 29 – Issue & Expiration Extraction from Scanned PDFs
- **Goal:** Robustly capture issuance and expiration dates from low-quality scans.
- **Workflow:**
  1. Apply OCR with noise reduction and deskew; run multiple OCR passes if low confidence.
  2. Detect date candidates via regex + locale-aware parsing; map to nearest labels (“Issue Date”, “Expires”, “Valid Until”).
  3. Cross-check against document type heuristics (e.g., driver license, permit, certificate) to validate ranges (expiration after issue, not >10 years unless passport).
  4. Use AI parser to confirm final `{issue_date, expiration_date, confidence, source_snippet}`.
  5. Flag anomalies (expiration before issue) and route to manual review queue.

## Task 30 – Compliance Risk Scoring (1–10)
- **Goal:** Quantify compliance exposure based on missing docs and renewal status.
- **Inputs:** Gap report from Task 24, renewal urgency from Tasks 21/27, business profile (industry, jurisdictions, data types handled).
- **Scoring Logic:**
  - Start at 10 (high risk) when critical artifacts are missing or expired; decrease as coverage improves.
  - Weighted factors: critical doc absence (±3), upcoming renewals <30 days (±2), stale policies (>12 months) (±1), industry penalty (regulated sectors +1–2).
  - Normalize to 1–10 with descriptive banding: 8–10 High, 5–7 Medium, 1–4 Low.
- **Workflow:**
  1. Run weekly risk computation job combining gap report + renewal calendar.
  2. Generate AI explanation: key drivers, top 3 remediation steps, projected score if completed.
  3. Store score/time series in `ai_insights` and show trendline in compliance dashboard.

