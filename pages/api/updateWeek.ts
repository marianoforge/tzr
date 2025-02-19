import { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

type WeekData = {
  actividadVerde: string;
  contactosReferidos: string;
  preBuying: string;
  preListing: string;
  captaciones: string;
  reservas: string;
  cierres: string;
  semana: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/week', req.method);

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

    const {
      weekNumber,
      userID,
      data,
    }: { weekNumber: number; userID: string; data: WeekData } = req.body;

    // Validar que los datos requeridos están presentes
    if (!weekNumber || !userID || !data) {
      console.error('❌ Datos incompletos recibidos:', {
        weekNumber,
        userID,
        data,
      });
      return res.status(400).json({
        error: 'weekNumber, userID, and data are required',
        payload: req.body,
      });
    }

    console.log('🔹 Guardando datos de la semana:', {
      userID,
      weekNumber,
      data,
    });

    // Guardar los datos en Firestore usando Firebase Admin SDK
    await db
      .collection('usuarios')
      .doc(userID)
      .collection('weeks')
      .doc(`week-${weekNumber}`)
      .set(data);

    console.log('✅ Datos de la semana actualizados correctamente.');
    return res.status(200).json({ message: 'Week data updated successfully' });
  } catch (error) {
    console.error('❌ Error en la API /api/week:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
