import { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin';

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
  const { method } = req;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    if (method === 'POST') {
      const {
        weekNumber,
        userID,
        data,
      }: { weekNumber: number; userID: string; data: WeekData } = req.body;

      if (!weekNumber || !userID || !data) {
        console.error('Datos incompletos recibidos:', {
          weekNumber,
          userID,
          data,
        });
        return res.status(400).json({
          error: 'weekNumber, userID, and data are required',
          payload: req.body,
        });
      }

      try {
        const docRef = doc(
          db,
          `usuarios/${userID}/weeks`,
          `week-${weekNumber}`
        );

        await setDoc(docRef, data);

        res.status(200).json({ message: 'Week data updated successfully' });
      } catch (error) {
        console.error('Error actualizando los datos en Firestore:', error);
        res.status(500).json({ error: 'Failed to update week data' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
