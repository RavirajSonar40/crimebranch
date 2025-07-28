import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all crime types with their headings
    const crimeTypes = await prisma.crimeTypes.findMany({
      select: {
        crime_type_id: true,
        heading: true,
        type: true
      },
      orderBy: {
        heading: 'asc'
      }
    });

    return NextResponse.json({
      message: 'Crime types retrieved successfully',
      crimeTypes
    });

  } catch (error) {
    console.error('Error fetching crime types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime types' },
      { status: 500 }
    );
  }
} 