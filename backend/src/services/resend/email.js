import { Resend } from 'resend';


async function sendMail({loanId, email, username, resendConfig}) {
  const resend = new Resend(resendConfig.resendApi); 
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Application Update',
      html: `
        <p>Dear ${username},</p>
        <p>Thank you for your application for loan with Loan Id : ${loanId}. After a thorough review, we regret to inform you that we are unable to proceed with your request at this time.</p>
        <p>However, we encourage you to review our eligibility criteria and apply again in the future.</p>
        <p>If you have any questions or would like further clarification, feel free to reach out.</p>
        <p>Best regards,<br/>
        Priyansh Chowhan<br/>
        Rinflow<br/>
        7014664028</p>
      `
    });

    console.log('Email sent:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export default sendMail;
