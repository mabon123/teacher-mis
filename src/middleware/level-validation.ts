import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function validateLevelAccess(req: NextRequest) {
  try {
    const userId = req.headers.get('user-id'); // TODO: Get from auth token
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Check if user has access to the organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        user_level: {
          include: {
            level_type: true
          }
        }
      }
    });

    if (!user || !user.user_level) {
      return NextResponse.json({ error: 'User level not found' }, { status: 403 });
    }

    // Validate level hierarchy
    const targetOrg = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!targetOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if user's level can manage the target organization's type
    const canManage = user.user_level.level_type.can_manage.includes(targetOrg.type);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return null; // Continue with the request
  } catch (error) {
    console.error('Level validation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 