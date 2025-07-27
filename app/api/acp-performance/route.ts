import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET ACP performance comparison for DCP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const acpId = searchParams.get('acpId');

    if (acpId) {
      // Get specific ACP performance
      const acpPerformance = await getACPPerformance(parseInt(acpId));
      return NextResponse.json({
        message: 'ACP performance retrieved successfully',
        performance: acpPerformance,
      });
    } else {
      // Get all ACPs performance for comparison
      const allACPs = await prisma.users.findMany({
        where: { role: 'ACP' },
        select: {
          user_id: true,
          name: true,
          email: true,
        }
      });

      const acpPerformances = [];
      for (const acp of allACPs) {
        const performance = await getACPPerformance(acp.user_id);
        acpPerformances.push({
          acp: acp,
          performance: performance,
        });
      }

      return NextResponse.json({
        message: 'All ACP performances retrieved successfully',
        performances: acpPerformances,
      });
    }

  } catch (error) {
    console.error('Error fetching ACP performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ACP performance' },
      { status: 500 }
    );
  }
}

async function getACPPerformance(acpId: number) {
  // Get stations under this ACP
  const stations = await prisma.stations.findMany({
    where: { acp_id: acpId },
    select: {
      station_id: true,
      name: true,
    }
  });

  const stationIds = stations.map(s => s.station_id);

  // Get case statistics for all stations under this ACP
  const totalCases = await prisma.crimes.count({
    where: {
      station_id: { in: stationIds }
    }
  });

  const pendingCases = await prisma.crimes.count({
    where: {
      station_id: { in: stationIds },
      status: 'Pending'
    }
  });

  const resolvedCases = await prisma.crimes.count({
    where: {
      station_id: { in: stationIds },
      status: 'Resolved'
    }
  });

  const overdueCases = await prisma.crimes.count({
    where: {
      station_id: { in: stationIds },
      status: 'Overdue'
    }
  });

  // Get escalations for this ACP's stations
  const escalations = await prisma.escalations.count({
    where: {
      crime: {
        station_id: { in: stationIds }
      },
      status: 'Pending'
    }
  });

  // Get monthly data for trends
  const monthlyData = await prisma.crimes.groupBy({
    by: ['status'],
    where: {
      station_id: { in: stationIds },
      created_at: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
      }
    },
    _count: {
      crime_id: true
    }
  });

  return {
    stations: stations,
    totalCases,
    pendingCases,
    resolvedCases,
    overdueCases,
    pendingEscalations: escalations,
    resolutionRate: totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0,
    monthlyData,
  };
} 