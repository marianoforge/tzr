import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { agenciaBroker } = req.query;
  if (!agenciaBroker || typeof agenciaBroker !== 'string') {
    console.warn('⚠️ agenciaBroker es requerido o inválido.');
    return res
      .status(400)
      .json({ message: 'agenciaBroker is required and must be a string' });
  }

  try {
    console.log(
      '🔹 Nueva petición a /api/agenciaBroker con agenciaBroker:',
      agenciaBroker
    );

    // 🔹 Validar el token de Firebase para autenticación
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

    // 🔹 Consultar usuarios en Firestore por agenciaBroker
    console.log('🔹 Buscando usuarios en la agenciaBroker:', agenciaBroker);
    const querySnapshot = await db
      .collection('usuarios')
      .where('agenciaBroker', '==', agenciaBroker)
      .get();

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`✅ Se encontraron ${users.length} usuarios.`);

    return res.status(200).json(users);
  } catch (error) {
    console.error('❌ Error obteniendo usuarios de agenciaBroker:', error);
    return res.status(500).json({ message: 'Error fetching users', error });
  }
}
