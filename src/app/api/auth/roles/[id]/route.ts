import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';


const prisma = new PrismaClient();

// GET single role by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, 'ROLE_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permission: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error: unknown) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 });
  }
}

// PUT update role by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const permissionCheck = await checkPermission(request, 'ROLE_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, is_active, description } = body;

    const role = await prisma.role.update({
      where: { id: params.id },
      data: {
        name_en,
        name_kh,
        code,
        is_active,
        description
      },
      include: {
        permission: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json(role);
  } catch (error: unknown) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

// DELETE role by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, 'ROLE_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    // Trim whitespace from the ID
    const roleId = params.id.trim();

    // First check if role is assigned to any users
    const roleWithUsers = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true
      }
    });

    if (!roleWithUsers) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (roleWithUsers.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id: roleId }
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
} 