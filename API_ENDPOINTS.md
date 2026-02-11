# GRC Framework Ingestion API Endpoints

## Base URL
```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Framework Management

### List Frameworks
```http
GET /frameworks?status=published
```

**Query Parameters:**
- `status` (optional): `draft`, `published`, or `archived` (default: `published`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ISO 27001:2022",
      "version": "2022",
      "description": "...",
      "controlCount": 30,
      "status": "published",
      "categories": [
        {
          "id": "A.5",
          "name": "A.5",
          "description": "",
          "controlCount": 8
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `200 OK`

---

### Create Framework
```http
POST /frameworks
Content-Type: application/json
Authorization: Bearer {user_token}

{
  "name": "Framework Name",
  "version": "1.0",
  "description": "Framework description",
  "sourceUrl": "https://example.com",
  "status": "draft",
  "controls": [
    {
      "id": "A.5.1.1",
      "title": "Control Title",
      "description": "Control description",
      "category": "A.5",
      "controlType": "technical"
    }
  ]
}
```

**Request Body:**
- `name` (required): Framework name
- `version` (required): Version string
- `description` (optional): Framework description
- `sourceUrl` (optional): Source URL
- `status` (optional): `draft`, `published`, or `archived` (default: `draft`)
- `controls` (optional): Array of controls to add

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Framework Name",
    "version": "1.0",
    "description": "Framework description",
    "controlCount": 1,
    "status": "draft",
    "categories": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `201 Created`

---

### Get Framework Details
```http
GET /frameworks/{id}
```

**Path Parameters:**
- `id` (required): Framework UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "framework": {
      "id": "uuid",
      "name": "ISO 27001:2022",
      "version": "2022",
      "description": "...",
      "controlCount": 30,
      "status": "published",
      "categories": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "categoryBreakdown": [
      {
        "categoryId": "A.5",
        "categoryName": "A.5",
        "controlCount": 8,
        "implementationStatus": {}
      }
    ],
    "totalControls": 30,
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `200 OK`

---

### Delete Framework
```http
DELETE /frameworks/{id}
Authorization: Bearer {user_token}
```

**Path Parameters:**
- `id` (required): Framework UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deleted": true
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `200 OK`

---

## Control Management

### List Controls
```http
GET /frameworks/{id}/controls?category=A.5&controlType=technical&limit=20&offset=0
```

**Path Parameters:**
- `id` (required): Framework UUID

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "A.5")
- `controlType` (optional): Filter by type (`technical`, `operational`, `management`)
- `limit` (optional): Results per page (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "controls": [
      {
        "id": "uuid",
        "frameworkId": "uuid",
        "controlIdStr": "A.5.1.1",
        "category": "A.5",
        "title": "Policies for information security",
        "description": "Establish and maintain information security policies",
        "controlType": "management",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 8,
    "category": "A.5",
    "frameworkId": "uuid"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `200 OK`

---

### Add Controls
```http
POST /frameworks/{id}/controls
Content-Type: application/json
Authorization: Bearer {user_token}

