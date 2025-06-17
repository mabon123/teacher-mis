# API Routes Documentation

## Authentication & User Management

### Authentication (`/api/auth/login`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| POST | `/api/auth/login` | User login with username and password | None |

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "location": "string" // Optional: User's location
}
```

**Response:**
```json
{
  "success": true,
  "token": "string", // JWT token
  "user": {
    "id": "string",
    "username": "string",
    "roles": [
      {
        "role": {
          "id": "string",
          "name_en": "string",
          "name_kh": "string",
          "code": "string"
        }
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing username or password
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

### User Routes (`/api/auth/users`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/users` | Get all users with their roles | USER_VIEW |
| POST | `/api/auth/users` | Create new user | USER_CREATE |
| GET | `/api/auth/users/[id]` | Get single user | USER_VIEW |
| PUT | `/api/auth/users/[id]` | Update user | USER_UPDATE |
| DELETE | `/api/auth/users/[id]` | Delete user | USER_DELETE |

**Create User (POST)**
```json
{
  "username": "string",
  "password": "string",
  "roles": ["roleId1", "roleId2"] // Optional: Array of role IDs
}
```

**Update User (PUT)**
```json
{
  "username": "string",
  "password": "string", // Optional
  "roles": ["roleId1", "roleId2"], // Optional
  "is_active": boolean // Optional
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Role Routes (`/api/auth/roles`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/roles` | Get all roles with permissions and users | ROLE_VIEW |
| POST | `/api/auth/roles` | Create new role | ROLE_CREATE |
| GET | `/api/auth/roles/[id]` | Get single role | ROLE_VIEW |
| PUT | `/api/auth/roles/[id]` | Update role | ROLE_UPDATE |
| DELETE | `/api/auth/roles/[id]` | Delete role | ROLE_DELETE |

**Create Role (POST)**
```json
{
  "name_en": "string",
  "name_kh": "string",
  "code": "string",
  "description": "string", // Optional
  "is_active": boolean, // Optional, defaults to true
  "permissions": ["permissionId1", "permissionId2"] // Optional
}
```

**Update Role (PUT)**
```json
{
  "name_en": "string",
  "name_kh": "string",
  "code": "string",
  "description": "string", // Optional
  "is_active": boolean // Optional
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or role assigned to users
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Role not found
- `500 Internal Server Error`: Server error

### Permission Routes (`/api/auth/permissions`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/permissions` | Get all permissions | PERMISSION_VIEW |
| POST | `/api/auth/permissions` | Create new permission | PERMISSION_CREATE |
| GET | `/api/auth/permissions/[id]` | Get single permission | PERMISSION_VIEW |
| PUT | `/api/auth/permissions/[id]` | Update permission | PERMISSION_UPDATE |
| DELETE | `/api/auth/permissions/[id]` | Delete permission | PERMISSION_DELETE |

**Create Permission (POST)**
```json
{
  "name_en": "string",
  "name_kh": "string",
  "code": "string",
  "description": "string", // Optional
  "is_active": boolean // Optional, defaults to true
}
```

**Update Permission (PUT)**
```json
{
  "name_en": "string",
  "name_kh": "string",
  "code": "string",
  "description": "string", // Optional
  "is_active": boolean // Optional
}
```

### Role-Permission Management (`/api/auth/roles/[id]/permissions`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/roles/[id]/permissions` | Get permissions for a role | ROLE_VIEW |
| POST | `/api/auth/roles/[id]/permissions` | Assign permissions to role | ROLE_UPDATE |

**Assign Permissions (POST)**
```json
{
  "permissionIds": ["permissionId1", "permissionId2"]
}
```

### Audit Logs (`/api/auth/audit-logs`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/audit-logs` | Get audit logs with filters | LOG_VIEW |

**Query Parameters:**
- `userId`: Filter by user ID
- `action`: Filter by action type
- `entityType`: Filter by entity type
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `success`: Filter by success status

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "action": "string",
    "entityType": "string",
    "entityId": "string",
    "details": "string",
    "success": boolean,
    "ipAddress": "string",
    "userAgent": "string",
    "timestamp": "string"
  }
]
```

### Active Logs (`/api/auth/active-logs`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/active-logs` | Get active user sessions | LOG_VIEW |

**Query Parameters:**
- `userId`: Filter by user ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "startAt": "string",
    "endAt": "string",
    "ipAddress": "string",
    "userAgent": "string",
    "user": {
      "id": "string",
      "username": "string"
    }
  }
]
```

### Location Logs (`/api/auth/location-logs`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/location-logs` | Get location access logs | location.logs.view |

**Query Parameters:**
- `userId`: Filter by user ID
- `locationType`: Filter by location type
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "locationType": "string",
    "locationId": "string",
    "action": "string",
    "timestamp": "string",
    "ipAddress": "string",
    "userAgent": "string"
  }
]
```

## Common Response Formats

### Success Response
```json
{
  "data": object | array,
  "message": "string" // Optional
}
```

### Error Response
```json
{
  "error": "string",
  "details": object // Optional
}
```

## Authentication

All endpoints (except login) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Rate Limiting

- Login attempts are limited to 5 requests per 15 minutes per IP
- Other endpoints are limited to 100 requests per minute per IP

## Error Codes

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Best Practices

1. Always include the Authorization header for authenticated requests
2. Handle rate limiting by implementing exponential backoff
3. Implement proper error handling for all API responses
4. Use appropriate HTTP methods for each operation
5. Validate all input data before processing
6. Keep sensitive data out of URLs (use POST body instead)
7. Implement proper logging for debugging and auditing
8. Use transactions for operations that modify multiple resources
9. Implement proper input sanitization
10. Follow RESTful conventions for endpoint naming and structure

## Location Management

### Provinces (`/api/locations/provinces`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/locations/provinces` | Get all provinces | LOCATION_VIEW |
| POST | `/api/locations/provinces` | Create new province | LOCATION_CREATE |
| PUT | `/api/locations/provinces` | Update province | LOCATION_UPDATE |
| DELETE | `/api/locations/provinces` | Delete province | LOCATION_DELETE |

