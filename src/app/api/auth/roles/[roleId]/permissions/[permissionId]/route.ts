import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE remove permission from role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { roleId: string; permissionId: string } }
) {
  try {
    // Params are accessed directly, no 'await' is needed.
    const { roleId, permissionId } = params;
    
    await prisma.rolePermission.deleteMany({
      where: {
        role_id: roleId,
        permission_id: permissionId
      }
    });

    return NextResponse.json({ message: 'Permission removed from role successfully' });
  } catch (error: unknown) {
    console.error('Error removing permission from role:', error);
    // It's good practice to log the actual error for debugging
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to remove permission from role', details: errorMessage }, { status: 500 });
  }
}