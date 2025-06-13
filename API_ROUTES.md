# API Routes Documentation

## Authentication & User Management

### User Routes (`/api/auth/users`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/users` | Get all users with their roles | USER_VIEW |
| POST | `/api/auth/users` | Create new user | USER_CREATE |
| GET | `/api/auth/users/[id]` | Get single user | USER_VIEW |
| PUT | `/api/auth/users/[id]` | Update user | USER_UPDATE |
| DELETE | `/api/auth/users/[id]` | Delete user | USER_DELETE |

### Role Routes (`/api/auth/roles`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/roles` | Get all roles with permissions and users | ROLE_VIEW |
| POST | `/api/auth/roles` | Create new role | ROLE_CREATE |
| GET | `/api/auth/roles/[id]` | Get single role | ROLE_VIEW |
| PUT | `/api/auth/roles/[id]` | Update role | ROLE_UPDATE |
| DELETE | `/api/auth/roles/[id]` | Delete role | ROLE_DELETE |

### Permission Routes (`/api/auth/permissions`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/permissions` | Get all permissions | PERMISSION_VIEW |
| POST | `/api/auth/permissions` | Create new permission | PERMISSION_CREATE |
| GET | `/api/auth/permissions/[id]` | Get single permission | PERMISSION_VIEW |
| PUT | `/api/auth/permissions/[id]` | Update permission | PERMISSION_UPDATE |
| DELETE | `/api/auth/permissions/[id]` | Delete permission | PERMISSION_DELETE |

### Role-Permission Management (`/api/auth/roles/[id]/permissions`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/roles/[id]/permissions` | Get permissions for a role | ROLE_VIEW |
| POST | `/api/auth/roles/[id]/permissions` | Assign permissions to role | ROLE_UPDATE |
| DELETE | `/api/auth/roles/[id]/permissions` | Remove permissions from role | ROLE_UPDATE |

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

## Logs

### Active Logs (`/api/auth/active-logs`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/active-logs` | Get active logs | LOG_VIEW |
| PUT | `/api/auth/active-logs` | Update active logs | LOG_UPDATE |

### Audit Logs (`/api/auth/audit-logs`)
| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|-------------------|
| GET | `/api/auth/audit-logs` | Get audit logs | LOG_VIEW |

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