### Districts (`/api/locations/districts`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/locations/districts` | Get all districts | LOCATION_VIEW |
| POST | `/api/locations/districts` | Create new district | LOCATION_CREATE |
| PUT | `/api/locations/districts` | Update district | LOCATION_UPDATE |
| DELETE | `/api/locations/districts` | Delete district | LOCATION_DELETE |

### Communes (`/api/locations/communes`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/locations/communes` | Get all communes | LOCATION_VIEW |
| POST | `/api/locations/communes` | Create new commune | LOCATION_CREATE |
| PUT | `/api/locations/communes` | Update commune | LOCATION_UPDATE |
| DELETE | `/api/locations/communes` | Delete commune | LOCATION_DELETE |

### Villages (`/api/locations/villages`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/locations/villages` | Get all villages | LOCATION_VIEW |
| POST | `/api/locations/villages` | Create new village | LOCATION_CREATE |
| PUT | `/api/locations/villages` | Update village | LOCATION_UPDATE |
| DELETE | `/api/locations/villages` | Delete village | LOCATION_DELETE |

## Request/Response Examples

### User Management

#### Create User
```http
POST /api/auth/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john.doe",
  "password": "securepassword",
  "roles": ["roleId1", "roleId2"]
}
```

#### Update User
```http
PUT /api/auth/users/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john.doe.updated",
  "password": "newpassword",
  "roles": ["roleId1", "roleId3"],
  "is_active": true
}
```

### Role Management

#### Create Role
```http
POST /api/auth/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_en": "Administrator",
  "name_kh": "អ្នកគ្រប់គ្រង",
  "code": "ADMIN",
  "description": "Full system access"
}
```

#### Assign Permissions to Role
```http
POST /api/auth/roles/[roleId]/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionIds": ["permissionId1", "permissionId2"]
}
```

### Location Management

#### Create Province
```http
POST /api/locations/provinces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_en": "Phnom Penh",
  "name_kh": "ភ្នំពេញ",
  "code": "PP",
  "description": "Capital city"
}
```

#### Create District
```http
POST /api/locations/districts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_en": "Chamkar Mon",
  "name_kh": "ចំការមន",
  "code": "CM",
  "description": "District in Phnom Penh",
  "province_id": "province_id"
}
```

#### Create Commune
```http
POST /api/locations/communes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_en": "Toul Svay Prey",
  "name_kh": "ទួលស្វាយព្រៃ",
  "code": "TSP",
  "description": "Commune in Chamkar Mon",
  "district_id": "district_id"
}
```

#### Create Village
```http
POST /api/locations/villages
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_en": "Village 1",
  "name_kh": "ភូមិ ១",
  "code": "V1",
  "description": "Village in Toul Svay Prey",
  "commune_id": "commune_id"
}
```

## Common Features

### Authentication
All endpoints except GET requests require a valid JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

### Error Responses
All endpoints may return the following error responses:
- 401: Authentication required or invalid token
- 403: Permission denied
- 400: Invalid request parameters
- 404: Resource not found
- 500: Internal server error

### Soft Delete
All delete operations are soft deletes (setting is_active to false) and maintain data history.

### Cascading Delete
- Deleting a province will soft delete all its districts, communes, and villages
- Deleting a district will soft delete all its communes and villages
- Deleting a commune will soft delete all its villages

### Audit Logging
All create, update, and delete operations are logged in the audit log with:
- Action type
- Timestamp
- User ID
- Details of the operation

# API Route Map

## Level Types

### Get all level types
- **Method:** GET
- **URL:** `/api/levels`
- **Description:** Retrieve all active level types.

### Create a new level type
- **Method:** POST
- **URL:** `/api/levels`
- **Description:** Create a new level type.
- **Sample Body:**
```json
{
  "name_en": "Test Level",
  "name_kh": "ថ្នាក់សាកល្បង",
  "code": "TEST",
  "level_order": 5,
  "can_manage": ["SCHOOL"],
  "can_manage_levels_ids": [],
  "created_by": "system",
  "updated_by": "system"
}
```

---

## Locations (Provinces)

### Create a new province (location)
- **Method:** POST
- **URL:** `/api/locations`
- **Description:** Create a new province/location. Requires admin authentication.
- **Headers:**
  - `Authorization: Bearer <your_token>` (if required)
- **Sample Body:**
```json
{
  "name_en": "Test Province",
  "name_kh": "ខេត្តសាកល្បង",
  "code": "TP01",
  "description": "A test province"
}
```

---

## Notes
- Start your server with `npm run dev` or `yarn dev`.
- Use Postman or similar tools to test these endpoints.
- Add authentication headers if required by your middleware.

---

_If you add more endpoints, update this file accordingly!_ 