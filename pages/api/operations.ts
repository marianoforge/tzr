// pages/api/operations.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { Operation } from '@/types';

// Handler para manejar GET y POST en este endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user_uid =
    req.method === 'GET' ? req.query.user_uid : req.body.user_uid;

  // Validar que el user_uid esté presente
  if (!user_uid || typeof user_uid !== 'string') {
    return res.status(400).json({ message: 'User UID is required' });
  }

  switch (req.method) {
    case 'GET':
      return getUserOperations(user_uid, res);
    case 'POST':
      return createOperation(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

const getUserOperations = async (userUID: string, res: NextApiResponse) => {
  try {
    const q = query(
      collection(db, 'operations'),
      where('teamId', '==', userUID), // Filtra por teamId igual a userUID
      orderBy('fecha_operacion', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const operations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return res.status(500).json({ message: 'Error fetching operations' });
  }
};

const createOperation = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    fecha_operacion,
    direccion_reserva,
    localidad_reserva,
    provincia_reserva,
    tipo_operacion,
    valor_reserva,
    porcentaje_punta_compradora,
    porcentaje_punta_vendedora,
    porcentaje_honorarios_asesor,
    porcentaje_honorarios_broker,
    user_uid,
    user_uid_adicional,
    teamId, // Añadir teamId aquí
    ...rest
  } = req.body;

  // Validar que todos los campos requeridos estén presentes.
  // Asegúrate de que los porcentajes permitan valores de 0.
  if (
    !fecha_operacion ||
    !direccion_reserva ||
    !localidad_reserva ||
    !provincia_reserva ||
    !tipo_operacion ||
    valor_reserva === undefined || // Acepta valores numéricos incluyendo 0
    porcentaje_honorarios_asesor === undefined || // Acepta 0
    porcentaje_honorarios_broker === undefined || // Acepta 0
    porcentaje_punta_compradora === undefined || // Acepta 0
    porcentaje_punta_vendedora === undefined || // Acepta 0
    !user_uid ||
    !teamId
  ) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const newOperation: Operation = {
      fecha_operacion,
      direccion_reserva,
      localidad_reserva,
      provincia_reserva,
      tipo_operacion,
      valor_reserva,
      porcentaje_punta_compradora,
      porcentaje_punta_vendedora,
      porcentaje_honorarios_asesor,
      porcentaje_honorarios_broker,
      user_uid,
      user_uid_adicional: user_uid_adicional || null, // Asigna null si es undefined
      teamId,
      ...rest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'operations'), newOperation);
    return res
      .status(201)
      .json({ id: docRef.id, message: 'Operación creada exitosamente' });
  } catch (error) {
    console.error('Error creando la operación:', error);
    return res.status(500).json({ message: 'Error creando la operación' });
  }
};
