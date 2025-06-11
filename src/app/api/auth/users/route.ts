import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
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

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: Request) {
  try {
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
export async function DELETE(request: Request) {
  try {
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