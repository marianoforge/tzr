import { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(
      '🔹 Nueva petición a /api/projections/saveProjection',
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

    if (req.method !== 'POST') {
      console.warn('⚠️ Método no permitido:', req.method);
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }

    const { userID, data } = req.body;

    // Validar que los datos requeridos están presentes
    if (!userID || !data) {
      console.error('❌ Datos incompletos recibidos:', { userID, data });
      return res.status(400).json({
        error: 'userID and data are required',
        payload: req.body,
      });
    }

    console.log('🔹 Guardando datos de proyección:', { userID, data });

    // Guardar los datos en Firestore usando Firebase Admin SDK
    await db
      .collection('usuarios')
      .doc(userID)
      .collection('datos_proyeccion')
      .doc('current') // ID fijo para siempre sobrescribir el mismo documento
      .set({
        ...data,
        createdAt: new Date().toISOString(),
      });

    console.log('✅ Datos de proyección guardados correctamente.');
    return res
      .status(200)
      .json({ message: 'Projection data saved successfully' });
  } catch (error) {
    console.error('❌ Error en la API /api/projections/saveProjection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
