import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Marriage Site" <${process.env.EMAIL_USER}>`, // Sender address
      to, // Recipient
      subject, // Subject line
      text, // Plain text body
      html, // HTML body (optional)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message, error.stack);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;