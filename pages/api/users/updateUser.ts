import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, stripeCustomerId, stripeSubscriptionId, role } = req.body;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userRef = doc(db, 'usuarios', userId);
    await updateDoc(userRef, {
      stripeCustomerId,
      stripeSubscriptionId,
      role,
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
}
