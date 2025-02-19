import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/teamMember', req.method);

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
    const userUID = decodedToken.uid;

    console.log('✅ Token verificado para UID:', userUID);

    const { id } = req.query; // Obtener el ID del miembro del equipo desde la URL

    if (!id || typeof id !== 'string') {
      console.warn('⚠️ ID del miembro del equipo requerido o inválido.');
      return res.status(400).json({ message: 'Team member ID is required' });
    }

    console.log('🔹 Buscando miembro del equipo con ID:', id);

    const memberRef = db.collection('teams').doc(id);
    const memberSnap = await memberRef.get();

    if (!memberSnap.exists) {
      console.warn('⚠️ Miembro del equipo no encontrado:', id);
      return res.status(404).json({ message: 'Member not found' });
    }

    const memberData = memberSnap.data();

    // 🔒 Asegurar que el usuario autenticado es el `teamLeadID` del miembro
    if (memberData?.teamLeadID !== userUID) {
      console.warn('⚠️ Usuario no autorizado para modificar este miembro.');
      return res.status(403).json({
        message: 'Forbidden: You are not allowed to modify this team member',
      });
    }

    if (req.method === 'DELETE') {
      console.log('🔹 Eliminando miembro del equipo con ID:', id);
      await memberRef.delete();
      return res.status(200).json({ message: 'Member deleted successfully' });
    }

    if (req.method === 'PUT') {
      const { firstName, lastName, email } = req.body;

      if (!firstName && !lastName && !email) {
        console.warn('⚠️ No hay campos para actualizar.');
        return res.status(400).json({ message: 'No fields to update' });
      }

      console.log('🔹 Actualizando miembro del equipo con ID:', id);
      await memberRef.update({ firstName, lastName, email });

      return res.status(200).json({ message: 'Member updated successfully' });
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Error en la API /api/teamMember:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
