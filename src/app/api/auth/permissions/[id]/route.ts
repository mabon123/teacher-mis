import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET single permission by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const permission = await prisma.permission.findUnique({
      where: { id: params.id },
      include: {
        role: {
          include: {
            role: true
          }
        }
      }
    });

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    return NextResponse.json(permission);
  } catch (error: unknown) {
    console.error('Error fetching permission:', error);
    return NextResponse.json({ error: 'Failed to fetch permission' }, { status: 500 });
  }
}

// PUT update permission by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const permissionCheck = await checkPermission(request, 'PERMISSION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, is_active, description } = body;

    const permission = await prisma.permission.update({
      where: { id: params.id },
      data: {
        name_en,
        name_kh,
        code,
        is_active,
        description
      }
    });

    return NextResponse.json(permission);
  } catch (error: unknown) {
    console.error('Error updating permission:', error);
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 });
  }
}

// DELETE permission by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    // First check if permission is assigned to any roles
    const permissionWithRoles = await prisma.permission.findUnique({
      where: { id: params.id },
      include: {
        role: true
      }
    });

    if (!permissionWithRoles) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    if (permissionWithRoles.role.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete permission that is assigned to roles' },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Permission deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting permission:', error);
    return NextResponse.json({ error: 'Failed to delete permission' }, { status: 500 });
  }
} 