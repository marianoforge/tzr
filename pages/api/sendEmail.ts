import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
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

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phoneNumber ||
    !companyName ||
    !country ||
    !inquiry
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

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

    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
}
