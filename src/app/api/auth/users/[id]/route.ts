import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET single user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT update user by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { username, password, roles = [], is_active } = body;

    const updateData: {
      username: string;
      is_active: boolean;
      password?: string;
    } = {
      username,
      is_active
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(roles.length > 0 && {
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

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check for USER_DELETE permission
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let deleter = null;
    let hasPermission = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { verifyToken } = await import('@/middleware/auth');
      deleter = await verifyToken(token);
      if (deleter && deleter.roles) {
        hasPermission = deleter.roles.some(ur =>
          ur.role && ur.role.permission && ur.role.permission.some(rp => rp.permission.code === 'USER_DELETE')
        );
      }
    }
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get the user to be deleted (for logging)
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id }
    });

    await prisma.user.delete({
      where: { id: params.id }
    });

    // Add audit log for user deletion
    if (deleter && userToDelete) {
      await prisma.auditLog.create({
        data: {
          active: 'DELETE_USER',
          timestamp: new Date(),
          user_id: deleter.id,
          details: `Deleted user: ${userToDelete.username} (ID: ${userToDelete.id})`
        }
      });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 