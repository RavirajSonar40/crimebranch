import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total count of escalations
    const totalEscalations = await prisma.escalations.count();
    
    // Get a few sample escalations
    const sampleEscalations = await prisma.escalations.findMany({
      take: 5,
      include: {
        crime: {
          include: {
            station: true,
            assigned_to: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Test escalations data',
      totalEscalations,
      sampleEscalations
    });

  } catch (error) {
    console.error('Error in test escalations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test escalations data' },
      { status: 500 }
    );
  }
} 