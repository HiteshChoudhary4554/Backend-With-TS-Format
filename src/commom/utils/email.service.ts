import { Resend } from 'resend';
import { ApiError } from './api-Error.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, verificationCode: string) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [email],
    subject: 'Verify your email',
    html: `
        <h2>Verify your email</h2>
        <p>Please use the following 6-digit code to verify your email:</p>
        
        <h1>${verificationCode}</h1>

        <p>This code will expire in 10 minutes.</p>
        `,
  });

  if (error) {
    throw ApiError.conflict(error.message);
  }

  return data;
};
