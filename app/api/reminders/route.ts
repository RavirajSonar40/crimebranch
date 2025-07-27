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
    const type = searchParams.get('type');

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
      // PI sees only reminders from their assigned station
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
      // ACP sees reminders from stations under their jurisdiction
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
    // DCP sees all reminders (no additional filtering needed)

    // Apply additional filters
    if (stationId) {
      whereClause.crime = {
        ...whereClause.crime,
        station_id: parseInt(stationId)
      };
    }

    if (type) {
      whereClause.reminder_type = type;
    }

    if (month) {
      whereClause.reminder_date = {
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

    // Fetch reminders with crime, station and assigned user information
    const reminders = await prisma.reminders.findMany({
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
        reminder_date: 'desc'
      }
    });

    // Transform the data for frontend
    const transformedReminders = reminders.map(reminder => ({
      reminder_id: reminder.reminder_id,
      crime_id: reminder.crime_id,
      reminder_type: reminder.reminder_type,
      reminder_date: reminder.reminder_date,
      crime_title: reminder.crime.title,
      station_name: reminder.crime.station?.name || 'Unknown Station',
      assigned_to_name: reminder.crime.assigned_to?.name || 'Unassigned'
    }));

    return NextResponse.json({
      message: 'Reminders retrieved successfully',
      reminders: transformedReminders
    });

  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crime_id, reminder_type } = body;

    const newReminder = await prisma.reminders.create({
      data: {
        crime_id,
        reminder_type,
        reminder_date: new Date()
      }
    });

    return NextResponse.json({
      message: 'Reminder created successfully',
      reminder: newReminder
    });

  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
} 