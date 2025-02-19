import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/user/[id]', req.method);

    // 🔹 Validar el token de Firebase para autenticación
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

    const { id } = req.query;

    // Validar que `id` esté presente y sea string
    if (!id || typeof id !== 'string') {
      console.warn('⚠️ User ID es requerido o inválido.');
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userRef = db.collection('usuarios').doc(id);

    if (req.method === 'GET') {
      console.log('🔹 Buscando datos del usuario con ID:', id);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        console.warn('⚠️ Usuario no encontrado:', id);
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = userSnap.data();
      console.log('✅ Usuario encontrado:', userData);
      return res.status(200).json(userData);
    }

    if (req.method === 'PUT') {
      console.log('🔹 Intentando actualizar usuario con ID:', id);

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

      // Verificar si hay algún campo para actualizar
      const updates: Record<string, unknown> = {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(agenciaBroker !== undefined && { agenciaBroker }),
        ...(numeroTelefono !== undefined && { numeroTelefono }),
        ...(objetivoAnual !== undefined && { objetivoAnual }),
        ...(stripeCustomerId !== undefined && { stripeCustomerId }),
        ...(stripeSubscriptionId !== undefined && { stripeSubscriptionId }),
        ...(priceId !== undefined && { priceId }),
        updatedAt: new Date().toISOString(),
      };

      if (Object.keys(updates).length === 1) {
        console.warn('⚠️ No hay campos válidos para actualizar.');
        return res.status(400).json({ message: 'No fields to update' });
      }

      await userRef.update(updates);
      console.log('✅ Usuario actualizado con éxito.');
      return res.status(200).json({ message: 'User updated successfully' });
    }

    if (req.method === 'DELETE') {
      console.log('🔹 Eliminando usuario con ID:', id);
      await userRef.delete();
      console.log('✅ Usuario eliminado con éxito.');
      return res.status(200).json({ message: 'User deleted successfully' });
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Error en la API /api/user/[id]:', error);
    return res
      .status(500)
      .json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      });
  }
}
