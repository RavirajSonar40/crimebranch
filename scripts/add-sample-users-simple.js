const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleUsers() {
  try {
    // Sample users data
    const users = [
      // 1 DCP
      {
        user_id: 1,
        name: 'DCP Rajesh Kumar',
        email: 'dcp.rajesh@police.gov.in',
        password: 'password123',
        role: 'DCP',
        phone: '+91-9876543210',
        address: 'Police Headquarters, Delhi',
        station_id: null // DCP doesn't belong to a specific station
      },
      
      // 2 ACPs
      {
        user_id: 2,
        name: 'ACP Priya Sharma',
        email: 'acp.priya@police.gov.in',
        password: 'password123',
        role: 'ACP',
        phone: '+91-9876543211',
        address: 'North Zone, Delhi',
        station_id: null // ACPs don't belong to specific stations
      },
      {
        user_id: 3,
        name: 'ACP Amit Patel',
        email: 'acp.amit@police.gov.in',
        password: 'password123',
        role: 'ACP',
        phone: '+91-9876543212',
        address: 'South Zone, Delhi',
        station_id: null
      },
      
      // 6 PIs
      {
        user_id: 4,
        name: 'PI Anjali Singh',
        email: 'pi.anjali@police.gov.in',
        password: 'password123',
        role: 'PI',
        phone: '+91-9876543213',
        address: 'Connaught Place Police Station, Delhi',
        station_id: 1
      },
      {
        user_id: 5,
        name: 'PI Ravi Verma',
        email: 'pi.ravi@police.gov.in',
        password: 'password123',
        role: 'PI',
        phone: '+91-9876543214',
        address: 'Khan Market Police Station, Delhi',
        station_id: 2
      },
      {
        user_id: 6,
        name: 'PI Meera Reddy',
        email: 'pi.meera@police.gov.in',
        password: 'password123',
        role: 'PI',
        phone: '+91-9876543215',
        address: 'Lajpat Nagar Police Station, Delhi',
        station_id: 3
      },
      {
        user_id: 7,
        name: 'PI Sanjay Gupta',
        email: 'pi.sanjay@police.gov.in',
        password: 'password123',
        role: 'PI',
        phone: '+91-9876543216',
        address: 'Dwarka Police Station, Delhi',
        station_id: 4
      },
      {
        user_id: 8,
        name: 'PI Kavita Joshi',
        email: 'pi.kavita@police.gov.in',
        password: 'password123',
        role: 'PI',
        phone: '+91-9876543217',
        address: 'Rohini Police Station, Delhi',
        station_id: 5
      },
      {
        user_id: 9,
        name: 'PI Arjun Malhotra',
        email: 'pi.arjun@police.gov.in',
        password: 'password123',
        role: 'PI',
        phone: '+91-9876543218',
        address: 'Saket Police Station, Delhi',
        station_id: 6
      }
    ];

    console.log('Adding sample users...');
    
    for (const user of users) {
      await prisma.users.create({
        data: user
      });
      console.log(`Added ${user.role} ${user.name}`);
    }

    console.log('Sample users added successfully!');
    
  } catch (error) {
    console.error('Error adding sample users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleUsers(); 