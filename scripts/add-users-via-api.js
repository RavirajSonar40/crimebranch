const fetch = require('node-fetch');

async function addSampleUsers() {
  try {
    // Sample users data
    const users = [
      // 1 DCP
      {
        name: 'DCP Rajesh Kumar',
        email: 'dcp.rajesh@police.gov.in',
        password: 'password123',
        role: 'DCP',
        station_id: null
      },
      
      // 2 ACPs
      {
        name: 'ACP Priya Sharma',
        email: 'acp.priya@police.gov.in',
        password: 'password123',
        role: 'ACP',
        station_id: null
      },
      {
        name: 'ACP Amit Patel',
        email: 'acp.amit@police.gov.in',
        password: 'password123',
        role: 'ACP',
        station_id: null
      },
      
      // 6 PIs
      {
        name: 'PI Anjali Singh',
        email: 'pi.anjali@police.gov.in',
        password: 'password123',
        role: 'PI',
        station_id: 1
      },
      {
        name: 'PI Ravi Verma',
        email: 'pi.ravi@police.gov.in',
        password: 'password123',
        role: 'PI',
        station_id: 2
      },
      {
        name: 'PI Meera Reddy',
        email: 'pi.meera@police.gov.in',
        password: 'password123',
        role: 'PI',
        station_id: 3
      },
      {
        name: 'PI Sanjay Gupta',
        email: 'pi.sanjay@police.gov.in',
        password: 'password123',
        role: 'PI',
        station_id: 4
      },
      {
        name: 'PI Kavita Joshi',
        email: 'pi.kavita@police.gov.in',
        password: 'password123',
        role: 'PI',
        station_id: 5
      },
      {
        name: 'PI Arjun Malhotra',
        email: 'pi.arjun@police.gov.in',
        password: 'password123',
        role: 'PI',
        station_id: 6
      }
    ];

    console.log('Adding sample users via API...');
    
    for (const user of users) {
      try {
        const response = await fetch('http://localhost:3000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`Added ${user.role} ${user.name}`);
        } else {
          console.error(`Failed to add ${user.name}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error adding ${user.name}:`, error.message);
      }
    }

    console.log('Sample users added successfully!');
    
  } catch (error) {
    console.error('Error adding sample users:', error);
  }
}

addSampleUsers(); 