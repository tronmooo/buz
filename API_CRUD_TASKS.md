# API / CRUD (Tasks 11-15)

## Task 11 – Business Identity CRUD
Only list the routes and request bodies.

**Routes**
- `GET /api/businesses/:businessId/business-identity` – List all identity records for the business.
- `GET /api/businesses/:businessId/business-identity/:identityId` – Retrieve a single identity record.
- `POST /api/businesses/:businessId/business-identity` – Create a business identity record.
- `PATCH /api/businesses/:businessId/business-identity/:identityId` – Update a business identity record.
- `DELETE /api/businesses/:businessId/business-identity/:identityId` – Remove a business identity record.

**Request body (POST/PATCH JSON)**
```json
{
  "legalName": "string",            // required
  "dbaName": "string",             // optional
  "entityType": "LLC",             // required, enum: SOLE_PROPRIETOR | LLC | CORPORATION | PARTNERSHIP | NONPROFIT
  "ein": "12-3456789",             // optional, US EIN format when provided
  "registrationNumber": "string",  // optional
  "state": "CA",                   // optional, 2-letter code when provided
  "country": "US",                 // optional, defaults to US
  "formationDate": "2024-01-15",   // optional ISO date
  "website": "https://example.com",// optional, valid URL
  "address": {                       // optional structured address
    "street": "string",
    "city": "string",
    "state": "CA",
    "postalCode": "string",
    "country": "US"
  },
  "metadata": { "notes": "string" } // optional JSON metadata
}
```

---

## Task 12 – Licenses and Permits CRUD (with validation)

**Routes**
- `GET /api/businesses/:businessId/licenses-permits` – List licenses and permits (supports query `status`, `type`, `expiresBefore`, `expiresAfter`).
- `GET /api/businesses/:businessId/licenses-permits/:licenseId` – Retrieve a license/permit.
- `POST /api/businesses/:businessId/licenses-permits` – Create a license/permit record.
- `PATCH /api/businesses/:businessId/licenses-permits/:licenseId` – Update a license/permit record.
- `DELETE /api/businesses/:businessId/licenses-permits/:licenseId` – Delete a license/permit record.

**Request body (POST/PATCH JSON) + validation rules**
```json
{
  "name": "Food Handler Permit",        // required, 3-100 chars
  "type": "PERMIT",                    // required, enum: LICENSE | PERMIT | CERTIFICATION
  "number": "ABC-12345",               // required, 3-50 chars, alphanumeric/hyphen allowed
  "issuingAuthority": "City of LA",    // required, 3-100 chars
  "issuedDate": "2024-02-01",          // required, ISO date <= today
  "expiryDate": "2025-02-01",          // optional, ISO date >= issuedDate
  "status": "ACTIVE",                  // required, enum: ACTIVE | PENDING | EXPIRED | SUSPENDED
  "documentId": "file_cuid",           // optional, must reference uploaded file ID
  "notes": "string",                   // optional, max 500 chars
  "metadata": { "category": "health" } // optional JSON
}
```
Validation:
- `name`, `type`, `number`, `issuingAuthority`, `issuedDate`, and `status` are required.
- `issuedDate` cannot be in the future; `expiryDate` must be on/after `issuedDate` when provided.
- `number` must be 3–50 characters, allowing letters, numbers, and hyphens.
- `status` must be one of: ACTIVE, PENDING, EXPIRED, SUSPENDED.

---

## Task 13 – Articles of Incorporation Upload & Retrieval

**Routes**
- `POST /api/businesses/:businessId/articles-of-incorporation` – Upload Articles of Incorporation (multipart/form-data).
- `GET /api/businesses/:businessId/articles-of-incorporation` – List uploaded Article documents with metadata.
- `GET /api/businesses/:businessId/articles-of-incorporation/:fileId` – Download/stream a specific Article document.

**Request body (POST multipart/form-data)**
```
file: binary (PDF or image)             // required
metadata: { "notes": "string" }      // optional JSON, if client supports multipart fields
```

---

## Task 14 – Contracts CRUD (filterable by renewal_date)

**Routes**
- `GET /api/businesses/:businessId/contracts?renewalDateFrom=YYYY-MM-DD&renewalDateTo=YYYY-MM-DD` – List contracts with optional renewal_date range filtering.
- `GET /api/businesses/:businessId/contracts/:contractId` – Retrieve a contract.
- `POST /api/businesses/:businessId/contracts` – Create a contract.
- `PATCH /api/businesses/:businessId/contracts/:contractId` – Update a contract.
- `DELETE /api/businesses/:businessId/contracts/:contractId` – Delete a contract.

**Request body (POST/PATCH JSON)**
```json
{
  "title": "Vendor Services Agreement", // required, 3-150 chars
  "counterparty": "ACME Supplies",      // required, 3-150 chars
  "value": 25000.00,                     // optional, decimal >= 0
  "currency": "USD",                    // optional, ISO 4217
  "startDate": "2024-01-01",            // required, ISO date
  "endDate": "2024-12-31",              // optional, ISO date >= startDate
  "renewalDate": "2024-11-30",          // optional, ISO date
  "autoRenew": true,                     // optional, default false
  "status": "ACTIVE",                   // required, enum: ACTIVE | PENDING | TERMINATED | EXPIRED
  "documentId": "file_cuid",            // optional, uploaded contract file ID
  "notes": "string",                    // optional, max 500 chars
  "metadata": { "department": "ops" }  // optional JSON
}
```

---

## Task 15 – Insurance Policies CRUD (sortable by renewal_date)

**Routes**
- `GET /api/businesses/:businessId/insurance-policies?sort=renewal_date&order=asc|desc` – List policies sorted by renewal_date (default asc when sort provided).
- `GET /api/businesses/:businessId/insurance-policies/:policyId` – Retrieve a policy.
- `POST /api/businesses/:businessId/insurance-policies` – Create a policy.
- `PATCH /api/businesses/:businessId/insurance-policies/:policyId` – Update a policy.
- `DELETE /api/businesses/:businessId/insurance-policies/:policyId` – Delete a policy.

**Request body (POST/PATCH JSON)**
```json
{
  "provider": "Acme Insurance",          // required, 3-150 chars
  "policyNumber": "POL-123456",          // required, 3-50 chars
  "coverageType": "General Liability",   // required, 3-100 chars
  "coverageAmount": 1000000.00,           // optional, decimal >= 0
  "premium": 2500.00,                     // optional, decimal >= 0
  "currency": "USD",                     // optional, ISO 4217
  "effectiveDate": "2024-01-01",         // required, ISO date
  "renewalDate": "2025-01-01",           // optional, ISO date
  "status": "ACTIVE",                    // required, enum: ACTIVE | PENDING | LAPSED | CANCELLED
  "broker": "string",                    // optional, 3-150 chars
  "documentId": "file_cuid",             // optional, uploaded policy file ID
  "notes": "string",                     // optional, max 500 chars
  "metadata": { "riskLevel": "medium" } // optional JSON
}
```

**Sorting behavior**
- `sort=renewal_date` sorts by `renewalDate` field; `order` can be `asc` (default) or `desc`.
