const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a test user with plain text password
    const user = await prisma.users.create({
      data: {
        name: 'Test Officer',
        email: 'test@example.com',
        password: 'password123', // Plain text password
        role: 'Inspector',
      },
    });

    console.log('✅ Test user created successfully:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', user.user_id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 