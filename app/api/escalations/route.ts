import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const stationId = searchParams.get('stationId');
    const acpId = searchParams.get('acpId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Build where clause based on role and filters
    let whereClause: any = {};

    // Role-based filtering
    if (role === 'PI') {
      // PI sees only escalations from their assigned station
      const user = await prisma.users.findUnique({
        where: { user_id: parseInt(userId) },
        include: { station: true }
      });
      
      if (user?.station) {
        whereClause.crime = {
          station_id: user.station.station_id
        };
      }
    } else if (role === 'ACP') {
      // ACP sees escalations from stations under their jurisdiction
      const stations = await prisma.stations.findMany({
        where: { acp_id: parseInt(userId) },
        select: { station_id: true }
      });
      
      if (stations.length > 0) {
        whereClause.crime = {
          station_id: {
            in: stations.map(s => s.station_id)
          }
        };
      }
    }
    // DCP sees all escalations (no additional filtering needed)

    // Apply additional filters
    if (stationId) {
      whereClause.crime = {
        ...whereClause.crime,
        station_id: parseInt(stationId)
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (month) {
      whereClause.raised_at = {
        gte: new Date(new Date().getFullYear(), parseInt(month) - 1, 1),
        lt: new Date(new Date().getFullYear(), parseInt(month), 1)
      };
    }

    // If ACP filter is applied (for DCP)
    if (acpId && role === 'DCP') {
      const acpStations = await prisma.stations.findMany({
        where: { acp_id: parseInt(acpId) },
        select: { station_id: true }
      });
      
      if (acpStations.length > 0) {
        whereClause.crime = {
          ...whereClause.crime,
          station_id: {
            in: acpStations.map(s => s.station_id)
          }
        };
      }
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    
    // Fetch escalations with crime, station and assigned user information
    const escalations = await prisma.escalations.findMany({
      where: whereClause,
      include: {
        crime: {
          include: {
            station: {
              select: {
                station_id: true,
                name: true
              }
            },
            assigned_to: {
              select: {
                user_id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        raised_at: 'desc'
      }
    });

    console.log('Raw escalations from DB:', escalations.length);

    // Transform the data for frontend
    const transformedEscalations = escalations.map(escalation => ({
      escalation_id: escalation.escalation_id,
      crime_id: escalation.crime_id,
      status: escalation.status,
      escalation_date: escalation.raised_at,
      crime_title: escalation.crime.title,
      station_name: escalation.crime.station?.name || 'Unknown Station',
      assigned_to_name: escalation.crime.assigned_to?.name || 'Unassigned'
    }));

    console.log('Transformed escalations:', transformedEscalations.length);

    return NextResponse.json({
      message: 'Escalations retrieved successfully',
      escalations: transformedEscalations
    });

  } catch (error) {
    console.error('Error fetching escalations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escalations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crime_id, status, raised_by_id, raised_to_id, reason } = body;

    const newEscalation = await prisma.escalations.create({
      data: {
        crime_id,
        status,
        raised_at: new Date(),
        raised_by_id,
        raised_to_id,
        reason: reason || 'Auto-generated escalation'
      }
    });

    return NextResponse.json({
      message: 'Escalation created successfully',
      escalation: newEscalation
    });

  } catch (error) {
    console.error('Error creating escalation:', error);
    return NextResponse.json(
      { error: 'Failed to create escalation' },
      { status: 500 }
    );
  }
} 