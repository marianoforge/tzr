import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebaseAdmin';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const userUID = await verifyToken(token);

    switch (req.method) {
      case 'GET':
        return getUserOperations(userUID, res);
      case 'POST':
        return createOperation(req, res, userUID);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserOperations = async (userUID: string, res: NextApiResponse) => {
  const q = query(
    collection(db, 'operations'),
    where('teamId', '==', userUID),
    orderBy('fecha_operacion', 'asc')
  );
  const querySnapshot = await getDocs(q);
  const operations = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return res.status(200).json(operations);
};

const createOperation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
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

  const docRef = await addDoc(collection(db, 'operations'), newOperation);
  return res
    .status(201)
    .json({ id: docRef.id, message: 'Operation created successfully' });
};
