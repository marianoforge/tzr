import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const { userId, stripeCustomerId, stripeSubscriptionId, role } = req.body;

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userRef = doc(db, 'usuarios', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }

    await updateDoc(userRef, {
      stripeCustomerId,
      stripeSubscriptionId,
      role,
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error.message);
    res
      .status(500)
      .json({ message: 'Error updating user', error: error.message });
  }
}
