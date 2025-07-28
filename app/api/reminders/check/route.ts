import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking for cases with 1 day remaining...');

    // Get current date
    const today = new Date();
    const oneDayFromNow = new Date(today.getTime() + (1 * 24 * 60 * 60 * 1000));

    // Find cases that are due in 1 day and haven't been resolved
    const urgentCases = await prisma.crimes.findMany({
      where: {
        status: {
          not: 'Resolved'
        },
        created_at: {
          lte: oneDayFromNow
        }
      },
      include: {
        assigned_to: {
          select: {
            user_id: true,
            name: true,
            email: true
          }
        },
        station: {
          select: {
            name: true
          }
        },
        reminders: {
          where: {
            reminder_type: 'First'
          }
        }
      }
    });

    console.log(`📊 Found ${urgentCases.length} cases to check`);

    const results = [];
    let emailsSent = 0;
    let emailsFailed = 0;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });

    for (const caseItem of urgentCases) {
      try {
        // Calculate days remaining
        const caseCreatedDate = new Date(caseItem.created_at);
        const daysSinceCreation = Math.floor((today.getTime() - caseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysLeft = ((caseItem as any).resolution_days || 1) - daysSinceCreation;

        // Only send reminder if 1 day or less remaining
        if (daysLeft <= 1 && daysLeft > 0) {
          // Check if reminder already sent today
          const todayReminder = caseItem.reminders.find(reminder => {
            const reminderDate = new Date(reminder.reminder_date);
            return reminderDate.toDateString() === today.toDateString();
          });

          if (!todayReminder) {
            // Send reminder email
            const emailContent = {
              to: caseItem.assigned_to.email,
              subject: `URGENT: Case Resolution Reminder - ${caseItem.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                  <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 24px;">⚠️ URGENT CASE REMINDER</h1>
                  </div>
                  
                  <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-bottom: 15px;">Dear ${caseItem.assigned_to.name},</h2>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                      This is an urgent reminder regarding case: <strong>${caseItem.title}</strong>
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
                        <li><strong>Case Title:</strong> ${caseItem.title}</li>
                        <li><strong>Case ID:</strong> ${caseItem.crime_id}</li>
                        <li><strong>Assigned To:</strong> ${caseItem.assigned_to.name}</li>
                        <li><strong>Station:</strong> ${caseItem.station?.name || 'Unknown Station'}</li>
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

            const mailOptions = {
              from: process.env.EMAIL_USER || 'your-email@gmail.com',
              to: caseItem.assigned_to.email,
              subject: emailContent.subject,
              html: emailContent.html
            };

            try {
              // Send the email
              await transporter.sendMail(mailOptions);
              console.log(`✅ Reminder sent to ${caseItem.assigned_to.name} for case ${caseItem.crime_id}`);
              emailsSent++;

              // Create reminder record
              await prisma.reminders.create({
                data: {
                  crime_id: caseItem.crime_id,
                  reminder_type: 'First',
                  reminder_date: new Date()
                }
              });

              results.push({
                caseId: caseItem.crime_id,
                caseTitle: caseItem.title,
                piName: caseItem.assigned_to.name,
                piEmail: caseItem.assigned_to.email,
                daysLeft,
                status: 'sent'
              });

            } catch (emailError: any) {
              console.error(`❌ Failed to send reminder for case ${caseItem.crime_id}:`, emailError.message);
              emailsFailed++;

              // Still create reminder record even if email fails
              await prisma.reminders.create({
                data: {
                  crime_id: caseItem.crime_id,
                  reminder_type: 'First',
                  reminder_date: new Date()
                }
              });

              results.push({
                caseId: caseItem.crime_id,
                caseTitle: caseItem.title,
                piName: caseItem.assigned_to.name,
                piEmail: caseItem.assigned_to.email,
                daysLeft,
                status: 'failed',
                error: emailError.message
              });
            }
          } else {
            console.log(`⏭️ Reminder already sent today for case ${caseItem.crime_id}`);
            results.push({
              caseId: caseItem.crime_id,
              caseTitle: caseItem.title,
              piName: caseItem.assigned_to.name,
              piEmail: caseItem.assigned_to.email,
              daysLeft,
              status: 'already_sent'
            });
          }
        }
      } catch (error) {
        console.error(`❌ Error processing case ${caseItem.crime_id}:`, error);
        results.push({
          caseId: caseItem.crime_id,
          caseTitle: caseItem.title,
          piName: caseItem.assigned_to?.name || 'Unknown',
          piEmail: caseItem.assigned_to?.email || 'Unknown',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`📧 Reminder check completed:`);
    console.log(`   - Emails sent: ${emailsSent}`);
    console.log(`   - Emails failed: ${emailsFailed}`);
    console.log(`   - Total cases processed: ${results.length}`);

    return NextResponse.json({
      message: 'Reminder check completed',
      summary: {
        totalCases: urgentCases.length,
        emailsSent,
        emailsFailed,
        totalProcessed: results.length
      },
      results
    });

  } catch (error) {
    console.error('❌ Error in reminder check:', error);
    return NextResponse.json(
      { error: 'Failed to check reminders' },
      { status: 500 }
    );
  }
} 