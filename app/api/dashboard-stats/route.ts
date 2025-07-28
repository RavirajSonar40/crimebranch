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

    let caseStatusData: any[] = [];
    let monthlyTrendData: any[] = [];
    let crimeTypeData: any[] = [];
    let totalCases = 0;
    let pendingEscalations = 0;
    let resolvedThisMonth = 0;
    let resolutionRate = 0;
    let assignedCases = 0;

    // Get case status distribution
    const caseStatusCounts = await prisma.crimes.groupBy({
      by: ['status'],
      _count: {
        crime_id: true
      }
    });

    caseStatusData = caseStatusCounts.map(item => ({
      name: item.status,
      value: item._count.crime_id,
      color: item.status === 'Pending' ? '#f59e0b' : 
             item.status === 'Resolved' ? '#10b981' : '#ef4444'
    }));

    // Calculate total cases
    totalCases = caseStatusCounts.reduce((sum, item) => sum + item._count.crime_id, 0);
    
    // Calculate resolution rate
    const resolvedCases = caseStatusCounts.find(item => item.status === 'Resolved')?._count.crime_id || 0;
    resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

    // Get assigned cases for PI
    if (role === 'PI') {
      assignedCases = await prisma.crimes.count({
        where: {
          assigned_to_id: parseInt(userId)
        }
      });
    }

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await prisma.crimes.groupBy({
      by: ['status'],
      where: {
        created_at: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        crime_id: true
      }
    });

    // Get pending escalations
    pendingEscalations = await prisma.escalations.count({
      where: {
        status: 'Pending'
      }
    });

    // Get resolved cases this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    resolvedThisMonth = await prisma.crimes.count({
      where: {
        status: 'Resolved',
        created_at: {
          gte: startOfMonth
        }
      }
    });

    // Get crime type distribution
    const crimeTypeCounts = await prisma.crimes.groupBy({
      by: ['crime_type_ids'],
      _count: {
        crime_id: true
      }
    });

    // Get crime type names
    const crimeTypes = await prisma.crimeTypes.findMany({
      select: {
        crime_type_id: true,
        type: true
      }
    });

    // Create a map to aggregate crime types properly
    const crimeTypeMap = new Map();
    let unknownCount = 0;
    let invalidIds = new Set();
    
    crimeTypeCounts.forEach(item => {
      try {
        const typeIds = JSON.parse(item.crime_type_ids as string);
        const ids = Array.isArray(typeIds) ? typeIds : [typeIds];
        
        ids.forEach(id => {
          const crimeType = crimeTypes.find(ct => ct.crime_type_id === id);
          if (crimeType) {
            const typeName = crimeType.type;
            if (crimeTypeMap.has(typeName)) {
              crimeTypeMap.set(typeName, crimeTypeMap.get(typeName) + item._count.crime_id);
            } else {
              crimeTypeMap.set(typeName, item._count.crime_id);
            }
          } else {
            // Log invalid crime type IDs for debugging
            invalidIds.add(id);
            unknownCount += item._count.crime_id;
          }
        });
      } catch (e) {
        // If parsing fails, treat as single ID
        const crimeType = crimeTypes.find(ct => ct.crime_type_id === item.crime_type_ids);
        if (crimeType) {
          const typeName = crimeType.type;
          if (crimeTypeMap.has(typeName)) {
            crimeTypeMap.set(typeName, crimeTypeMap.get(typeName) + item._count.crime_id);
          } else {
            crimeTypeMap.set(typeName, item._count.crime_id);
          }
        } else {
          // Log invalid crime type IDs for debugging
          invalidIds.add(item.crime_type_ids);
          unknownCount += item._count.crime_id;
        }
      }
    });

    // Add Unknown category if there are invalid IDs
    if (unknownCount > 0) {
      crimeTypeMap.set('Unknown', unknownCount);
      console.warn(`⚠️ Found ${unknownCount} crimes with invalid crime type IDs: ${Array.from(invalidIds).join(', ')}`);
    }

    crimeTypeData = Array.from(crimeTypeMap.entries()).map(([type, count]) => ({
      type,
      count: count as number,
      color: '#3b82f6'
    }));

    // Get station performance data
    const stationPerformance = await prisma.crimes.groupBy({
      by: ['station_id'],
      _count: {
        crime_id: true
      }
    });

    const stationData = await Promise.all(
      stationPerformance.map(async (station) => {
        const stationInfo = await prisma.stations.findUnique({
          where: { station_id: station.station_id }
        });

        const resolvedCount = await prisma.crimes.count({
          where: {
            station_id: station.station_id,
            status: 'Resolved'
          }
        });

        const pendingCount = await prisma.crimes.count({
          where: {
            station_id: station.station_id,
            status: 'Pending'
          }
        });

        return {
          station: stationInfo?.name || `Station ${station.station_id}`,
          totalCases: station._count.crime_id,
          resolvedCases: resolvedCount,
          pendingCases: pendingCount,
          resolutionRate: station._count.crime_id > 0 ? Math.round((resolvedCount / station._count.crime_id) * 100) : 0
        };
      })
    );

    // Get escalation trend data (last 6 months)
    const escalationTrendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const pending = await prisma.escalations.count({
        where: {
          status: 'Pending',
          raised_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      const resolved = await prisma.escalations.count({
        where: {
          status: 'Resolved',
          raised_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      const overdue = await prisma.escalations.count({
        where: {
          status: 'Overdue',
          raised_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      escalationTrendData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        pending,
        resolved,
        overdue
      });
    }

    // Get reminder status data
    const reminderStatusData = await prisma.reminders.groupBy({
      by: ['reminder_type'],
      _count: {
        reminder_id: true
      }
    });

    const reminderData = reminderStatusData.map(item => ({
      type: item.reminder_type,
      count: item._count.reminder_id,
      color: '#3B82F6'
    }));

    // Get category trend data (last 6 months)
    const categoryTrendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const minor = await prisma.crimes.count({
        where: {
          category: 'MINOR',
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      const major = await prisma.crimes.count({
        where: {
          category: 'MAJOR',
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      const minorMajor = await prisma.crimes.count({
        where: {
          category: 'MINOR_MAJOR',
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      categoryTrendData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        minor,
        major,
        minorMajor
      });
    }

    return NextResponse.json({
      message: 'Dashboard statistics retrieved successfully',
      caseStatusData,
      monthlyTrendData,
      crimeTypeData,
      stationPerformanceData: stationData,
      escalationTrendData,
      reminderStatusData: reminderData,
      categoryTrendData,
      totalCases,
      pendingEscalations,
      resolvedThisMonth,
      resolutionRate,
      assignedCases
    });

  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 