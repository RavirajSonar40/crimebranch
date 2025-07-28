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
      assigned_to_name: caseItem.assigned_to?.name || 'Unassigned',
      // Complainant Details
      complainant_name: (caseItem as any).complainant_name,
      complainant_phone: (caseItem as any).complainant_phone,
      complainant_address: (caseItem as any).complainant_address,
      // Incident Details
      incident_date: (caseItem as any).incident_date,
      incident_location: (caseItem as any).incident_location,
      // Case Details
      evidence_details: (caseItem as any).evidence_details,
      witness_details: (caseItem as any).witness_details,
      suspect_details: (caseItem as any).suspect_details,
      case_priority: (caseItem as any).case_priority,
      resolution_days: (caseItem as any).resolution_days
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
    const { 
      title, 
      description, 
      crime_type_ids, 
      complainant_name, 
      complainant_phone, 
      complainant_address, 
      incident_date, 
      incident_location, 
      evidence_details, 
      witness_details, 
      suspect_details, 
      case_priority, 
      case_status, 
      resolution_days,
      pi_id, 
      station_id
    } = body;

    // Ensure crime_type_ids is an array of numbers
    const crimeTypeIds = Array.isArray(crime_type_ids) ? crime_type_ids.map(id => parseInt(id.toString())) : [];

    const newCase = await prisma.crimes.create({
      data: {
        title,
        description,
        category: 'MAJOR', // Default category
        station_id: parseInt(station_id),
        assigned_to_id: parseInt(pi_id),
        status: case_status || 'Pending',
        crime_type_ids: crimeTypeIds,
        
        // Complainant Details
        complainant_name: complainant_name || null,
        complainant_phone: complainant_phone || null,
        complainant_address: complainant_address || null,
        
        // Incident Details
        incident_date: incident_date ? new Date(incident_date) : null,
        incident_location: incident_location || null,
        
        // Case Details
        evidence_details: evidence_details || null,
        witness_details: witness_details || null,
        suspect_details: suspect_details || null,
        case_priority: case_priority || 'Medium',
        resolution_days: resolution_days || 1
      }
    });

    // Send email notification to the assigned PI
    try {
      const notificationData = {
        crimeId: newCase.crime_id,
        piId: parseInt(pi_id),
        caseTitle: title,
        caseDescription: description,
        priority: case_priority || 'Medium',
        resolutionDays: resolution_days || 1
      };

      // Send notification email
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (notificationResponse.ok) {
        console.log('Case notification email sent successfully');
      } else {
        console.log('Failed to send case notification email');
      }
    } catch (emailError) {
      console.error('Error sending case notification email:', emailError);
      // Don't fail the case creation if email fails
    }

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