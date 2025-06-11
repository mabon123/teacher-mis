import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permission: {
          include: {
            permission: true
          }
        }
      }
    });
    return NextResponse.json(roles);
  } catch (error: unknown) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

// POST create new role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name_en, name_kh, code, description, permissions } = body;

    const role = await prisma.role.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true,
        permission: {
          create: permissions.map((permissionId: string) => ({
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

    return NextResponse.json(role, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

// PUT update role
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name_en, name_kh, code, description, permissions, is_active } = body;

    const role = await prisma.role.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active,
        permission: {
          deleteMany: {},
          create: permissions.map((permissionId: string) => ({
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

    return NextResponse.json(role);
  } catch (error: unknown) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

// DELETE role
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    await prisma.role.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
} 