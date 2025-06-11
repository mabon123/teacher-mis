import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE remove role from user
export async function DELETE(
  request: Request,
  context: { params: { userId: string; roleId: string } }
) {
  try {
    await prisma.userRole.deleteMany({
      where: {
        user_id: context.params.userId,
        role_id: context.params.roleId
      }
    });

    return NextResponse.json({ message: 'Role removed from user successfully' });
  } catch (error: unknown) {
    console.error('Error removing role from user:', error);
    return NextResponse.json({ error: 'Failed to remove role from user' }, { status: 500 });
  }
} 