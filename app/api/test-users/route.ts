import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        // Don't include password for security
      },
    });

    return NextResponse.json({
      message: 'Users found',
      count: users.length,
      users: users,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error },
      { status: 500 }
    );
  }
} 