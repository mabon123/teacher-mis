import { NextResponse, NextRequest } from 'next/server';
import { getLocationAccessLogs } from '@/services/locationAudit';
import { checkPermission } from '@/middleware/checkPermission';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if user has permission to view logs
    const permissionCheck = await checkPermission(request, 'location.logs.view');
    if (!permissionCheck.allowed) {
      return permissionCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const locationType = searchParams.get('locationType');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const logs = await getLocationAccessLogs(
      userId || undefined,
      locationType || undefined,
      startDate,
      endDate
    );

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching location logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location logs' },
      { status: 500 }
    );
  }
} 