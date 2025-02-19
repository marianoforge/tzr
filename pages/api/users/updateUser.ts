import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, db } from '@/lib/firebaseAdmin'; // 🔹 Use Firebase Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('🔹 Nueva petición a /api/users/updateUser');

    // 🔹 Validate Firebase Token for Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('✅ Token verificado para UID:', decodedToken.uid);

    // 🔹 Extract request body
    const { userId, stripeCustomerId, stripeSubscriptionId, role } = req.body;

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
      console.warn(
        '⚠️ Faltan campos obligatorios en la actualización de usuario.'
      );
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('🔹 Buscando usuario en Firestore:', userId);

    const userRef = db.collection('usuarios').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn('⚠️ Usuario no encontrado:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Usuario encontrado, actualizando información...');

    // 🔹 Build update object
    const updateData: {
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      role?: string;
    } = {
      stripeCustomerId,
      stripeSubscriptionId,
    };

    if (role) {
      updateData.role = role;
    }

    await userRef.update(updateData);
    console.log('✅ Usuario actualizado con éxito.');

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('❌ Error actualizando usuario:', error.message);
    return res
      .status(500)
      .json({ message: 'Error updating user', error: error.message });
  }
}
