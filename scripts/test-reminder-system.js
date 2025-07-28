const http = require('http');

async function testReminderSystem() {
  try {
    console.log('🧪 Testing Complete Email Reminder System...\n');
    
    // Test 1: Case Registration Notification
    console.log('📧 Test 1: Case Registration Notification');
    console.log('==========================================');
    
    const registrationData = {
      crimeId: 1,
      piId: 4, // PI Anjali Singh
      caseTitle: 'NEW: Theft Investigation Case',
      caseDescription: 'A theft case has been reported at Central Market. Immediate investigation required.',
      priority: 'High',
      resolutionDays: 3
    };
    
    console.log('📋 Case Registration Details:');
    console.log(`   - Case ID: ${registrationData.crimeId}`);
    console.log(`   - Case Title: ${registrationData.caseTitle}`);
    console.log(`   - Priority: ${registrationData.priority}`);
    console.log(`   - Resolution Days: ${registrationData.resolutionDays}`);
    console.log(`   - Assigned PI: PI Anjali Singh (ID: ${registrationData.piId})`);
    console.log(`   - Email: pi.anjali@police.gov.in\n`);
    
    // Send case registration notification
    const registrationPostData = JSON.stringify(registrationData);
    
    const registrationOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/email/notification',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registrationPostData)
      }
    };
    
    const registrationReq = http.request(registrationOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Case Registration Email Response:');
          console.log(`   - Status: ${result.message}`);
          console.log(`   - To: ${result.email.to}`);
          console.log(`   - Subject: ${result.email.subject}`);
          console.log(`   - Case ID: ${result.email.caseId}\n`);
          
          if (result.error) {
            console.log('⚠️ Email Error:');
            console.log(`   - Error: ${result.error}\n`);
          } else {
            console.log('🎉 Case registration email sent successfully!');
            console.log('📧 Check the PI\'s email inbox for the notification.\n');
          }
        } catch (parseError) {
          console.log('📄 Raw Response:', data);
        }
      });
    });
    
    registrationReq.on('error', (error) => {
      console.error('❌ Registration Request Error:', error.message);
    });
    
    registrationReq.write(registrationPostData);
    registrationReq.end();
    
    // Wait a bit before testing reminder
    setTimeout(() => {
      testReminderEmail();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error testing reminder system:', error.message);
  }
}

async function testReminderEmail() {
  console.log('⏰ Test 2: Reminder Email for Cases with 1 Day Left');
  console.log('=====================================================');
  
  const reminderData = {
    crimeId: 1,
    piId: 4, // PI Anjali Singh
    caseTitle: 'URGENT: Theft Investigation Case',
    daysLeft: 1
  };
  
  console.log('📋 Reminder Details:');
  console.log(`   - Case ID: ${reminderData.crimeId}`);
  console.log(`   - Case Title: ${reminderData.caseTitle}`);
  console.log(`   - Days Remaining: ${reminderData.daysLeft}`);
  console.log(`   - Assigned PI: PI Anjali Singh (ID: ${reminderData.piId})`);
  console.log(`   - Email: pi.anjali@police.gov.in\n`);
  
  // Send reminder email
  const reminderPostData = JSON.stringify(reminderData);
  
  const reminderOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/email/reminder',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reminderPostData)
    }
  };
  
  const reminderReq = http.request(reminderOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Reminder Email Response:');
        console.log(`   - Status: ${result.message}`);
        console.log(`   - To: ${result.email.to}`);
        console.log(`   - Subject: ${result.email.subject}`);
        console.log(`   - Days Left: ${result.email.daysLeft}\n`);
        
        if (result.error) {
          console.log('⚠️ Email Error (but reminder record created):');
          console.log(`   - Error: ${result.error}\n`);
        } else {
          console.log('🎉 Reminder email sent successfully!');
          console.log('📧 Check the PI\'s email inbox for the reminder.\n');
        }
      } catch (parseError) {
        console.log('📄 Raw Response:', data);
      }
    });
  });
  
  reminderReq.on('error', (error) => {
    console.error('❌ Reminder Request Error:', error.message);
  });
  
  reminderReq.write(reminderPostData);
  reminderReq.end();
  
  // Wait a bit before testing automated reminder check
  setTimeout(() => {
    testAutomatedReminderCheck();
  }, 2000);
}

async function testAutomatedReminderCheck() {
  console.log('🤖 Test 3: Automated Reminder Check System');
  console.log('===========================================');
  
  const checkOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/reminders/check',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const checkReq = http.request(checkOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Automated Reminder Check Response:');
        console.log(`   - Status: ${result.message}`);
        console.log(`   - Total Cases: ${result.summary.totalCases}`);
        console.log(`   - Emails Sent: ${result.summary.emailsSent}`);
        console.log(`   - Emails Failed: ${result.summary.emailsFailed}`);
        console.log(`   - Total Processed: ${result.summary.totalProcessed}\n`);
        
        if (result.results && result.results.length > 0) {
          console.log('📊 Detailed Results:');
          result.results.forEach((item, index) => {
            console.log(`   ${index + 1}. Case ${item.caseId}: ${item.caseTitle}`);
            console.log(`      - PI: ${item.piName} (${item.piEmail})`);
            console.log(`      - Status: ${item.status}`);
            console.log(`      - Days Left: ${item.daysLeft}`);
            if (item.error) {
              console.log(`      - Error: ${item.error}`);
            }
            console.log('');
          });
        }
        
        console.log('🎉 Automated reminder check completed!');
        console.log('📧 Check email inboxes for any sent reminders.\n');
        
        console.log('💡 Email Setup Instructions:');
        console.log('===========================');
        console.log('1. Set up Gmail App Password (see EMAIL_SETUP.md)');
        console.log('2. Add EMAIL_USER and EMAIL_PASSWORD to .env file');
        console.log('3. Restart the development server');
        console.log('4. Run this test again to verify email sending');
        
      } catch (parseError) {
        console.log('📄 Raw Response:', data);
      }
    });
  });
  
  checkReq.on('error', (error) => {
    console.error('❌ Automated Check Request Error:', error.message);
  });
  
  checkReq.end();
}

testReminderSystem(); 