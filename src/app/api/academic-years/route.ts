import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '@/middleware/checkPermission';

const prisma = new PrismaClient();

// GET all academic years or by id
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ACADEMIC_YEAR_VIEW');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const year = await prisma.academicYear.findUnique({ where: { id } });
      if (!year) {
        return NextResponse.json({ error: 'Academic year not found' }, { status: 404 });
      }
      return NextResponse.json(year);
    }
    const years = await prisma.academicYear.findMany();
    return NextResponse.json(years);
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 });
  }
}

// POST create new academic year
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ACADEMIC_YEAR_CREATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const body = await request.json();
    const { name_en, name_kh, start, end, is_active, description } = body;
    if (!name_en || !name_kh || !start || !end) {
      return NextResponse.json({ error: 'name_en, name_kh, start, and end are required' }, { status: 400 });
    }
    const year = await prisma.academicYear.create({
      data: {
        name_en,
        name_kh,
        start: new Date(start),
        end: new Date(end),
        is_active: is_active ?? true,
        description
      }
    });
    return NextResponse.json(year, { status: 201 });
  } catch (error) {
    console.error('Error creating academic year:', error);
    return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 });
  }
}

// PUT update academic year
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ACADEMIC_YEAR_UPDATE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const body = await request.json();
    const { id, name_en, name_kh, start, end, is_active, description } = body;
    if (!id) {
      return NextResponse.json({ error: 'Academic year ID is required' }, { status: 400 });
    }
    const year = await prisma.academicYear.update({
      where: { id },
      data: {
        name_en,
        name_kh,
        start: start ? new Date(start) : undefined,
        end: end ? new Date(end) : undefined,
        is_active,
        description
      }
    });
    return NextResponse.json(year);
  } catch (error) {
    console.error('Error updating academic year:', error);
    return NextResponse.json({ error: 'Failed to update academic year' }, { status: 500 });
  }
}

// DELETE academic year
export async function DELETE(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, 'ACADEMIC_YEAR_DELETE');
    if (!permissionCheck.allowed || !permissionCheck.user) {
      return permissionCheck.response;
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Academic year ID is required' }, { status: 400 });
    }
    await prisma.academicYear.delete({ where: { id } });
    return NextResponse.json({ message: 'Academic year deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    return NextResponse.json({ error: 'Failed to delete academic year' }, { status: 500 });
  }
} 