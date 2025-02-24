import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    console.log('🔹 Nueva petición a /api/sendVerificationEmail');

    // 🔹 Validar que el email y el verificationToken están presentes
    const { email, verificationToken } = req.body;
    if (!email || !verificationToken) {
      console.warn('⚠️ Email o verificationToken no proporcionados.');
      return res
        .status(400)
        .json({ message: 'Email and verificationToken are required' });
    }

    console.log(`🔹 Enviando email de verificación a: ${email}`);

    // 🔹 Validar que las variables de entorno están configuradas
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    const fromName = process.env.MAILERSEND_FROM_NAME;
    const templateId = process.env.MAILERSEND_TEMPLATE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!apiKey || !fromEmail || !fromName || !templateId || !baseUrl) {
      console.error('❌ Faltan variables de entorno para MailerSend.');
      return res
        .status(500)
        .json({ message: 'MailerSend environment variables are missing' });
    }

    // 🔹 Configurar MailerSend
    const mailerSend = new MailerSend({ apiKey });
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(email, 'User')];

    // 🔹 Personalización del correo
    const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;
    const personalization = [
      {
        email,
        data: { verification_link: verificationLink },
      },
    ];

    // 🔹 Configurar parámetros del correo
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('RealtorTrackPro - Verifica tu correo electrónico')
      .setTemplateId(templateId)
      .setPersonalization(personalization);

    // 🔹 Enviar email
    await mailerSend.email.send(emailParams);
    console.log('✅ Correo de verificación enviado con éxito.');

    return res
      .status(200)
      .json({ message: 'Correo de verificación enviado exitosamente' });
  } catch (error: any) {
    console.error('❌ Error enviando correo de verificación:', error);
    return res.status(500).json({
      message: 'Error al enviar el correo de verificación',
      error: error?.response?.data || error.message,
    });
  }
}
