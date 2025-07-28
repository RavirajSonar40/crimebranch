# Email Setup Guide

## Complete Email Notification System

This system provides **two types of email notifications**:

1. **Case Registration Notifications** - Sent when a new case is assigned to a PI
2. **Reminder Emails** - Sent when a case has 1 day or less remaining

## To Enable Real Email Sending

### Step 1: Set up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Copy the 16-character app password**

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Step 3: Test Email System

1. Start the development server: `npm run dev`
2. Test the complete system: `node scripts/test-reminder-system.js`

## Email Features

### Case Registration Notifications
✅ **Professional HTML emails** with case assignment styling  
✅ **Complete case details** including title, description, priority  
✅ **PI assignment information** with contact details  
✅ **Timeline information** showing resolution days  
✅ **Station and case ID** for easy reference  

### Reminder Emails
✅ **Urgent warning styling** for time-sensitive cases  
✅ **Days remaining countdown** with visual emphasis  
✅ **Case escalation warnings** for overdue cases  
✅ **Professional formatting** with police branding  
✅ **Database tracking** of sent reminders  

## Email Types

### 1. Case Registration Email
- **Trigger**: When a new case is created and assigned to a PI
- **Content**: Case details, assignment notification, timeline
- **Style**: Professional blue theme with case information

### 2. Reminder Email
- **Trigger**: When a case has 1 day or less remaining
- **Content**: Urgent reminder with days left, case details
- **Style**: Red urgent theme with warning styling

## Automated Reminder System

The system includes an automated reminder check that:
- Scans all pending cases daily
- Identifies cases with 1 day or less remaining
- Sends reminder emails to assigned PIs
- Tracks sent reminders to avoid duplicates
- Updates case status for overdue cases

## Testing the System

### Quick Test
```bash
node scripts/test-reminder-system.js
```

This will test:
1. Case registration notification
2. Reminder email for urgent cases
3. Automated reminder check system

### Manual Testing
1. Register a new case through the PI dashboard
2. Check if notification email is sent
3. Wait for reminder emails (or manually trigger)

## API Endpoints

- `/api/email/notification` - Send case registration notifications
- `/api/email/reminder` - Send reminder emails
- `/api/reminders/check` - Automated reminder check system

## Troubleshooting

If emails don't send:
1. Check Gmail app password is correct
2. Ensure 2FA is enabled on Gmail
3. Verify environment variables are set correctly
4. Check console for error messages
5. Restart the development server after setting environment variables

## Example Email Content

### Case Registration Email
- 📋 NEW CASE ASSIGNED header
- Case title, ID, and description
- Priority level and resolution timeline
- Station information and PI details

### Reminder Email
- ⚠️ URGENT CASE REMINDER header
- Days remaining countdown
- Case details and escalation warnings
- Professional police branding 