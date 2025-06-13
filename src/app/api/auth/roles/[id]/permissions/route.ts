import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all permissions for a role
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
        }
      }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role.permission.map(rp => rp.permission));
  } catch (error: unknown) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch role permissions' }, { status: 500 });
  }
}

// POST assign permissions to a role
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, 'ROLE_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: 'permissionIds must be an array' },
        { status: 400 }
      );
    }

    // First check if role exists
    const role = await prisma.role.findUnique({
      where: { id: params.id }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update role permissions
    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: {
        permission: {
          deleteMany: {},
          create: permissionIds.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      },
      include: {
        permission: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json(updatedRole.permission.map(rp => rp.permission));
  } catch (error: unknown) {
    console.error('Error assigning permissions to role:', error);
    return NextResponse.json(
      { error: 'Failed to assign permissions to role' },
      { status: 500 }
    );
  }
}

// DELETE remove permissions from a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const permissionCheck = await checkPermission(request, 'ROLE_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: 'permissionIds must be an array' },
        { status: 400 }
      );
    }

    // First check if role exists
    const role = await prisma.role.findUnique({
      where: { id: params.id }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Remove specified permissions from role
    await prisma.rolePermission.deleteMany({
      where: {
        role_id: params.id,
        permission_id: {
          in: permissionIds
        }
      }
    });

    // Get updated role permissions
    const updatedRole = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permission: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json(updatedRole?.permission.map(rp => rp.permission) ?? []);
  } catch (error: unknown) {
    console.error('Error removing permissions from role:', error);
    return NextResponse.json(
      { error: 'Failed to remove permissions from role' },
      { status: 500 }
    );
  }
} 