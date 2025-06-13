import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all users
export async function GET(request: NextRequest) {
  try {
    // Fetch all users
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

    // Transform the data to include only necessary fields and handle null timestamps
    const transformedUsers = users.map(user => {
      // Update timestamps if they're null
      if (!user.created_at || !user.updated_at) {
        prisma.user.update({
          where: { id: user.id },
          data: {
            created_at: user.created_at || new Date(),
            updated_at: user.updated_at || new Date()
          }
        }).catch(console.error);
      }

      return {
        id: user.id,
        username: user.username,
        is_active: user.is_active,
        created_at: user.created_at || new Date(),
        updated_at: user.updated_at || new Date(),
        roles: user.roles.map(ur => ({
          id: ur.role.id,
          name_en: ur.role.name_en,
          name_kh: ur.role.name_kh,
          code: ur.role.code
        }))
      };
    });

    return NextResponse.json(transformedUsers);
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

    // Add audit log for user creation
    await prisma.auditLog.create({
      data: {
        active: 'CREATE_USER',
        timestamp: new Date(),
        user_id: permissionCheck.user.id,
        details: `Created user: ${user.username}`
      }
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
    const { id, username, password, roles = [], is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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
      where: { id },
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
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}