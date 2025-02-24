import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin';
import { ExpenseFormData } from '@/common/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/expenses/[id]', req.method);

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

    // 🔹 Obtener el ID del gasto desde la URL
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      console.warn('⚠️ ID de gasto requerido o inválido.');
      return res
        .status(400)
        .json({ message: 'Expense ID is required and must be a string' });
    }

    switch (req.method) {
      case 'GET':
        return getExpenseById(id, res);
      case 'PUT':
        return updateExpense(id, req.body, res);
      case 'DELETE':
        return deleteExpense(id, res);
      default:
        console.warn('⚠️ Método no permitido:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('❌ Error en la autenticación:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
}

// 🔹 Obtener un gasto por ID
const getExpenseById = async (id: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Buscando gasto con ID:', id);
    const docRef = doc(db, 'expenses', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn('⚠️ Gasto no encontrado:', id);
      return res.status(404).json({ message: 'Expense not found' });
    }

    console.log('✅ Gasto encontrado.');
    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('❌ Error obteniendo gasto:', error);
    return res.status(500).json({ message: 'Error fetching expense', error });
  }
};

// 🔹 Actualizar un gasto por ID
const updateExpense = async (
  id: string,
  updatedData: Partial<ExpenseFormData>,
  res: NextApiResponse
) => {
  try {
    console.log('🔹 Actualizando gasto con ID:', id);
    const docRef = doc(db, 'expenses', id);

    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Gasto actualizado con éxito.');
    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('❌ Error actualizando gasto:', error);
    return res.status(500).json({ message: 'Error updating expense', error });
  }
};

// 🔹 Eliminar un gasto por ID
const deleteExpense = async (id: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Eliminando gasto con ID:', id);
    const docRef = doc(db, 'expenses', id);
    await deleteDoc(docRef);

    console.log('✅ Gasto eliminado con éxito.');
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('❌ Error eliminando gasto:', error);
    return res.status(500).json({ message: 'Error deleting expense', error });
  }
};
