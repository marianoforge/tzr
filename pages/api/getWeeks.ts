import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const weeksCollection = collection(db, `usuarios/${userId}/weeks`);
      const weeksSnapshot = await getDocs(weeksCollection);

      const weeks = weeksSnapshot.docs.map((doc) => ({
        id: doc.id,
        semana: doc.data().semana,
        ...doc.data(),
      }));

      res.status(200).json(weeks);
    } catch (error) {
      console.error('Error fetching weeks:', error);
      res.status(500).json({ error: 'Failed to fetch weeks' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
