import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';
import { logAudit } from '@/services/auditService';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to get client IP and user agent
function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  return { ip, userAgent };
}

// GET all users
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'USER_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Log the view action
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'USER_VIEW',
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'USER_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { username, password, roles = [] } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with roles
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        is_active: true,
        ...(roles.length > 0 && {
          roles: {
            create: roles.map((roleId: string) => ({
              role: {
                connect: { id: roleId }
              }
            }))
          }
        })
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Log the creation
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'USER_CREATE',
      entityId: user.id,
      entityType: 'User',
      details: `Created user: ${user.username}`,
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'USER_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { id, username, password, roles, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    interface UpdateData {
      username?: string;
      password?: string;
      is_active?: boolean;
    }

    const updateData: UpdateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (typeof is_active === 'boolean') updateData.is_active = is_active;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(roles && {
          roles: {
            deleteMany: {},
            create: roles.map((roleId: string) => ({
              role: {
                connect: { id: roleId }
              }
            }))
          }
        })
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Log the update
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'USER_UPDATE',
      entityId: user.id,
      entityType: 'User',
      details: `Updated user: ${user.username}`,
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'USER_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user info before deletion for audit log
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { username: true }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Set user's organization and user_level to null if they exist
      await tx.user.updateMany({
        where: { id },
        data: {
          organization_id: null,
          user_level_id: null
        }
      });

      // Set created_by and updated_by to null in related models
      await tx.province.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.province.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.district.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.district.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.commune.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.commune.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.village.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.village.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.staff.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.staff.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.organization.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.organization.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.levelType.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.levelType.updateMany({ where: { updated_by: id }, data: { updated_by: null } });
      await tx.userLevel.updateMany({ where: { created_by: id }, data: { created_by: null } });
      await tx.userLevel.updateMany({ where: { updated_by: id }, data: { updated_by: null } });

      // Delete active logs
      await tx.activeLog.deleteMany({
        where: { user_id: id }
      });

      // Delete audit logs
      await tx.auditLog.deleteMany({
        where: { user_id: id }
      });

      // Delete user roles
      await tx.userRole.deleteMany({
        where: { user_id: id }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id }
      });
    });

    // Log the deletion
    const { ip, userAgent } = getClientInfo(request);
    await logAudit({
      userId: permissionCheck.user.id,
      action: 'USER_DELETE',
      entityId: id,
      entityType: 'User',
      details: `Deleted user: ${userToDelete.username}`,
      success: true,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}