import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firebase Admin SDK para autenticación

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/send-email', req.method);

    // Verificar el token de autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    console.log('✅ Token verificado para UID:', decodedToken.uid);

    if (req.method !== 'POST') {
      console.warn('⚠️ Método no permitido:', req.method);
      return res
        .status(405)
        .json({ message: 'Only POST requests are allowed' });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      country,
      inquiry,
    } = req.body;

    // Validar que los datos requeridos están presentes
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !companyName ||
      !country ||
      !inquiry
    ) {
      console.error('❌ Datos incompletos recibidos:', req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('🔹 Enviando correo con los siguientes datos:', {
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      country,
      inquiry,
    });

    // Configurar los datos del remitente y destinatario
    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL as string,
      process.env.MAILERSEND_FROM_NAME as string
    );

    const recipients = [
      new Recipient(process.env.MAILERSEND_TO_EMAIL as string, 'Your Client'),
    ];

    try {
      const mailerSend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY as string,
      });

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`Nuevo mensaje de ${firstName} ${lastName}`)
        .setHtml(
          `
          <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phoneNumber}</p>
          <p><strong>Empresa:</strong> ${companyName}</p>
          <p><strong>País:</strong> ${country}</p>
          <p><strong>Mensaje:</strong> ${inquiry}</p>
        `
        )
        .setText(
          `Nombre: ${firstName} ${lastName}\nEmail: ${email}\nTeléfono: ${phoneNumber}\nEmpresa: ${companyName}\nPaís: ${country}\nMensaje: ${inquiry}`
        );

      await mailerSend.email.send(emailParams);

      console.log('✅ Correo enviado exitosamente.');
      return res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
      console.error('❌ Error al enviar correo:', error);
      return res.status(500).json({ message: 'Error al enviar el correo' });
    }
  } catch (error) {
    console.error('❌ Error en la API /api/send-email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
