import { Resend } from 'resend';
import { env } from './env.js';

const resend = new Resend(env.RESEND_MAIL_SECRET);

export async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SkillCerts <onboarding@resend.dev>',
      to,
      subject,
      text: 'You have received a new message from SkillCerts.',
      html: `
        <p>Hello,</p>
        <p>${html}</p>
        <p>— SkillCerts Team</p>
      `,
      reply_to: 'support@skillcerts.com', // can be fake for now
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Exception:', err);
    return { success: false, err };
  }
}
