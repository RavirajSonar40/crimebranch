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
    const category = searchParams.get('category');

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
      // PI sees only cases from their assigned station
      const user = await prisma.users.findUnique({
        where: { user_id: parseInt(userId) },
        include: { station: true }
      });
      
      if (user?.station) {
        whereClause.station_id = user.station.station_id;
      }
    } else if (role === 'ACP') {
      // ACP sees cases from stations under their jurisdiction
      const stations = await prisma.stations.findMany({
        where: { acp_id: parseInt(userId) },
        select: { station_id: true }
      });
      
      if (stations.length > 0) {
        whereClause.station_id = {
          in: stations.map(s => s.station_id)
        };
      }
    }
    // DCP sees all cases (no additional filtering needed)

    // Apply additional filters
    if (stationId) {
      whereClause.station_id = parseInt(stationId);
    }

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (month) {
      whereClause.created_at = {
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
        whereClause.station_id = {
          in: acpStations.map(s => s.station_id)
        };
      }
    }

    // Fetch cases with station and assigned user information
    const cases = await prisma.crimes.findMany({
      where: whereClause,
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
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transform the data for frontend
    const transformedCases = cases.map(caseItem => ({
      crime_id: caseItem.crime_id,
      title: caseItem.title,
      description: caseItem.description,
      category: caseItem.category,
      status: caseItem.status,
      created_at: caseItem.created_at,
      station_id: caseItem.station_id,
      station_name: caseItem.station?.name || 'Unknown Station',
      assigned_to_name: caseItem.assigned_to?.name || 'Unassigned'
    }));

    return NextResponse.json({
      message: 'Cases retrieved successfully',
      cases: transformedCases
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, station_id, assigned_to_id } = body;

    const newCase = await prisma.crimes.create({
      data: {
        title,
        description,
        category,
        station_id,
        assigned_to_id,
        status: 'Pending',
        crime_type_ids: []
      }
    });

    return NextResponse.json({
      message: 'Case created successfully',
      case: newCase
    });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
} 