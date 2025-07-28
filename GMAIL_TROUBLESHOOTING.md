# Gmail Authentication Troubleshooting Guide

## 🚨 Common Error: "Username and Password not accepted"

If you're seeing this error, follow these steps to fix it:

### Step 1: Verify Gmail Account Settings

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Click "Security" in the left sidebar
   - Find "2-Step Verification" and enable it
   - Follow the setup process

2. **Generate App Password**
   - In Security settings, find "App passwords"
   - Click "App passwords" (requires 2FA to be enabled)
   - Select "Mail" from the dropdown
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update Environment Variables

Create or update your `.env` file:

```env
# Email Configuration
EMAIL_USER="your-actual-gmail@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**Important Notes:**
- Use your **real Gmail address** (not a placeholder)
- The app password should be **16 characters** without spaces
- No extra spaces around the `=` sign
- Restart your development server after updating

### Step 3: Test the Configuration

Run the test script to verify:

```bash
node scripts/test-reminder-system.js
```

### Step 4: Alternative Solutions

If Gmail continues to fail, try these alternatives:

#### Option 1: Use a Different Gmail Account
- Create a new Gmail account specifically for the application
- Follow the same setup process

#### Option 2: Use Outlook/Hotmail
Update the email configuration in the API files:

```javascript
transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
});
```

#### Option 3: Use a Third-Party Email Service
Services like SendGrid, Mailgun, or AWS SES provide reliable email delivery.

### Step 5: Debugging Steps

1. **Check Environment Variables**
   ```bash
   # In your .env file, ensure:
   EMAIL_USER="your-real-gmail@gmail.com"
   EMAIL_PASSWORD="abcd efgh ijkl mnop"
   ```

2. **Verify 2FA is Enabled**
   - Go to Google Account → Security
   - Ensure "2-Step Verification" shows as "On"

3. **Check App Password**
   - Go to Google Account → Security → App passwords
   - Verify the password was generated for "Mail"

4. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### Step 6: Common Mistakes

❌ **Wrong email format:**
```env
EMAIL_USER="your-email@gmail.com"  # ✅ Correct
EMAIL_USER=your-email@gmail.com     # ❌ Missing quotes
```

❌ **Wrong password format:**
```env
EMAIL_PASSWORD="abcd efgh ijkl mnop"  # ✅ Correct (with spaces)
EMAIL_PASSWORD="abcdefghijklmnop"      # ❌ No spaces
```

❌ **Using regular password:**
```env
EMAIL_PASSWORD="your-regular-gmail-password"  # ❌ Wrong
EMAIL_PASSWORD="abcd efgh ijkl mnop"          # ✅ App password
```

### Step 7: Testing Without Email

If you want to test the system without email setup:

1. **Check the console logs** - the system will show what emails would be sent
2. **Verify database records** - reminder records are still created
3. **Test the UI** - case registration and reminder features work without email

### Step 8: Getting Help

If you're still having issues:

1. **Check the console output** for specific error messages
2. **Verify your Gmail account** has 2FA enabled
3. **Try generating a new app password**
4. **Test with a different Gmail account**

### Success Indicators

✅ **When it's working correctly:**
- Console shows "✅ Gmail connection verified successfully"
- Test emails are received in the inbox
- No authentication errors in the console

### Quick Fix Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App password generated for "Mail"
- [ ] Environment variables set correctly
- [ ] Development server restarted
- [ ] Test script run successfully

### Emergency Workaround

If you need to test the system immediately without email:

1. The system will still create database records
2. All case registration and reminder logic works
3. You can manually check the database for reminder records
4. The UI will show all functionality correctly

The email system is designed to fail gracefully - your case management system will continue to work even if emails aren't sending. 