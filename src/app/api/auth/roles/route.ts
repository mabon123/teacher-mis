import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all roles
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ROLE_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const roles = await prisma.role.findMany({
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
    return NextResponse.json(roles);
  } catch (error: unknown) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

// POST create new role
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ROLE_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }

    const body = await request.json();
    const { name_en, name_kh, code, is_active, description, permissions = [] } = body;

    if (!name_en || !name_kh || !code) {
      return NextResponse.json(
        { error: 'Name (EN/KH) and code are required' },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name_en,
        name_kh,
        code,
        is_active: is_active ?? true,
        description,
        ...(permissions.length > 0 && {
          permission: {
            create: permissions.map((permissionId: string) => ({
              permission: {
                connect: { id: permissionId }
              }
            }))
          }
        })
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