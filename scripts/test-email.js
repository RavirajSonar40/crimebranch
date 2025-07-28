const fetch = require('node-fetch');

async function testEmailSystem() {
  try {
    console.log('🧪 Testing Email Reminder System...\n');
    
    // Test data for a case that needs reminder
    const testData = {
      crimeId: 1,
      piId: 4, // PI Anjali Singh
      caseTitle: 'URGENT: Theft Investigation Case',
      daysLeft: 1
    };
    
    console.log('📧 Sending test reminder email...');
    console.log('📋 Case Details:');
    console.log(`   - Case ID: ${testData.crimeId}`);
    console.log(`   - Case Title: ${testData.caseTitle}`);
    console.log(`   - Days Remaining: ${testData.daysLeft}`);
    console.log(`   - Assigned PI: PI Anjali Singh (ID: ${testData.piId})`);
    console.log(`   - Email: pi.anjali@police.gov.in\n`);
    
    // Send reminder email
    const response = await fetch('http://localhost:3000/api/email/reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email System Response:');
      console.log(`   - Status: ${result.message}`);
      console.log(`   - To: ${result.email.to}`);
      console.log(`   - Subject: ${result.email.subject}`);
      console.log(`   - Days Left: ${result.email.daysLeft}\n`);
      
      if (result.error) {
        console.log('⚠️ Email Error (but reminder record created):');
        console.log(`   - Error: ${result.error}\n`);
        console.log('💡 To fix email sending:');
        console.log('   1. Set up Gmail App Password (see EMAIL_SETUP.md)');
        console.log('   2. Add EMAIL_USER and EMAIL_PASSWORD to .env file');
        console.log('   3. Restart the development server');
      } else {
        console.log('🎉 Email sent successfully!');
        console.log('📧 Check the PI\'s email inbox for the reminder.');
      }
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to send email:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error testing email system:', error.message);
  }
}

testEmailSystem(); 