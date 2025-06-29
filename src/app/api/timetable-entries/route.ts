import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/timetable-entries - List timetable entries with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const gradeLevelId = searchParams.get('gradeLevelId');
    const subjectId = searchParams.get('subjectId');
    const staffId = searchParams.get('staffId');
    const classroomId = searchParams.get('classroomId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const sessionType = searchParams.get('sessionType');
    const rotationDay = searchParams.get('rotationDay');

    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (gradeLevelId) where.gradeLevelId = gradeLevelId;
    if (subjectId) where.subjectId = subjectId;
    if (staffId) where.staffId = staffId;
    if (classroomId) where.classroomId = classroomId;
    if (dayOfWeek) where.dayOfWeek = Number(dayOfWeek);
    if (sessionType) where.sessionType = sessionType;
    if (rotationDay) where.rotationDay = rotationDay;

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        academicYear: true,
        gradeLevel: true,
        subject: true,
        staff: true,
        classroom: true,
      },
    });
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// POST /api/timetable-entries - Create a new timetable entry with validation and conflict detection
export async function POST(request: NextRequest) {
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

    // Conflict detection
    const conflict = await prisma.timetableEntry.findFirst({
      where: {
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

    const entry = await prisma.timetableEntry.create({
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

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
} 