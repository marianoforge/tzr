import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { adminAuth } from '@/lib/firebaseAdmin';
import { Operation } from '@/common/types';

const db = getFirestore(); // ✅ Usa Firebase Admin Firestore

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/operations/[id]', req.method);

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

    // 🔹 Obtener el ID de la operación desde la URL
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      console.warn('⚠️ ID de operación requerido o inválido.');
      return res
        .status(400)
        .json({ message: 'Operation ID is required and must be a string' });
    }

    switch (req.method) {
      case 'GET':
        return getOperationById(id, res);
      case 'PUT':
        return updateOperation(id, req.body, res);
      case 'DELETE':
        return deleteOperation(id, res);
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

// 🔹 Obtener una operación por ID
const getOperationById = async (id: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Buscando operación con ID:', id);
    const docRef = db.collection('operations').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn('⚠️ Operación no encontrada:', id);
      return res.status(404).json({ message: 'Operation not found' });
    }

    console.log('✅ Operación encontrada.');
    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('❌ Error obteniendo operación:', error);
    return res.status(500).json({ message: 'Error fetching operation', error });
  }
};

// 🔹 Actualizar una operación por ID
const updateOperation = async (
  id: string,
  updatedData: Partial<Operation>,
  res: NextApiResponse
) => {
  try {
    console.log('🔹 Actualizando operación con ID:', id);
    const docRef = db.collection('operations').doc(id);

    await docRef.update({
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Operación actualizada con éxito.');
    return res.status(200).json({ message: 'Operation updated successfully' });
  } catch (error) {
    console.error('❌ Error actualizando operación:', error);
    return res.status(500).json({ message: 'Error updating operation', error });
  }
};

// 🔹 Eliminar una operación por ID
const deleteOperation = async (id: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Eliminando operación con ID:', id);
    const docRef = db.collection('operations').doc(id);
    await docRef.delete();

    console.log('✅ Operación eliminada con éxito.');
    return res.status(200).json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('❌ Error eliminando operación:', error);
    return res.status(500).json({ message: 'Error deleting operation', error });
  }
};
