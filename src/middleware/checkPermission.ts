import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './auth';

// Specify Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function checkPermission(request: NextRequest, requiredPermission: string) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    const user = await verifyToken(token);
    if (!user) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    // Get user's roles and their permissions
    const userRoles = await prisma.userRole.findMany({
      where: { user_id: user.id },
      include: {
        role: {
          include: {
            permission: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    // Check if user has the required permission
    const hasPermission = userRoles.some(ur => 
      ur.role.permission.some(rp => 
        rp.permission.code === requiredPermission && 
        rp.permission.is_active
      )
    );

    if (!hasPermission) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      };
    }

    return {
      allowed: true,
      user
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    };
  }
} 