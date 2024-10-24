import type { NextApiRequest, NextApiResponse } from 'next';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  FieldValue,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const userRef = doc(db, 'usuarios', id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(userSnap.data());
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Error fetching user data', error });
    }
  } else if (req.method === 'PUT') {
    const {
      firstName,
      lastName,
      email,
      agenciaBroker,
      numeroTelefono,
      objetivoAnual,
      stripeCustomerId,
      stripeSubscriptionId,
      priceId,
    } = req.body;

    // Check if at least one field is present in the request body
    if (
      firstName === undefined &&
      lastName === undefined &&
      email === undefined &&
      agenciaBroker === undefined &&
      numeroTelefono === undefined &&
      objetivoAnual === undefined &&
      stripeCustomerId === undefined &&
      stripeSubscriptionId === undefined &&
      priceId === undefined
    ) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    try {
      const userRef = doc(db, 'usuarios', id);
      const updates: Record<string, unknown> = {};

      // Add fields to updates object if they are present in the request body
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (email !== undefined) updates.email = email;
      if (agenciaBroker !== undefined) updates.agenciaBroker = agenciaBroker;
      if (numeroTelefono !== undefined) updates.numeroTelefono = numeroTelefono;
      if (objetivoAnual !== undefined) updates.objetivoAnual = objetivoAnual;
      if (stripeCustomerId !== undefined)
        updates.stripeCustomerId = stripeCustomerId;
      if (stripeSubscriptionId !== undefined)
        updates.stripeSubscriptionId = stripeSubscriptionId;
      if (priceId !== undefined) updates.priceId = priceId;

      updates.updatedAt = new Date();

      await updateDoc(
        userRef,
        updates as { [x: string]: FieldValue | Partial<unknown> | undefined }
      );

      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating user',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const userRef = doc(db, 'usuarios', id);
      await deleteDoc(userRef);

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
