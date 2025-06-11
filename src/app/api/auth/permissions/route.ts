import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all permissions
export async function GET() {
  try {
    const permissions = await prisma.permission.findMany();
    return NextResponse.json(permissions);
  } catch (error: unknown) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

// POST create new permission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name_en, name_kh, code, description } = body;

    const permission = await prisma.permission.create({
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active: true
      }
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating permission:', error);
    return NextResponse.json({ error: 'Failed to create permission' }, { status: 500 });
  }
}

// PUT update permission
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name_en, name_kh, code, description, is_active } = body;

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        code,
        description,
        is_active
      }
    });

    return NextResponse.json(permission);
  } catch (error: unknown) {
    console.error('Error updating permission:', error);
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 });
  }
}

// DELETE permission
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 });
    }

    await prisma.permission.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Permission deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting permission:', error);
    return NextResponse.json({ error: 'Failed to delete permission' }, { status: 500 });
  }
} 