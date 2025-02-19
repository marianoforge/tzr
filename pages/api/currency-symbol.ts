import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/currency-symbol', req.method);

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
    const userUID = decodedToken.uid;

    console.log('✅ Token verificado para UID:', userUID);

    const { user_uid } = req.query;

    // Validar que `user_uid` esté presente y sea string
    if (!user_uid || typeof user_uid !== 'string') {
      console.warn('⚠️ User UID no proporcionado o inválido.');
      return res.status(400).json({ message: 'User UID is required' });
    }

    if (req.method !== 'GET') {
      console.warn('⚠️ Método no permitido:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('🔹 Consultando símbolo de moneda para UID:', user_uid);

    const userDoc = await db.collection('usuarios').doc(user_uid).get();

    if (!userDoc.exists) {
      console.warn('⚠️ Usuario no encontrado:', user_uid);
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    const currencySymbol = userData?.currencySymbol;

    if (!currencySymbol) {
      console.warn('⚠️ Símbolo de moneda no encontrado para UID:', user_uid);
      return res.status(404).json({ message: 'Currency symbol not found' });
    }

    console.log('✅ Símbolo de moneda encontrado:', currencySymbol);
    return res.status(200).json({ currencySymbol });
  } catch (error) {
    console.error('❌ Error en la API /api/currency-symbol:', error);
    return res.status(500).json({ message: 'Error fetching currency symbol' });
  }
}
