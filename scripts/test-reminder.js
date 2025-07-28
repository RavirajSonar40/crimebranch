const fetch = require('node-fetch');

async function testReminder() {
  try {
    console.log('Testing reminder system...');
    
    // Test the reminder check endpoint
    const response = await fetch('http://localhost:3000/api/reminders/check');
    
    if (response.ok) {
      const data = await response.json();
      console.log('Reminder check result:', data);
    } else {
      console.error('Failed to check reminders:', response.status);
    }
    
  } catch (error) {
    console.error('Error testing reminder:', error);
  }
}

testReminder(); 