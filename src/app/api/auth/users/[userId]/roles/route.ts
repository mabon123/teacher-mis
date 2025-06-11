import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all roles for a specific user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        user_id: params.userId
      },
      include: {
        role: true
      }
    });
    return NextResponse.json(userRoles);
  } catch (error: unknown) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 });
  }
}

// POST assign role to user
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json();
    const { role_id } = body;

    const userRole = await prisma.userRole.create({
      data: {
        user_id: params.userId,
        role_id
      },
      include: {
        role: true
      }
    });

    return NextResponse.json(userRole, { status: 201 });
  } catch (error: unknown) {
    console.error('Error assigning role to user:', error);
    return NextResponse.json({ error: 'Failed to assign role to user' }, { status: 500 });
  }
} 