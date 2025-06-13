import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/middleware/auth';
import { getRequiredPermission, hasPermission } from './src/middleware/permissions';

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  // Log the path for debugging
  console.log('Middleware path:', request.nextUrl.pathname);

  // Skip auth for login endpoint (with or without trailing slash)
  const loginPaths = ['/api/auth/login', '/api/auth/login/'];
  if (loginPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check for token in Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Get user permissions from roles
  const userPermissions = user.roles.flatMap(ur => 
    ur.role.permission.map(rp => rp.permission.code)
  );

  // Get required permission for this route
  const requiredPermission = getRequiredPermission(request);

  // Check if user has required permission
  if (!hasPermission(userPermissions, requiredPermission)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Add user ID to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('user-id', user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/:path*',
}; 