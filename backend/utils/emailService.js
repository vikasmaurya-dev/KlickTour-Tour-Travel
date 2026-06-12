import nodemailer from 'nodemailer';

// Use Brevo HTTP API if key is available (works on Render/cloud), else SMTP (local dev)
const useBrevo = !!process.env.BREVO_API_KEY;

const createMailTransport = () => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = smtpPort === 465;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    requireTLS: !secure,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  // Method 1: Brevo HTTP API (cloud-friendly, no SMTP ports needed)
  if (useBrevo) {
    const fromEmail = process.env.FROM_EMAIL || 'klicktour17@gmail.com';
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'KlickTour Travel', email: fromEmail },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Brevo error:', err);
      throw new Error(err.message || 'Brevo email failed');
    }
    console.log(`📧 Email sent via Brevo to ${to}`);
    return;
  }

  // Method 2: SMTP (local development)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transport = createMailTransport();
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    const fromAddress = `"KlickTour Travel" <${fromEmail}>`;
    const info = await transport.sendMail({ from: fromAddress, replyTo: fromEmail, to, subject, text, html });
    console.log(`📧 Email sent via SMTP to ${to}. MessageId: ${info.messageId}`);
    return;
  }

  // Fallback: Log to console
  console.log('\n=======================================');
  console.log('🚧 SIMULATED EMAIL - NO EMAIL SERVICE CONFIGURED 🚧');
  console.log(`📧 To: ${to} | Subject: ${subject}`);
  console.log('=======================================\n');
};

export const sendOTP = async (email, otp, purpose) => {
  const cleanSubjectMap = {
    register: 'KlickTour - Verify Your Email',
    login: 'KlickTour - Login Verification Code',
    reset: 'KlickTour - Password Reset Code',
  };

  const headingMap = {
    register: 'Verify Your Email Address',
    login: 'Login Verification',
    reset: 'Password Reset',
  };

  const descMap = {
    register: 'Enter this code to complete your registration:',
    login: 'Enter this code to complete your login:',
    reset: 'Enter this code to reset your password:',
  };

  const text = [
    headingMap[purpose],
    '',
    descMap[purpose],
    otp,
    '',
    'This code expires in 5 minutes.',
    "If you didn't request this, please ignore this email.",
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0;">KlickTour</h1>
        <p style="color: #64748b; margin-top: 5px;">Tour & Travel Agency</p>
      </div>
      <div style="background: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 10px;">${headingMap[purpose]}</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">${descMap[purpose]}</p>
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 20px; margin: 25px 0;">
          <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">
          This code expires in <strong>5 minutes</strong>.<br/>
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject: cleanSubjectMap[purpose], text, html });
};

export const sendBookingConfirmation = async (email, booking, pkg) => {
  if (!email) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background: #f8fafc;">
      <div style="background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0;">
        <h1 style="margin: 0 0 8px; color: #0f172a;">KlickTour Booking Received</h1>
        <p style="color: #475569;">Thanks for booking with us. Your booking is now ${booking.status}.</p>
        <div style="background: #f1f5f9; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <p><strong>Invoice:</strong> ${booking.invoiceNumber}</p>
          <p><strong>Package:</strong> ${pkg?.name || 'Selected package'}</p>
          <p><strong>Travelers:</strong> ${booking.travelers}</p>
          <p><strong>Total:</strong> ${booking.totalPrice}</p>
          ${booking.couponCode ? `<p><strong>Coupon:</strong> ${booking.couponCode}</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 13px;">Our team will review and confirm the booking shortly.</p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject: `KlickTour Booking Invoice ${booking.invoiceNumber}`, html });
};

export const sendHotelBookingConfirmation = async (email, booking) => {
  if (!email) return;

  const guestName = [booking.firstName, booking.lastName].filter(Boolean).join(' ') || 'Guest';
  const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN') : 'N/A';
  const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN') : 'N/A';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background: #f8fafc;">
      <div style="background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e2e8f0;">
        <h1 style="margin: 0 0 8px; color: #0f172a;">KlickTour Hotel Booking Confirmed</h1>
        <p style="color: #475569;">Hi ${guestName}, your hotel booking is now ${booking.bookingStatus || booking.status}.</p>
        <div style="background: #f1f5f9; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <p><strong>Reservation ID:</strong> ${booking.reservationId}</p>
          <p><strong>Hotel:</strong> ${booking.hotelName || 'Selected hotel'}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>
          <p><strong>Rooms:</strong> ${booking.rooms}</p>
          <p><strong>Total:</strong> ₹${Number(booking.totalPrice || 0).toLocaleString('en-IN')}</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">Thanks for choosing KlickTour. Keep this reservation ID for check-in support.</p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject: `KlickTour Hotel Reservation ${booking.reservationId}`, html });
};
