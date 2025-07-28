import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { crimeId, piId, caseTitle, caseDescription, priority, resolutionDays } = await request.json();

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

    // Get case details
    const caseDetails = await prisma.crimes.findUnique({
      where: { crime_id: crimeId },
      include: {
        station: {
          select: {
            name: true
          }
        }
      }
    });

    if (!caseDetails) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Create email content
    const emailContent = {
      to: pi.email,
      subject: `NEW CASE ASSIGNED: ${caseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">📋 NEW CASE ASSIGNED</h1>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 15px;">Dear ${pi.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              A new case has been assigned to you. Please review the details below and take necessary action.
            </p>
            
            <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin: 0 0 10px 0;">📋 Case Details</h3>
              <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
                <li><strong>Case Title:</strong> ${caseTitle}</li>
                <li><strong>Case ID:</strong> ${crimeId}</li>
                <li><strong>Priority:</strong> ${priority || 'Medium'}</li>
                <li><strong>Resolution Days:</strong> ${resolutionDays || 1} day(s)</li>
                <li><strong>Station:</strong> ${caseDetails.station?.name || 'Unknown Station'}</li>
              </ul>
            </div>
            
            ${caseDescription ? `
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">📝 Description:</h4>
              <p style="color: #666; margin: 0; line-height: 1.6;">${caseDescription}</p>
            </div>
            ` : ''}
            
            <div style="background-color: #fff3e0; border: 1px solid #ffcc02; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #e65100; margin: 0 0 10px 0;">⏰ Important Timeline</h4>
              <p style="color: #e65100; margin: 0; font-weight: bold;">
                You have ${resolutionDays || 1} day${(resolutionDays || 1) > 1 ? 's' : ''} to resolve this case.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              Please log into the Crime Branch Management System to review the complete case details and begin your investigation.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from the Crime Branch Management System.<br>
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
        message: 'Case notification email failed - credentials not configured',
        error: 'EMAIL_USER and EMAIL_PASSWORD environment variables are required',
        email: {
          to: pi.email,
          subject: emailContent.subject,
          caseId: crimeId,
          piName: pi.name,
          caseTitle
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
          message: 'Case notification email failed - Gmail authentication error',
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
            caseTitle
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
      console.log('✅ Case notification email sent successfully to:', pi.email);
      
      return NextResponse.json({
        message: 'Case notification email sent successfully',
        email: {
          to: pi.email,
          subject: emailContent.subject,
          caseId: crimeId,
          piName: pi.name,
          caseTitle
        }
      });
    } catch (emailError: any) {
      console.error('❌ Error sending case notification email:', emailError);
      
      return NextResponse.json({
        message: 'Case notification email failed to send',
        error: emailError?.message || 'Unknown email error',
        troubleshooting: {
          steps: [
            '1. Check Gmail app password is correct',
            '2. Ensure 2FA is enabled on Gmail',
            '3. Verify environment variables are set correctly',
            '4. Restart the development server'
          ]
        },
        email: {
          to: pi.email,
          subject: emailContent.subject,
          caseId: crimeId,
          piName: pi.name,
          caseTitle
        }
      });
    }

  } catch (error) {
    console.error('❌ Error sending case notification email:', error);
    return NextResponse.json(
      { error: 'Failed to send case notification email' },
      { status: 500 }
    );
  }
} 