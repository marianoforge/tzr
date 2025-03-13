import { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(
      '🔹 Nueva petición a /api/projections/getProjection',
      req.method
    );

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

    const { userID } = req.query;

    // Validar que los datos requeridos están presentes
    if (!userID) {
      console.error('❌ Datos incompletos recibidos:', { userID });
      return res.status(400).json({
        error: 'userID is required',
        payload: req.query,
      });
    }

    console.log('🔹 Obteniendo datos de proyección para:', userID);

    // Obtener los datos de Firestore
    const docRef = db
      .collection('usuarios')
      .doc(userID as string)
      .collection('datos_proyeccion')
      .doc('current');

    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(
        '⚠️ No se encontraron datos de proyección para el usuario:',
        userID
      );
      return res.status(404).json({ error: 'Projection data not found' });
    }

    const data = doc.data();

    console.log('✅ Datos de proyección obtenidos correctamente.');
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error en la API /api/projections/getProjection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
