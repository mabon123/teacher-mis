import { NextResponse } from 'next/server';
import { PERMISSIONS } from '../../../middleware/permissions';

// Mock users with different permission sets
const mockUsers = {
  admin: {
    id: '1',
    username: 'admin',
    roles: [{
      role: {
        permission: Object.values(PERMISSIONS).map(code => ({
          permission: { code }
        }))
      }
    }]
  },
  locationManager: {
    id: '2',
    username: 'location_manager',
    roles: [{
      role: {
        permission: [
          { permission: { code: PERMISSIONS.LOCATION_VIEW } },
          { permission: { code: PERMISSIONS.LOCATION_CREATE } },
          { permission: { code: PERMISSIONS.LOCATION_UPDATE } }
        ]
      }
    }]
  },
  viewer: {
    id: '3',
    username: 'viewer',
    roles: [{
      role: {
        permission: [
          { permission: { code: PERMISSIONS.USER_VIEW } },
          { permission: { code: PERMISSIONS.LOCATION_VIEW } },
          { permission: { code: PERMISSIONS.LOG_VIEW } }
        ]
      }
    }]
  }
};

export async function GET() {
  const testCases = [
    {
      name: 'Admin accessing user management',
      user: mockUsers.admin,
      path: '/api/auth/users',
      method: 'GET',
      expected: true
    },
    {
      name: 'Location manager trying to delete location',
      user: mockUsers.locationManager,
      path: '/api/locations/provinces',
      method: 'DELETE',
      expected: false
    },
    {
      name: 'Viewer trying to create user',
      user: mockUsers.viewer,
      path: '/api/auth/users',
      method: 'POST',
      expected: false
    },
    {
      name: 'Viewer accessing logs',
      user: mockUsers.viewer,
      path: '/api/auth/audit-logs',
      method: 'GET',
      expected: true
    }
  ];

  const results = testCases.map(test => {
    const userPermissions = test.user.roles.flatMap(ur => 
      ur.role.permission.map(rp => rp.permission.code)
    );

    return {
      test: test.name,
      user: test.user.username,
      path: test.path,
      method: test.method,
      userPermissions,
      expected: test.expected
    };
  });

  return NextResponse.json({
    message: 'Permission test results',
    results
  });
} 