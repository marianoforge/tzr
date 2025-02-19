import { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/weeks', req.method);

    // Verificar el token de autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    console.log('✅ Token verificado para UID:', decodedToken.uid);

    if (req.method !== 'GET') {
      console.warn('⚠️ Método no permitido:', req.method);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }

    const { userId } = req.query;

    // Validar que el userId esté presente
    if (!userId || typeof userId !== 'string') {
      console.warn('⚠️ User ID no proporcionado.');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('🔹 Consultando semanas para UID:', userId);

    try {
      const weeksSnapshot = await db
        .collection('usuarios')
        .doc(userId)
        .collection('weeks')
        .get();

      const weeks = weeksSnapshot.docs.map((doc) => ({
        id: doc.id,
        semana: doc.data().semana,
        ...doc.data(),
      }));

      console.log(`✅ ${weeks.length} semanas encontradas.`);
      return res.status(200).json(weeks);
    } catch (error) {
      console.error('❌ Error al obtener semanas:', error);
      return res.status(500).json({ error: 'Failed to fetch weeks' });
    }
  } catch (error) {
    console.error('❌ Error en la API /api/weeks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
