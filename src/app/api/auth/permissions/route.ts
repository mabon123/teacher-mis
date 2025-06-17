import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all permissions
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const permissions = await prisma.permission.findMany({
      include: {
        role: {
          include: {
            role: true
          }
        }
      }
    });
    return NextResponse.json(permissions);
  } catch (error: unknown) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

// POST create new permission
export async function POST(request: NextRequest) {
  try {

    const permissionCheck = await checkPermission(request, 'PERMISSION_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, is_active, description } = body;

    if (!name_en || !name_kh || !code) {
      return NextResponse.json(
        { error: 'Name (EN/KH) and code are required' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name_en,
        name_kh,
        code,
        is_active: is_active ?? true,
        description
      }
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating permission:', error);
    return NextResponse.json({ error: 'Failed to create permission' }, { status: 500 });
  }
}

// PUT update permission
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

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
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'PERMISSION_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    
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