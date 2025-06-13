const { NextRequest } = require('next/server');
const { getRequiredPermission, hasPermission, PERMISSIONS } = require('../middleware/permissions');

// Mock user with different permission sets
const mockUsers = {
  admin: {
    permissions: Object.values(PERMISSIONS), // Has all permissions
  },
  locationManager: {
    permissions: [
      PERMISSIONS.LOCATION_VIEW,
      PERMISSIONS.LOCATION_CREATE,
      PERMISSIONS.LOCATION_UPDATE,
    ],
  },
  viewer: {
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.LOCATION_VIEW,
      PERMISSIONS.LOG_VIEW,
    ],
  },
};

// Test cases
const testCases = [
  {
    name: 'Admin accessing user management',
    user: mockUsers.admin,
    path: '/api/auth/users',
    method: 'GET',
    expected: true,
  },
  {
    name: 'Location manager trying to delete location',
    user: mockUsers.locationManager,
    path: '/api/locations/provinces',
    method: 'DELETE',
    expected: false,
  },
  {
    name: 'Viewer trying to create user',
    user: mockUsers.viewer,
    path: '/api/auth/users',
    method: 'POST',
    expected: false,
  },
  {
    name: 'Viewer accessing logs',
    user: mockUsers.viewer,
    path: '/api/auth/audit-logs',
    method: 'GET',
    expected: true,
  },
];

// Run tests
console.log('Running permission tests...\n');

testCases.forEach((test) => {
  const request = new NextRequest(new URL(`http://localhost${test.path}`), {
    method: test.method,
  });

  const requiredPermission = getRequiredPermission(request);
  const hasAccess = hasPermission(test.user.permissions, requiredPermission);

  console.log(`Test: ${test.name}`);
  console.log(`Path: ${test.path}`);
  console.log(`Method: ${test.method}`);
  console.log(`Required Permission: ${requiredPermission}`);
  console.log(`User Permissions: ${test.user.permissions.join(', ')}`);
  console.log(`Has Access: ${hasAccess}`);
  console.log(`Test ${hasAccess === test.expected ? 'PASSED' : 'FAILED'}\n`);
}); 