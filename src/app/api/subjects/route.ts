import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all subjects or by id
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'SUBJECT_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const subject = await prisma.subject.findUnique({ where: { id } });
      if (!subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }
      return NextResponse.json(subject);
    }
    const subjects = await prisma.subject.findMany();
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

// POST create new subject
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'SUBJECT_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const body = await request.json();
    const { name_en, name_kh, code, is_active } = body;
    if (!name_en || !name_kh || !code) {
      return NextResponse.json({ error: 'Name (EN/KH) and code are required' }, { status: 400 });
    }
    const subject = await prisma.subject.create({
      data: {
        name_en,
        name_kh,
        code,
        is_active: is_active ?? true
      }
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

// PUT update subject
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'SUBJECT_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const body = await request.json();
    const { id, name_en, name_kh, code, is_active } = body;
    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }
    const subject = await prisma.subject.update({
      where: { id },
      data: { name_en, name_kh, code, is_active }
    });
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

// DELETE subject
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'SUBJECT_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }
    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
} 