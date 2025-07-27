import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    let stations: any[] = [];
    let acps: any[] = [];

    // Get stations based on role
    if (role === 'DCP') {
      // DCP can see all stations
      stations = await prisma.stations.findMany({
        select: {
          station_id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else if (role === 'ACP') {
      // ACP can see stations under their jurisdiction
      stations = await prisma.stations.findMany({
        where: {
          acp_id: parseInt(userId)
        },
        select: {
          station_id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else if (role === 'PI') {
      // PI can see only their assigned station
      const user = await prisma.users.findUnique({
        where: { user_id: parseInt(userId) },
        include: { station: true }
      });
      
      if (user?.station) {
        stations = [{
          station_id: user.station.station_id,
          name: user.station.name
        }];
      }
    }

    // Get ACPs (only for DCP)
    if (role === 'DCP') {
      acps = await prisma.users.findMany({
        where: {
          role: 'ACP'
        },
        select: {
          user_id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    }

    return NextResponse.json({
      message: 'Escalation filters retrieved successfully',
      stations,
      acps
    });

  } catch (error) {
    console.error('Error fetching escalation filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escalation filters' },
      { status: 500 }
    );
  }
} 