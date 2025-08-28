import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

// Welcome email for new students
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to NUET Prep Academy!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to success starts here</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to NUET Prep Academy! We're excited to have you join our community of learners.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your profile setup</li>
              <li>Browse available courses</li>
              <li>Connect with expert tutors</li>
              <li>Start your learning journey</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Explore Courses
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The NUET Prep Academy Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2024 NUET Prep Academy. All rights reserved.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Welcome to NUET Prep Academy! 🎓',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};

// Course enrollment confirmation
export const sendEnrollmentEmail = async (
  email: string,
  name: string,
  courseTitle: string,
  tutorName: string,
  coursePrice: number
) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Enrollment Confirmed! 🎉</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You're now enrolled in ${courseTitle}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your enrollment has been confirmed. Here are your course details:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Course Information</h3>
            <p style="color: #666; margin: 10px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Tutor:</strong> ${tutorName}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Price:</strong> ${coursePrice.toLocaleString()} ₸</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-courses" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Access Your Course
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your tutor will contact you soon to schedule your first session.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The NUET Prep Academy Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2024 NUET Prep Academy. All rights reserved.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: `Enrollment Confirmed: ${courseTitle} 🎓`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending enrollment email:', error);
    return { success: false, error };
  }
};

// Test completion notification
export const sendTestCompletionEmail = async (
  email: string,
  name: string,
  testTitle: string,
  score: number,
  maxScore: number,
  status: string
) => {
  try {
    const percentage = Math.round((score / maxScore) * 100);
    const statusColor = status === 'EXCELLENT' ? '#28a745' : 
                       status === 'GOOD' ? '#17a2b8' : 
                       status === 'SATISFACTORY' ? '#ffc107' : '#dc3545';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, #6c757d 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Test Completed! 📝</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${testTitle}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Great job ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You've completed your test. Here are your results:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #333; margin-top: 0;">Test Results</h3>
            <div style="font-size: 48px; font-weight: bold; color: ${statusColor}; margin: 20px 0;">
              ${score}/${maxScore}
            </div>
            <div style="font-size: 24px; color: #666; margin-bottom: 20px;">
              ${percentage}%
            </div>
            <div style="background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold;">
              ${status}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-courses" 
               style="background: ${statusColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Continue Learning
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Keep up the great work! Your tutor will review your results and provide feedback.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The NUET Prep Academy Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2024 NUET Prep Academy. All rights reserved.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: `Test Completed: ${testTitle} - ${score}/${maxScore} 📊`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending test completion email:', error);
    return { success: false, error };
  }
};

// Payment confirmation
export const sendPaymentConfirmationEmail = async (
  email: string,
  name: string,
  courseTitle: string,
  amount: number,
  paymentMethod: string
) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Payment Confirmed! 💳</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your payment</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Payment Successful ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your payment has been processed successfully. Here are the details:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
            <p style="color: #666; margin: 10px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Amount:</strong> ${amount.toLocaleString()} ₸</p>
            <p style="color: #666; margin: 10px 0;"><strong>Method:</strong> ${paymentMethod}</p>
            <p style="color: #666; margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-courses" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Access Your Course
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You will receive a receipt for this transaction. Keep it for your records.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The NUET Prep Academy Team
          </p>
        </div>
        
        <div style="background: #f8ffa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2024 NUET Prep Academy. All rights reserved.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: `Payment Confirmed: ${courseTitle} 💰`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
};

// Password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request 🔐</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset your account password</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You requested a password reset for your NUET Prep Academy account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The NUET Prep Academy Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2024 NUET Prep Academy. All rights reserved.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Password Reset Request - NUET Prep Academy 🔐',
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
};
