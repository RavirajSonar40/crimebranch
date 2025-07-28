const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmailSetup() {
  console.log('🧪 Testing Gmail Setup...\n');
  
  // Check environment variables
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  console.log('📋 Environment Variables Check:');
  console.log(`   EMAIL_USER: ${emailUser ? '✅ Set' : '❌ Not set'}`);
  console.log(`   EMAIL_PASSWORD: ${emailPassword ? '✅ Set' : '❌ Not set'}`);
  
  if (!emailUser || !emailPassword) {
    console.log('\n❌ Email credentials not configured!');
    console.log('Please add to your .env file:');
    console.log('EMAIL_USER="your-gmail@gmail.com"');
    console.log('EMAIL_PASSWORD="your-16-character-app-password"');
    return;
  }
  
  console.log(`\n📧 Email User: ${emailUser}`);
  console.log(`🔑 Password Length: ${emailPassword.length} characters`);
  
  if (emailPassword.length !== 16) {
    console.log('⚠️ Warning: App password should be 16 characters');
  }
  
  console.log('\n🔍 Testing Gmail Connection...');
  
  // Test different Gmail configurations
  const configs = [
    {
      name: 'Gmail Service',
      config: {
        service: 'gmail',
        auth: { user: emailUser, pass: emailPassword }
      }
    },
    {
      name: 'Gmail SMTP (Port 587)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: emailUser, pass: emailPassword },
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Gmail SMTP (Port 465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPassword }
      }
    }
  ];
  
  for (const config of configs) {
    try {
      console.log(`\n🔄 Testing ${config.name}...`);
      
      const transporter = nodemailer.createTransport(config.config);
      
      // Verify connection
      await transporter.verify();
      console.log(`✅ ${config.name} - Connection successful!`);
      
      // Try sending a test email
      console.log('📤 Sending test email...');
      
      const testMailOptions = {
        from: emailUser,
        to: emailUser, // Send to yourself for testing
        subject: '🧪 Gmail Setup Test - Crime Branch System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">✅ Gmail Setup Successful!</h2>
            <p>Your Gmail configuration is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Configuration: ${config.name}</li>
              <li>Email: ${emailUser}</li>
              <li>Time: ${new Date().toLocaleString()}</li>
            </ul>
            <p>You can now use the email notification system in your Crime Branch Management System.</p>
          </div>
        `
      };
      
      await transporter.sendMail(testMailOptions);
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your inbox for the test email.');
      
      console.log('\n🎉 Gmail setup is working correctly!');
      console.log('You can now use the email notification system.');
      
      return; // Exit on first successful configuration
      
    } catch (error) {
      console.log(`❌ ${config.name} - Failed: ${error.message}`);
      
      if (error.code === 'EAUTH') {
        console.log('🔧 Authentication Error - Common Solutions:');
        console.log('   1. Enable 2-Factor Authentication on Gmail');
        console.log('   2. Generate App Password for "Mail"');
        console.log('   3. Use the 16-character app password (not your regular password)');
        console.log('   4. Restart the development server after updating .env');
      }
    }
  }
  
  console.log('\n❌ All Gmail configurations failed!');
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Go to https://myaccount.google.com/');
  console.log('2. Security → 2-Step Verification → Enable');
  console.log('3. Security → App passwords → Generate for "Mail"');
  console.log('4. Copy the 16-character password');
  console.log('5. Update your .env file');
  console.log('6. Restart the development server');
  console.log('7. Run this test again');
  
  console.log('\n📚 For detailed help, see: GMAIL_TROUBLESHOOTING.md');
}

testGmailSetup().catch(console.error); 