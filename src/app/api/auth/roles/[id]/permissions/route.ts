import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';
import { logAudit } from '@/services/auditService';

const prisma = new PrismaClient();

// Helper function to get client info
function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

// GET all permissions for a role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const permissionCheck = await checkPermission(request, 'ROLE_VIEW');
    // if (!permissionCheck.allowed || !permissionCheck.user) {
    //   return permissionCheck.response;
    // }

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
    const permissionCheck = await checkPermission(request, 'LEVEL_VIEW');
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

    // Get existing permission IDs
    const existingPermissionIds = role.permission.map(rp => rp.permission.id);

    // Find permissions to add (not already assigned)
    const permissionsToAdd = permissionIds.filter(
      id => !existingPermissionIds.includes(id)
    );

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionsToAdd.map(permissionId => ({
          role_id: params.id,
          permission_id: permissionId
        }))
      });
    }

    // Get updated role with all permissions
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

    // Log the update action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'ROLE_UPDATE',
      success: true,
      ipAddress: ip,
      userAgent,
      details: `Updated permissions for role: ${role.name_en}`
    });

    return NextResponse.json(updatedRole?.permission.map(rp => rp.permission) ?? []);
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

    // Log the update action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'ROLE_UPDATE',
      success: true,
      ipAddress: ip,
      userAgent,
      details: `Removed permissions from role: ${role.name_en}`
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