import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { crimeId, piId, caseTitle, daysLeft } = await request.json();

    if (!crimeId || !piId || !caseTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get PI details
    const pi = await prisma.users.findUnique({
      where: { user_id: piId },
      select: {
        name: true,
        email: true
      }
    });

    if (!pi) {
      return NextResponse.json(
        { error: 'PI not found' },
        { status: 404 }
      );
    }

    // Create email content
    const emailContent = {
      to: pi.email,
      subject: `URGENT: Case Resolution Reminder - ${caseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ URGENT CASE REMINDER</h1>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 15px;">Dear ${pi.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              This is an urgent reminder regarding case: <strong>${caseTitle}</strong>
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Time Remaining</h3>
              <p style="color: #856404; margin: 0; font-size: 18px; font-weight: bold;">
                You have <span style="color: #dc3545;">${daysLeft} day${daysLeft > 1 ? 's' : ''}</span> left to resolve this case.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              Please take immediate action to ensure timely resolution of this case. 
              Failure to resolve within the deadline may result in escalation to higher authorities.
            </p>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #495057; margin: 0 0 10px 0;">Case Details:</h4>
              <ul style="color: #495057; margin: 0; padding-left: 20px;">
                <li><strong>Case Title:</strong> ${caseTitle}</li>
                <li><strong>Case ID:</strong> ${crimeId}</li>
                <li><strong>Assigned To:</strong> ${pi.name}</li>
                <li><strong>Days Remaining:</strong> ${daysLeft}</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              Please log into the Crime Branch Management System to update the case status.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated reminder from the Crime Branch Management System.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Create email transporter with multiple service options
    let transporter;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.error('❌ Email credentials not configured');
      return NextResponse.json({
        message: 'Reminder email failed - credentials not configured',
        error: 'EMAIL_USER and EMAIL_PASSWORD environment variables are required',
        email: {
          to: pi.email,
          subject: emailContent.subject,
          caseId: crimeId,
          piName: pi.name,
          daysLeft
        }
      });
    }

    // Try different email service configurations
    try {
      // First try Gmail
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      });
      
      // Verify connection
      await transporter.verify();
      console.log('✅ Gmail connection verified successfully');
      
    } catch (gmailError) {
      console.log('⚠️ Gmail failed, trying alternative configuration...');
      
      try {
        // Try Gmail with different settings
        transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPassword
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        await transporter.verify();
        console.log('✅ Gmail SMTP connection verified successfully');
        
      } catch (smtpError: any) {
        console.error('❌ All Gmail configurations failed:', smtpError.message);
        
        // Return error with helpful instructions
        return NextResponse.json({
          message: 'Reminder email failed - Gmail authentication error',
          error: smtpError.message,
          troubleshooting: {
            steps: [
              '1. Verify 2-Factor Authentication is enabled on Gmail',
              '2. Generate a new App Password for "Mail"',
              '3. Ensure EMAIL_USER is your full Gmail address',
              '4. Ensure EMAIL_PASSWORD is the 16-character app password',
              '5. Restart the development server after updating .env'
            ],
            gmailSetup: 'https://support.google.com/mail/?p=BadCredentials'
          },
          email: {
            to: pi.email,
            subject: emailContent.subject,
            caseId: crimeId,
            piName: pi.name,
            daysLeft
          }
        });
      }
    }

    // Email options
    const mailOptions = {
      from: emailUser,
      to: pi.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', pi.email);
      
      // Create a reminder record in the database
      await prisma.reminders.create({
        data: {
          crime_id: crimeId,
          reminder_type: 'First',
          reminder_date: new Date()
        }
      });

      return NextResponse.json({
        message: 'Reminder email sent successfully',
        email: {
          to: pi.email,
          subject: emailContent.subject,
          caseId: crimeId,
          piName: pi.name,
          daysLeft
        }
      });
    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      
      // Still create reminder record even if email fails
      await prisma.reminders.create({
        data: {
          crime_id: crimeId,
          reminder_type: 'First',
          reminder_date: new Date()
        }
      });

      return NextResponse.json({
        message: 'Reminder record created but email failed',
        error: emailError?.message || 'Unknown email error',
        email: {
          to: pi.email,
          subject: emailContent.subject,
          caseId: crimeId,
          piName: pi.name,
          daysLeft
        }
      });
    }

  } catch (error) {
    console.error('Error sending reminder email:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder email' },
      { status: 500 }
    );
  }
} 