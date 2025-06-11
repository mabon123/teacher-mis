import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all permissions for a specific role
export async function GET(
  request: Request,
  context: { params: { roleId: string } }
) {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role_id: context.params.roleId
      },
      include: {
        permission: true
      }
    });
    return NextResponse.json(rolePermissions);
  } catch (error: unknown) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch role permissions' }, { status: 500 });
  }
}

// POST assign permission to role
export async function POST(
  request: Request,
  context: { params: { roleId: string } }
) {
  try {
    const body = await request.json();
    const { permission_id } = body;

    const rolePermission = await prisma.rolePermission.create({
      data: {
        role_id: context.params.roleId,
        permission_id
      },
      include: {
        permission: true
      }
    });

    return NextResponse.json(rolePermission, { status: 201 });
  } catch (error: unknown) {
    console.error('Error assigning permission to role:', error);
    return NextResponse.json({ error: 'Failed to assign permission to role' }, { status: 500 });
  }
} 