import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/timetable-entries/[id] - Get a single timetable entry
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entry = await prisma.timetableEntry.findUnique({
      where: { id: params.id },
      include: {
        academicYear: true,
        gradeLevel: true,
        subject: true,
        staff: true,
        classroom: true,
      },
    });
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// PUT /api/timetable-entries/[id] - Update a timetable entry with validation and conflict detection
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const {
      academicYearId,
      gradeLevelId,
      subjectId,
      staffId,
      classroomId,
      dayOfWeek,
      startTime,
      endTime,
      periodLengthMinutes,
      sessionType,
      rotationDay,
    } = await request.json();

    // Validation
    if (
      !academicYearId ||
      !gradeLevelId ||
      !subjectId ||
      !staffId ||
      !classroomId ||
      !dayOfWeek ||
      !startTime ||
      !endTime ||
      !periodLengthMinutes
    ) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid startTime or endTime.' }, { status: 400 });
    }

    // Conflict detection (exclude self)
    const conflict = await prisma.timetableEntry.findFirst({
      where: {
        id: { not: params.id },
        academicYearId,
        dayOfWeek,
        OR: [
          {
            staffId,
            AND: [
              { startTime: { lt: end } },
              { endTime: { gt: start } },
            ],
          },
          {
            classroomId,
            AND: [
              { startTime: { lt: end } },
              { endTime: { gt: start } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json({
        error: 'Conflict detected: Staff or classroom is already assigned during this time.',
      }, { status: 409 });
    }

    const entry = await prisma.timetableEntry.update({
      where: { id: params.id },
      data: {
        academicYearId,
        gradeLevelId,
        subjectId,
        staffId,
        classroomId,
        dayOfWeek,
        startTime: start,
        endTime: end,
        periodLengthMinutes,
        sessionType,
        rotationDay,
      },
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// DELETE /api/timetable-entries/[id] - Delete a timetable entry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.timetableEntry.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
} 