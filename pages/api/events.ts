import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/events', req.method);

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

    const userUIDFromRequest =
      req.method === 'GET' ? req.query.user_uid : req.body.user_uid;

    // Validar que `user_uid` esté presente y coincida con el usuario autenticado
    if (!userUIDFromRequest || typeof userUIDFromRequest !== 'string') {
      console.warn('⚠️ User UID no proporcionado o inválido.');
      return res.status(400).json({ message: 'User UID is required' });
    }

    if (userUID !== userUIDFromRequest) {
      console.warn('⚠️ Intento de acceso no autorizado.');
      return res.status(403).json({ message: 'Forbidden: User UID mismatch' });
    }

    switch (req.method) {
      case 'GET':
        return getUserEvents(userUIDFromRequest, res);
      case 'POST':
        return createEvent(req, res, userUIDFromRequest);
      default:
        console.warn('⚠️ Método no permitido:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Error en la API /api/events:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserEvents = async (userUID: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Consultando eventos para UID:', userUID);

    const querySnapshot = await db
      .collection('events')
      .where('user_uid', '==', userUID)
      .orderBy('date', 'asc')
      .get();

    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ ${events.length} eventos encontrados.`);
    return res.status(200).json(events);
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    return res.status(500).json({ message: 'Error fetching events' });
  }
};

const createEvent = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  try {
    const { title, date, startTime, endTime, description, address } = req.body;

    // Validar campos requeridos
    if (!title || !date || !startTime || !endTime) {
      console.warn('⚠️ Faltan campos obligatorios en la creación de eventos.');
      return res.status(400).json({
        message: 'Todos los campos son obligatorios, incluyendo el user_uid',
      });
    }

    const newEvent = {
      title,
      date,
      startTime,
      endTime,
      description: description || '',
      address: address || '',
      user_uid: userUID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('events').add(newEvent);

    console.log('✅ Evento creado con ID:', docRef.id);
    return res
      .status(201)
      .json({ id: docRef.id, message: 'Evento creado con éxito' });
  } catch (error) {
    console.error('❌ Error al crear el evento:', error);
    return res.status(500).json({ message: 'Error al crear el evento' });
  }
};
