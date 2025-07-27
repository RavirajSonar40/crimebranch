import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all crime types
    const crimeTypes = await prisma.crimeTypes.findMany({
      select: {
        crime_type_id: true,
        type: true,
        heading: true
      }
    });

    // Get sample crimes with their crime_type_ids
    const sampleCrimes = await prisma.crimes.findMany({
      take: 5,
      select: {
        crime_id: true,
        title: true,
        crime_type_ids: true
      }
    });

    return NextResponse.json({
      message: 'Test crime types data',
      crimeTypes,
      sampleCrimes
    });

  } catch (error) {
    console.error('Error in test crime types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test crime types data' },
      { status: 500 }
    );
  }
} 