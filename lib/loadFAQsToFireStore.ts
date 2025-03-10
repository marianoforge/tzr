import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const faqData = [
  {
    question: '¿Cómo agregar una operación?',
    answer:
      'Para agregar una operación en RealtorTrackPro, ve a la sección Form de operaciones y luego completa los campos requeridos y guarda los cambios.',
    keywords: ['agregar operación', 'crear operación', 'nueva operación'],
  },
  {
    question: '¿Cómo ver reportes financieros?',
    answer:
      'Puedes ver los reportes financieros en el panel de análisis de RealtorTrackPro.',
    keywords: ['ver reportes', 'reportes financieros', 'estadísticas'],
  },
  {
    question: '¿Cómo recuperar mi contraseña?',
    answer:
      "Para recuperar tu contraseña, haz clic en '¿Olvidaste tu contraseña?' en la página de inicio de sesión.",
    keywords: [
      'recuperar contraseña',
      'olvidé mi clave',
      'resetear contraseña',
    ],
  },
];

export const loadFAQsToFirestore = async () => {
  try {
    const chatCollection = collection(db, 'chat_responses');

    for (const faq of faqData) {
      await addDoc(chatCollection, faq);
      console.log('✅ FAQ guardada:', faq.question);
    }
  } catch (error) {
    console.error('❌ Error guardando FAQs:', error);
  }
};
