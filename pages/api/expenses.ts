// pages/api/expenses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/expenses', req.method);

    // Verificar el token de autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID =
      req.method === 'GET' ? req.query.user_uid : req.body.user_uid;

    if (!userUID || typeof userUID !== 'string') {
      console.warn('⚠️ User UID no proporcionado.');
      return res.status(400).json({ message: 'User UID is required' });
    }

    console.log('✅ Token verificado para UID:', decodedToken.uid);

    switch (req.method) {
      case 'GET':
        return getUserExpenses(userUID, res);
      case 'POST':
        return createExpense(req, res, userUID);
      default:
        console.warn('⚠️ Método no permitido:', req.method);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Error en la API /api/expenses:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserExpenses = async (userUID: string, res: NextApiResponse) => {
  try {
    console.log('🔹 Consultando gastos para UID:', userUID);

    const querySnapshot = await db
      .collection('expenses')
      .where('user_uid', '==', userUID)
      .orderBy('date', 'asc')
      .get();

    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ ${expenses.length} gastos encontrados.`);
    res.status(200).json(expenses);
  } catch (error) {
    console.error('❌ Error al obtener gastos:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

const createExpense = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  try {
    const {
      date,
      amount,
      amountInDollars,
      expenseType,
      description,
      dollarRate,
      otherType,
      isRecurring,
    } = req.body;

    // Obtener el usuario y su moneda
    const userDoc = await db.collection('users').doc(userUID).get();
    const userData = userDoc.data();
    const userCurrency = userData?.currency || null;

    // Validar campos requeridos
    if (!date || !amount || !expenseType) {
      console.warn('⚠️ Faltan campos obligatorios.');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Si la moneda NO es USD, verificar que dollarRate exista
    if (userCurrency !== 'USD' && !dollarRate) {
      console.warn('⚠️ Falta tasa de cambio para moneda no USD.');
      return res
        .status(400)
        .json({ message: 'Dollar rate is required for non-USD currency' });
    }

    // Calcular amountInDollars según la moneda
    const calculatedAmountInDollars =
      userCurrency === 'USD' ? amount : amount / dollarRate;

    const newExpense = {
      date,
      amount,
      amountInDollars: calculatedAmountInDollars,
      expenseType,
      description,
      dollarRate: userCurrency === 'USD' ? 1 : dollarRate, // Si es USD, usar 1 como tasa
      user_uid: userUID,
      otherType: otherType ?? '',
      isRecurring: isRecurring ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('expenses').add(newExpense);

    console.log('✅ Gasto creado con ID:', docRef.id);
    return res
      .status(201)
      .json({ id: docRef.id, message: 'Expense created successfully' });
  } catch (error) {
    console.error('❌ Error al crear gasto:', error);
    return res.status(500).json({ message: 'Error creating expense' });
  }
};
