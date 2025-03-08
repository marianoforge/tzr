import { NextApiRequest, NextApiResponse } from 'next';
import { getStoredResponse, saveUnansweredQuestion } from '@/lib/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message } = req.body;

  console.log('🔎 Buscando en Firestore:', message);

  // 🔹 1️⃣ Intentar buscar la respuesta en Firestore
  const storedAnswer = await getStoredResponse(message);
  if (storedAnswer) {
    console.log('✅ Respuesta encontrada en Firestore:', storedAnswer);
    return res.status(200).json({ reply: storedAnswer });
  }

  console.log(
    '❌ No se encontró en Firestore. Guardando en preguntas sin respuesta...'
  );

  // 🔹 2️⃣ Guardar la pregunta en Firestore para revisión futura
  await saveUnansweredQuestion(message);

  // 🔹 3️⃣ Responder con mensaje y link de WhatsApp
  const whatsappLink = 'https://wa.me/+34637017737'; // 🔹 Reemplaza con el número real de soporte
  const notFoundResponse = `No tengo una respuesta para eso. 😔 Pero puedes escribirnos en WhatsApp al número +34 637 017 737 para ayudarte mejor.`;
  return res.status(200).json({ reply: notFoundResponse });
}
