import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res
      .status(400)
      .json({ message: 'Email and verificationToken are required' });
  }

  const sentFrom = new Sender(
    process.env.MAILERSEND_FROM_EMAIL as string,
    process.env.MAILERSEND_FROM_NAME as string
  );

  const recipients = [new Recipient(email, 'User')];

  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY as string,
    });

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('RealtorTrackPro - Verifica tu correo electrónico')
      .setHtml(
        `<p>Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
         <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}">Verificar correo</a>`
      );

    await mailerSend.email.send(emailParams);

    res
      .status(200)
      .json({ message: 'Correo de verificación enviado exitosamente' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Error al enviar el correo de verificación',
      error: error?.response?.data || errorMessage,
    });
  }
}
