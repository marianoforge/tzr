// pages/api/operations/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { Operation } from '@/common/types/';
import { adminAuth } from '@/lib/firebaseAdmin';

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
    await adminAuth.verifyIdToken(token);

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
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
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getOperationById = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, 'operations', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error fetching operation:', error);
    return res.status(500).json({ message: 'Error fetching operation' });
  }
};

const updateOperation = async (
  id: string,
  updatedData: Partial<Operation>,
  res: NextApiResponse
) => {
  try {
    const docRef = doc(db, 'operations', id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    return res.status(200).json({ message: 'Operation updated successfully' });
  } catch (error) {
    console.error('Error updating operation:', error);
    return res.status(500).json({ message: 'Error updating operation', error });
  }
};

const deleteOperation = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, 'operations', id);
    await deleteDoc(docRef);
    return res.status(200).json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting operation:', error);
    return res.status(500).json({ message: 'Error deleting operation' });
  }
};
