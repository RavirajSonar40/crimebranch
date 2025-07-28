# Email Notification System

## Overview

The Crime Branch Management System now includes a comprehensive email notification system that automatically sends emails to PIs (Police Inspectors) when:

1. **A new case is assigned to them** - Case registration notification
2. **A case has 1 day or less remaining** - Urgent reminder notification

## Features

### ✅ Case Registration Notifications
- Sent automatically when a new case is created and assigned to a PI
- Includes complete case details, priority, and timeline
- Professional blue-themed email design
- Station and case ID information

### ✅ Reminder Emails
- Sent automatically when a case has 1 day or less remaining
- Urgent red-themed design with warning styling
- Days remaining countdown with visual emphasis
- Escalation warnings for overdue cases

### ✅ Automated System
- Daily automated checks for cases requiring reminders
- Database tracking to prevent duplicate emails
- Comprehensive logging and error handling
- Professional HTML email templates

## Quick Setup

### 1. Email Configuration

Add these to your `.env` file:

```env
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 2. Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Copy the 16-character app password

### 3. Test the System

```bash
# Start the development server
npm run dev

# Test the complete email system
node scripts/test-reminder-system.js
```

## API Endpoints

### `/api/email/notification`
- **Method**: POST
- **Purpose**: Send case registration notifications
- **Data**: `{ crimeId, piId, caseTitle, caseDescription, priority, resolutionDays }`

### `/api/email/reminder`
- **Method**: POST
- **Purpose**: Send reminder emails for urgent cases
- **Data**: `{ crimeId, piId, caseTitle, daysLeft }`

### `/api/reminders/check`
- **Method**: POST
- **Purpose**: Automated reminder check system
- **Returns**: Summary of processed cases and email status

## Testing Scripts

### Complete System Test
```bash
node scripts/test-reminder-system.js
```
Tests all three components:
1. Case registration notification
2. Reminder email for urgent cases
3. Automated reminder check system

### Simple Email Test
```bash
node scripts/test-email-simple.js
```
Tests basic reminder email functionality.

### Automated Reminder Check
```bash
node scripts/setup-automated-reminders.js
```
Runs the automated reminder check manually.

## Email Templates

### Case Registration Email
- **Theme**: Professional blue design
- **Content**: Case assignment notification
- **Includes**: Case details, priority, timeline, station info

### Reminder Email
- **Theme**: Urgent red design with warnings
- **Content**: Time-sensitive reminder
- **Includes**: Days remaining, escalation warnings, case details

## Automation Setup

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to Daily at 9:00 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `scripts/setup-automated-reminders.js`
7. Start in: [your-project-directory]

### Linux/Mac Cron Job
```bash
# Edit crontab
crontab -e

# Add this line for daily at 9 AM
0 9 * * * cd /path/to/project && node scripts/setup-automated-reminders.js
```

## Troubleshooting

### Emails Not Sending
1. Check Gmail app password is correct
2. Ensure 2FA is enabled on Gmail
3. Verify environment variables are set
4. Restart development server after setting environment variables
5. Check console for error messages

### Common Errors
- **"Invalid credentials"**: Check EMAIL_PASSWORD in .env
- **"Connection timeout"**: Ensure development server is running
- **"Case not found"**: Verify case ID exists in database

### Testing Steps
1. Set up environment variables
2. Start development server
3. Run test script: `node scripts/test-reminder-system.js`
4. Check email inbox for test emails
5. Verify database records are created

## Database Integration

The system automatically creates reminder records in the database:
- Tracks sent reminders to prevent duplicates
- Records email status and timestamps
- Links reminders to specific cases and PIs

## Security Features

- Environment variable protection for email credentials
- Error handling to prevent system crashes
- Database validation for case and PI existence
- Professional email templates with police branding

## Support

For issues with the email system:
1. Check the console logs for error messages
2. Verify environment variables are correctly set
3. Test with the provided test scripts
4. Ensure the development server is running
5. Check Gmail account settings and app password

## Files Overview

- `app/api/email/notification/route.ts` - Case registration notifications
- `app/api/email/reminder/route.ts` - Reminder emails
- `app/api/reminders/check/route.ts` - Automated reminder system
- `scripts/test-reminder-system.js` - Complete system test
- `scripts/setup-automated-reminders.js` - Automation setup
- `EMAIL_SETUP.md` - Detailed setup instructions 