{
  "controls": [
    {
      "id": "A.5.1.1",
      "title": "Control Title",
      "description": "Control description",
      "category": "A.5",
      "controlType": "technical"
    }
  ]
}
```

**Path Parameters:**
- `id` (required): Framework UUID

**Request Body:**
- `controls` (required): Array of controls to add

**Response:**
```json
{
  "success": true,
  "data": {
    "frameworkId": "uuid",
    "insertedCount": 1,
    "controls": [...]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `201 Created`

---

## Framework Ingestion

### Parse and Ingest Document
```http
POST /frameworks/ingest
Content-Type: application/json
Authorization: Bearer {user_token}

{
  "format": "csv",
  "content": "control_id,category,title,description,control_type\nA.5.1.1,A.5,Policies,Description,management",
  "frameworkName": "Custom Framework",
  "version": "1.0",
  "description": "Optional description",
  "publish": false
}
```

**Request Body:**
- `format` (required): `csv`, `json`, or `text`
- `content` (required): File content as string (max 10MB)
- `frameworkName` (optional): Override framework name
- `version` (optional): Override version
- `description` (optional): Override description
- `publish` (optional): Set status to published (default: false)

**Supported Formats:**

**CSV:**
```csv
control_id,category,title,description,control_type
A.5.1.1,A.5,Policies for information security,Establish information security policies,management
A.5.1.2,A.5,Information security roles,Define IS responsibilities,management
```

**JSON:**
```json
{
  "name": "Framework Name",
  "version": "1.0",
  "description": "Framework description",
  "controls": [
    {
      "id": "A.5.1.1",
      "category": "A.5",
      "title": "Control Title",
      "description": "Control description",
      "controlType": "technical"
    }
  ]
}
```

**TEXT:**
Unstructured text that Claude will parse (requires ANTHROPIC_API_KEY)

**Response:**
```json
{
  "success": true,
  "data": {
    "framework": {...},
    "parseMetadata": {
      "importDate": "2024-01-01T00:00:00Z",
      "rowCount": 5
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `201 Created`

---

## Seeding

### Seed ISO 27001:2022 Framework
```http
POST /frameworks/seed
Authorization: Bearer {SEED_API_KEY}
```

**Headers (Production Only):**
- `Authorization`: `Bearer {SEED_API_KEY}` (set via env variable)

**Response:**
```json
{
  "success": true,
  "data": {
    "framework": {
      "id": "uuid",
      "name": "ISO 27001:2022",
      "version": "2022",
      "controlCount": 30,
      "status": "published",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "insertedControlCount": 30,
    "categoryBreakdown": [
      {
        "category": "A.5",
        "count": 8
      }
    ],
    "message": "ISO 27001:2022 framework successfully seeded"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `201 Created`

---

### Check Seed Status
```http
GET /frameworks/seed
```

**Response:**
```json
{
  "success": true,
  "data": {
    "iso27001": {
      "exists": true,
      "name": "ISO 27001:2022",
      "version": "2022",
      "status": "published",
      "controlCount": 30
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Code:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, version",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Framework not found",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "ISO 27001:2022 framework already exists in the database",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "error": "Content exceeds maximum size of 10MB",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create framework",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or missing required fields |
| 401 | Unauthorized - Authentication required or failed |
| 404 | Not Found - Framework or control not found |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - Content exceeds size limit |
| 500 | Internal Server Error - Server error occurred |

---

## Authentication

All endpoints that modify data (POST, PUT, DELETE) require authentication via Clerk:

```bash
curl -X POST https://your-domain.com/api/frameworks \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

GET endpoints are generally public (no auth required).

---

## Rate Limiting

No built-in rate limiting. Implement at your API gateway or use Vercel Edge Middleware if needed.

---

## Pagination

Controls support pagination with `limit` and `offset` parameters:

```http
GET /frameworks/{id}/controls?limit=20&offset=0
GET /frameworks/{id}/controls?limit=20&offset=20
```

Default limit: 100
Maximum limit: 1000

---

## Field Validation

### Control Type
Must be one of: `technical`, `operational`, `management`

### Framework Status
Must be one of: `draft`, `published`, `archived`

### Category Format
Typically: `A.5`, `A.6`, etc. (for ISO 27001:2022)

### Control ID Format
Typically: `A.5.1.1` (for ISO 27001:2022)

---

## Examples

### Create a Framework with Controls (curl)
```bash
curl -X POST http://localhost:3000/api/frameworks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "My Security Framework",
    "version": "1.0",
    "description": "Custom security controls",
    "controls": [
      {
        "id": "SEC.1.1",
        "category": "SEC.1",
        "title": "Access Control",
        "description": "Implement access controls",
        "controlType": "technical"
      }
    ]
  }'
```

### Ingest a CSV File (curl)
```bash
curl -X POST http://localhost:3000/api/frameworks/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "format": "csv",
    "content": "control_id,category,title,description,control_type\nA.5.1.1,A.5,Policies,Description,management",
    "publish": true
  }'
```

### Get ISO 27001:2022 Controls (curl)
```bash
curl http://localhost:3000/api/frameworks/{id}/controls?category=A.5
```

---

## API Testing Tools

- **Postman**: Import the endpoints above
- **cURL**: Use the examples provided
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension

---

## Documentation Links

- [Implementation Guide](./GRC_FRAMEWORK_INGESTION_GUIDE.md)
- [Type Definitions](./src/types/grc.ts)
- [Framework Utilities](./src/lib/grc/frameworks.ts)
- [API Examples](./src/lib/grc/examples.ts)

