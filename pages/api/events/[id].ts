import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
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
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getEventById = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ message: 'Error fetching event' });
  }
};

const updateEvent = async (
  id: string,
  updatedData: Partial<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }>,
  res: NextApiResponse
) => {
  try {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date(),
    });
    return res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ message: 'Error updating event' });
  }
};

const deleteEvent = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, 'events', id);
    await deleteDoc(docRef);
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ message: 'Error deleting event' });
  }
};
