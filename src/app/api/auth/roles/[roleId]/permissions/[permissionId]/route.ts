import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE remove permission from role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { roleId: string; permissionId: string } }
) {
  try {
    await prisma.rolePermission.deleteMany({
      where: {
        role_id: params.roleId,
        permission_id: params.permissionId
      }
    });

    return NextResponse.json({ message: 'Permission removed from role successfully' });
  } catch (error: unknown) {
    console.error('Error removing permission from role:', error);
    return NextResponse.json({ error: 'Failed to remove permission from role' }, { status: 500 });
  }
} 