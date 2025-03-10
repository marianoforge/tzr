import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  DocumentData,
  addDoc,
  query,
  where,
} from 'firebase/firestore';

/**
 * 🔹 Función para normalizar texto: elimina tildes, mayúsculas y espacios extras.
 */
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD') // Remueve tildes
    .replace(/[\u0300-\u036f]/g, ''); // Remueve diacríticos

/**
 * 🔹 Función para calcular la similitud de Jaccard entre dos textos.
 */
const calculateJaccardSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  const intersection = new Set(
    Array.from(set1).filter((word) => set2.has(word))
  );
  const union = new Set([...Array.from(set1), ...Array.from(set2)]);
  return intersection.size / union.size; // Índice de similitud (0 a 1)
};

interface ChatResponse extends DocumentData {
  keywords: string[];
  answer: string;
}

/**
 * 🔎 Busca la mejor coincidencia en Firestore basada en similitud de palabras clave.
 */
export const getStoredResponse = async (message: string) => {
  try {
    const chatCollection = collection(db, 'chat_responses');
    const snapshot = await getDocs(chatCollection);

    let bestMatch: ChatResponse | null = null;
    let highestScore = 0.0;

    const normalizedMessage = normalizeText(message);

    snapshot.forEach((doc) => {
      const data = doc.data() as ChatResponse;
      const keywords: string[] = data.keywords || [];

      keywords.forEach((keyword) => {
        const similarity = calculateJaccardSimilarity(
          normalizedMessage,
          normalizeText(keyword)
        );
        if (similarity > highestScore) {
          highestScore = similarity;
          bestMatch = data;
        }
      });
    });

    // 🔹 Si la mejor coincidencia tiene un 30% o más de similitud, la devolvemos
    return highestScore >= 0.3 && bestMatch
      ? (bestMatch as ChatResponse).answer
      : null;
  } catch (error) {
    console.error('Error buscando respuesta en Firestore:', error);
    return null;
  }
};

/**
 * 💾 Guarda una nueva respuesta en Firestore para futuras consultas.
 */
export const saveResponse = async (question: string, answer: string) => {
  try {
    const chatCollection = collection(db, 'chat_responses');
    const docRef = await addDoc(chatCollection, {
      keywords: [question],
      answer: answer,
      createdAt: new Date(),
    });
    console.log('✅ Respuesta guardada en Firestore con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error guardando respuesta en Firestore:', error);
    return null;
  }
};

/**
 * ❓ Guarda preguntas sin respuesta en Firestore para revisión futura.
 */
export const saveUnansweredQuestion = async (
  question: string,
  openAiReply?: string
) => {
  try {
    const unansweredCollection = collection(db, 'unanswered_questions');

    // Verificar si ya existe esta pregunta en la colección
    const q = query(unansweredCollection, where('question', '==', question));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log('🔹 La pregunta ya está registrada:', question);
      return;
    }

    await addDoc(unansweredCollection, {
      question,
      openAiReply,
      timestamp: new Date(),
    });

    console.log('✅ Pregunta sin respuesta guardada en Firestore:', question);
  } catch (error) {
    console.error('❌ Error guardando pregunta sin respuesta:', error);
  }
};
