const fetch = require('node-fetch');

async function testCaseRegistration() {
  try {
    console.log('Testing case registration...');
    
    // Test case data
    const caseData = {
      title: 'Test Case - Theft Investigation',
      description: 'This is a test case for the reminder system',
      crime_type_ids: [1, 2], // Assuming these crime type IDs exist
      complainant_name: 'John Doe',
      complainant_phone: '1234567890',
      complainant_address: '123 Test Street',
      incident_date: '2025-07-28',
      incident_location: 'Test Location',
      evidence_details: 'Test evidence',
      witness_details: 'Test witness',
      suspect_details: 'Test suspect',
      case_priority: 'Medium',
      case_status: 'Pending',
      resolution_days: 1,
      pi_id: 4, // Assuming PI with ID 4 exists
      station_id: 1 // Assuming station with ID 1 exists
    };
    
    // Register the case
    const response = await fetch('http://localhost:3000/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Case registered successfully:', result);
      
      // Wait a moment then test the reminder system
      setTimeout(async () => {
        console.log('\nTesting reminder system...');
        const reminderResponse = await fetch('http://localhost:3000/api/reminders/check');
        
        if (reminderResponse.ok) {
          const reminderResult = await reminderResponse.json();
          console.log('Reminder check result:', reminderResult);
        } else {
          console.error('Failed to check reminders:', reminderResponse.status);
        }
      }, 2000);
      
    } else {
      const errorData = await response.json();
      console.error('Failed to register case:', errorData);
    }
    
  } catch (error) {
    console.error('Error testing case registration:', error);
  }
}

testCaseRegistration(); 