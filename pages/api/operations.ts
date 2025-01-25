import type { NextApiRequest, NextApiResponse } from 'next';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user_uid =
      req.method === 'GET' ? req.query.user_uid : req.body.user_uid;

    if (!user_uid || typeof user_uid !== 'string') {
      return res.status(400).json({ message: 'User UID is required' });
    }

    switch (req.method) {
      case 'GET':
        return getUserOperations(user_uid, res);
      case 'POST':
        return createOperation(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserOperations = async (userUID: string, res: NextApiResponse) => {
  try {
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
  } catch (error) {
    console.error('Error fetching operations:', error);
    return res.status(500).json({ message: 'Error fetching operations' });
  }
};

const createOperation = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user_uid, teamId, ...operationData } = req.body;

  if (!user_uid || !teamId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newOperation = {
    ...operationData,
    user_uid,
    teamId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'operations'), newOperation);
    return res
      .status(201)
      .json({ id: docRef.id, message: 'Operation created successfully' });
  } catch (error) {
    console.error('Error creating operation:', error);
    return res.status(500).json({ message: 'Error creating the operation' });
  }
};
