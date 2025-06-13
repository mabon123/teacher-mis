import { NextRequest } from 'next/server';

// Define permission codes
export const PERMISSIONS = {
  // User Management
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  
  // Role Management
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE',
  
  // Permission Management
  PERMISSION_VIEW: 'PERMISSION_VIEW',
  PERMISSION_CREATE: 'PERMISSION_CREATE',
  PERMISSION_UPDATE: 'PERMISSION_UPDATE',
  PERMISSION_DELETE: 'PERMISSION_DELETE',
  
  // Location Management
  LOCATION_VIEW: 'LOCATION_VIEW',
  LOCATION_CREATE: 'LOCATION_CREATE',
  LOCATION_UPDATE: 'LOCATION_UPDATE',
  LOCATION_DELETE: 'LOCATION_DELETE',
  
  // Activity Logs
  LOG_VIEW: 'LOG_VIEW',
  LOG_UPDATE: 'LOG_UPDATE',
} as const;

// Define route to permission mapping
const routePermissions: Record<string, {
  GET?: string;
  POST?: string;
  PUT?: string;
  DELETE?: string;
}> = {
  '/api/auth/users': {
    GET: PERMISSIONS.USER_VIEW,
    POST: PERMISSIONS.USER_CREATE,
  },
  '/api/auth/roles': {
    GET: PERMISSIONS.ROLE_VIEW,
    POST: PERMISSIONS.ROLE_CREATE,
  },
  '/api/auth/permissions': {
    GET: PERMISSIONS.PERMISSION_VIEW,
    POST: PERMISSIONS.PERMISSION_CREATE,
  },
  '/api/locations/provinces': {
    GET: PERMISSIONS.LOCATION_VIEW,
    POST: PERMISSIONS.LOCATION_CREATE,
    PUT: PERMISSIONS.LOCATION_UPDATE,
    DELETE: PERMISSIONS.LOCATION_DELETE,
  },
  '/api/locations/districts': {
    GET: PERMISSIONS.LOCATION_VIEW,
    POST: PERMISSIONS.LOCATION_CREATE,
    PUT: PERMISSIONS.LOCATION_UPDATE,
    DELETE: PERMISSIONS.LOCATION_DELETE,
  },
  '/api/locations/communes': {
    GET: PERMISSIONS.LOCATION_VIEW,
    POST: PERMISSIONS.LOCATION_CREATE,
    PUT: PERMISSIONS.LOCATION_UPDATE,
    DELETE: PERMISSIONS.LOCATION_DELETE,
  },
  '/api/locations/villages': {
    GET: PERMISSIONS.LOCATION_VIEW,
    POST: PERMISSIONS.LOCATION_CREATE,
    PUT: PERMISSIONS.LOCATION_UPDATE,
    DELETE: PERMISSIONS.LOCATION_DELETE,
  },
  '/api/auth/active-logs': {
    GET: PERMISSIONS.LOG_VIEW,
    PUT: PERMISSIONS.LOG_UPDATE,
  },
  '/api/auth/audit-logs': {
    GET: PERMISSIONS.LOG_VIEW,
  },
};

// Helper function to get required permission for a route
export function getRequiredPermission(request: NextRequest): string | null {
  const path = request.nextUrl.pathname;
  const method = request.method;
  
  // Handle dynamic routes (with [id])
  const basePath = path.split('/').slice(0, -1).join('/');
  const routeConfig = routePermissions[path] || routePermissions[basePath];
  
  if (!routeConfig) {
    return null;
  }
  
  return routeConfig[method as keyof typeof routeConfig] || null;
}

// Helper function to check if user has required permission
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string | null
): boolean {
  if (!requiredPermission) {
    return true; // No permission required for this route
  }
  
  return userPermissions.includes(requiredPermission);
} 