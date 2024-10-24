import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'; // Importa Firestore funciones

import { db } from '@/lib/firebase'; // Asegúrate de importar tu instancia de Firestore

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // Obtener el ID del miembro de los parámetros de la URL

  if (req.method === 'DELETE') {
    try {
      // Borrar el documento del miembro en Firestore
      const memberRef = doc(db, 'teams', id as string);
      await deleteDoc(memberRef);
      return res
        .status(200)
        .json({ message: 'Miembro eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar el miembro:', error);
      return res.status(500).json({ error: 'Error al eliminar el miembro.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Actualizar los datos del miembro en Firestore
      const { firstName, lastName, email } = req.body;
      const memberRef = doc(db, 'teams', id as string);
      await updateDoc(memberRef, { firstName, lastName, email });

      return res
        .status(200)
        .json({ message: 'Miembro actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar el miembro:', error);
      return res.status(500).json({ error: 'Error al actualizar el miembro.' });
    }
  }

  // Retornar 405 si el método no es DELETE ni PUT
  return res.status(405).json({ message: 'Método no permitido.' });
}
