import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc } from 'firebase/firestore';

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

    const user_uid = req.query.user_uid;

    if (!user_uid || typeof user_uid !== 'string') {
      return res.status(400).json({ message: 'User UID is required' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const userDocRef = doc(db, 'usuarios', user_uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    const currencySymbol = userData?.currencySymbol;

    if (!currencySymbol) {
      return res.status(404).json({ message: 'Currency symbol not found' });
    }

    res.status(200).json({ currencySymbol });
  } catch (error) {
    console.error('Error fetching currency symbol:', error);
    res.status(500).json({ message: 'Error fetching currency symbol' });
  }
}
