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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    const userUIDFromRequest =
      req.method === 'GET' ? req.query.user_uid : req.body.user_uid;

    if (!userUIDFromRequest || typeof userUIDFromRequest !== 'string') {
      return res.status(400).json({ message: 'User UID is required' });
    }

    // Ensure the user making the request is the authenticated user
    if (userUID !== userUIDFromRequest) {
      return res.status(403).json({ message: 'Forbidden: User UID mismatch' });
    }

    switch (req.method) {
      case 'GET':
        return getUserEvents(userUIDFromRequest, res);
      case 'POST':
        return createEvent(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserEvents = async (userUID: string, res: NextApiResponse) => {
  try {
    const q = query(
      collection(db, 'events'),
      where('user_uid', '==', userUID),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

const createEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, date, startTime, endTime, description, address, user_uid } =
    req.body;

  if (!title || !date || !startTime || !endTime || !user_uid) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios, incluyendo el user_uid',
    });
  }

  try {
    const newEvent = {
      title,
      date,
      startTime,
      endTime,
      description,
      address,
      user_uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'events'), newEvent);

    return res
      .status(201)
      .json({ id: docRef.id, message: 'Evento creado con éxito' });
  } catch (error) {
    console.error('Error al crear el evento:', error);
    return res.status(500).json({ message: 'Error al crear el evento' });
  }
};
