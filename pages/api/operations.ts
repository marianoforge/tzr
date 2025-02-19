import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebaseAdmin';

import { db } from '@/lib/firebaseAdmin';
// Verificar token de Firebase en las solicitudes
const verifyToken = async (token: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/operations', req.method);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const userUID = await verifyToken(token);
    console.log('✅ Token verificado para UID:', userUID);

    switch (req.method) {
      case 'GET':
        return getUserOperations(userUID, res);
      case 'POST':
        return createOperation(req, res, userUID);
      default:
        console.warn('⚠️ Método no permitido:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserOperations = async (userUID: string, res: NextApiResponse) => {
  try {
    const querySnapshot = await db
      .collection('operations')
      .where('teamId', '==', userUID)
      .orderBy('fecha_operacion', 'asc')
      .get();

    const operations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return res.status(500).json({ message: 'Error fetching operations' });
  }
};

const createOperation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  try {
    const { teamId, ...operationData } = req.body;
    if (!teamId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newOperation = {
      ...operationData,
      user_uid: userUID,
      teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('operations').add(newOperation);
    return res
      .status(201)
      .json({ id: docRef.id, message: 'Operation created successfully' });
  } catch (error) {
    console.error('Error creating operation:', error);
    return res.status(500).json({ message: 'Error creating operation' });
  }
};
