import { NextApiRequest, NextApiResponse } from 'next';
import { getStoredResponse, saveUnansweredQuestion } from '@/lib/firestore';

// 🔹 Función para normalizar texto (eliminar acentos)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// 🔹 Respuestas predefinidas para mensajes comunes
const predefinedResponses: Record<string, string> = {
  hola: '¡Hola! 😊 ¿En qué puedo ayudarte?',
  'buenos dias': '¡Buenos días! 🌞 ¿Cómo puedo asistirte?',
  'buenas tardes': '¡Buenas tardes! 😊 ¿Cómo puedo ayudarte?',
  'buenas noches': '¡Buenas noches! 🌙 ¿En qué puedo ayudarte?',
  gracias: '¡De nada! Si necesitas más ayuda, aquí estaré. 😊',
  adios: '¡Hasta luego! Que tengas un gran día. 👋',
  chau: '¡Nos vemos! 👋',
  'como estas': '¡Estoy aquí para ayudarte! ¿En qué puedo asistirte hoy?',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const rawMessage = req.body.message?.toLowerCase().trim() || '';
  const normalizedMessage = normalizeText(rawMessage); // Normalizamos el mensaje (sin acentos)

  console.log('🔎 Procesando mensaje:', rawMessage);
  console.log('🔎 Mensaje normalizado:', normalizedMessage);

  // 🔹 1️⃣ Revisar si el mensaje es una frase común (usando el mensaje normalizado)
  if (predefinedResponses[normalizedMessage]) {
    console.log('✅ Mensaje común detectado, respondiendo automáticamente.');
    return res
      .status(200)
      .json({ reply: predefinedResponses[normalizedMessage] });
  }

  // 🔹 2️⃣ Intentar buscar la respuesta en Firestore
  const storedAnswer = await getStoredResponse(rawMessage);
  if (storedAnswer) {
    console.log('✅ Respuesta encontrada en Firestore:', storedAnswer);
    return res.status(200).json({ reply: storedAnswer });
  }

  console.log(
    '❌ No se encontró en Firestore. Consultando a OpenAI con baja creatividad...'
  );

  // 🔹 3️⃣ Si Firestore no tiene la respuesta, consultar OpenAI con baja creatividad
  try {
    const openAiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          temperature: 0.1, // 🔹 Menos creatividad, más precisión
          messages: [
            {
              role: 'system',
              content:
                "Eres un asistente experto en RealtorTrackPro. Responde solo si tienes información certera. Si no estás seguro, responde 'No tengo suficiente información para responder con certeza.'",
            },
            { role: 'user', content: rawMessage },
          ],
          max_tokens: 500,
        }),
      }
    );

    const data = await openAiResponse.json();
    const openAiReply = data.choices[0]?.message?.content?.trim();

    if (
      openAiReply &&
      openAiReply !==
        'No tengo suficiente información para responder con certeza.'
    ) {
      console.log('🤖 OpenAI respondió:', openAiReply);

      // 🔹 4️⃣ Guardar la pregunta y respuesta de OpenAI en unanswered_questions para revisión
      await saveUnansweredQuestion(rawMessage, openAiReply);

      return res.status(200).json({
        reply: `No tengo una respuesta para eso. 😔 pero puedes escribirnos en WhatsApp al número +34 637 017 737 para confirmar.`,
      });
    }
  } catch (error) {
    console.error('❌ Error al conectar con OpenAI:', error);
  }

  console.log(
    '❌ OpenAI tampoco encontró respuesta clara. Guardando en preguntas sin respuesta...'
  );

  // 🔹 5️⃣ Si OpenAI tampoco tiene una respuesta clara, guardar solo la pregunta en unanswered_questions
  await saveUnansweredQuestion(rawMessage);

  // 🔹 6️⃣ Responder con mensaje y link de WhatsApp
  const notFoundResponse = `No tengo una respuesta para eso. 😔 Pero puedes escribirnos en WhatsApp al número +34 637 017 737 para ayudarte mejor.`;
  return res.status(200).json({ reply: notFoundResponse });
}
