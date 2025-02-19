import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin';
import { EventFormData } from '@/common/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/events/[id]', req.method);

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

    // 🔹 Obtener el ID del evento desde la URL
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      console.warn('⚠️ ID del evento requerido o inválido.');
      return res
        .status(400)
        .json({ message: 'Event ID is required and must be a string' });
    }

    switch (req.method) {
      case 'GET':
        return getEventById(id, res);
      case 'PUT':
        return updateEvent(id, req.body, res);
      case 'DELETE':
        return deleteEvent(id, res);
      default:
        console.warn('⚠️ Método no permitido:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('❌ Error en la autenticación:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
}

// 🔹 Obtener un evento por ID
const getEventById = async (id: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Buscando evento con ID:', id);
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn('⚠️ Evento no encontrado:', id);
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('✅ Evento encontrado.');
    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('❌ Error obteniendo evento:', error);
    return res.status(500).json({ message: 'Error fetching event', error });
  }
};

// 🔹 Actualizar un evento por ID
const updateEvent = async (
  id: string,
  updatedData: Partial<EventFormData>,
  res: NextApiResponse
) => {
  try {
    console.log('🔹 Actualizando evento con ID:', id);
    const docRef = doc(db, 'events', id);

    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Evento actualizado con éxito.');
    return res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('❌ Error actualizando evento:', error);
    return res.status(500).json({ message: 'Error updating event', error });
  }
};

// 🔹 Eliminar un evento por ID
const deleteEvent = async (id: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Eliminando evento con ID:', id);
    const docRef = doc(db, 'events', id);
    await deleteDoc(docRef);

    console.log('✅ Evento eliminado con éxito.');
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('❌ Error eliminando evento:', error);
    return res.status(500).json({ message: 'Error deleting event', error });
  }
};
