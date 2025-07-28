const https = require('https');

/**
 * Automated Reminder Setup Script
 * 
 * This script can be used to set up automated daily reminder checks.
 * You can run this manually or set it up as a cron job.
 */

async function runAutomatedReminderCheck() {
  try {
    console.log('🤖 Running Automated Reminder Check...');
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('==========================================\n');
    
    const checkOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/reminders/check',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const checkReq = https.request(checkOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Automated Reminder Check Completed');
          console.log('=====================================');
          console.log(`📊 Summary:`);
          console.log(`   - Total Cases Checked: ${result.summary.totalCases}`);
          console.log(`   - Emails Sent: ${result.summary.emailsSent}`);
          console.log(`   - Emails Failed: ${result.summary.emailsFailed}`);
          console.log(`   - Total Processed: ${result.summary.totalProcessed}\n`);
          
          if (result.results && result.results.length > 0) {
            console.log('📋 Detailed Results:');
            console.log('===================');
            result.results.forEach((item, index) => {
              const statusIcon = item.status === 'sent' ? '✅' : 
                               item.status === 'failed' ? '❌' : 
                               item.status === 'already_sent' ? '⏭️' : '⚠️';
              
              console.log(`${statusIcon} Case ${item.caseId}: ${item.caseTitle}`);
              console.log(`   - PI: ${item.piName} (${item.piEmail})`);
              console.log(`   - Status: ${item.status}`);
              console.log(`   - Days Left: ${item.daysLeft}`);
              if (item.error) {
                console.log(`   - Error: ${item.error}`);
              }
              console.log('');
            });
          } else {
            console.log('📭 No urgent cases found requiring reminders.\n');
          }
          
          console.log('🎉 Automated reminder check completed successfully!');
          console.log('📧 Check email inboxes for any sent reminders.\n');
          
        } catch (parseError) {
          console.error('❌ Error parsing response:', parseError);
          console.log('📄 Raw Response:', data);
        }
      });
    });
    
    checkReq.on('error', (error) => {
      console.error('❌ Automated Check Request Error:', error.message);
      console.log('💡 Make sure the development server is running on localhost:3000');
    });
    
    checkReq.end();
    
  } catch (error) {
    console.error('❌ Error in automated reminder check:', error.message);
  }
}

// Instructions for setting up automated reminders
function showSetupInstructions() {
  console.log('📋 Automated Reminder Setup Instructions');
  console.log('=======================================');
  console.log('');
  console.log('🔄 To set up daily automated reminders:');
  console.log('');
  console.log('1. **Windows Task Scheduler:**');
  console.log('   - Open Task Scheduler');
  console.log('   - Create Basic Task');
  console.log('   - Set trigger to Daily at 9:00 AM');
  console.log('   - Action: Start a program');
  console.log('   - Program: node');
  console.log('   - Arguments: scripts/setup-automated-reminders.js');
  console.log('   - Start in: [your-project-directory]');
  console.log('');
  console.log('2. **Linux/Mac Cron Job:**');
  console.log('   - Edit crontab: crontab -e');
  console.log('   - Add line: 0 9 * * * cd /path/to/project && node scripts/setup-automated-reminders.js');
  console.log('');
  console.log('3. **Manual Testing:**');
  console.log('   - Run: node scripts/setup-automated-reminders.js');
  console.log('');
  console.log('4. **Environment Setup:**');
  console.log('   - Ensure EMAIL_USER and EMAIL_PASSWORD are set in .env');
  console.log('   - Make sure the development server is running');
  console.log('   - Test with: node scripts/test-reminder-system.js');
  console.log('');
}

// Check if this is being run directly
if (require.main === module) {
  // If command line argument is 'setup', show instructions
  if (process.argv.includes('--setup')) {
    showSetupInstructions();
  } else {
    // Run the automated check
    runAutomatedReminderCheck();
  }
}

module.exports = { runAutomatedReminderCheck, showSetupInstructions }; 