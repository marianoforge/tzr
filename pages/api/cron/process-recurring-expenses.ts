import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Solo permitir peticiones POST para esta operación
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Verificar la clave API (opcional, para mayor seguridad)
    const apiKey = req.headers['x-api-key'];
    if (!process.env.CRON_API_KEY || apiKey !== process.env.CRON_API_KEY) {
      console.warn(
        '⚠️ Intento de acceso no autorizado a cron job. Asegúrate de agregar CRON_API_KEY a tus variables de entorno.'
      );
      return res.status(401).json({
        message: 'Unauthorized access',
        hint: 'Add CRON_API_KEY environment variable in .env.local and Vercel project settings',
      });
    }

    console.log('🔹 Iniciando procesamiento de gastos recurrentes...');

    // Obtener la fecha actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Obtener gastos recurrentes
    const querySnapshot = await db
      .collection('expenses')
      .where('isRecurring', '==', true)
      .get();

    if (querySnapshot.empty) {
      console.log('✅ No hay gastos recurrentes para procesar');
      return res
        .status(200)
        .json({ message: 'No recurring expenses to process' });
    }

    console.log(`🔹 Encontrados ${querySnapshot.size} gastos recurrentes`);

    const processedExpenses = [];
    const batchSize = 450; // Limitar el tamaño del lote para Firestore
    let batch = db.batch();
    let operationCount = 0;

    for (const doc of querySnapshot.docs) {
      const expense = doc.data() as Record<string, any>;

      // Obtener el mes y año del gasto original
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();

      // Calcular la nueva fecha para este mes
      // Solo crear si es un mes diferente al original o si es un año diferente
      if (expenseMonth === currentMonth && expenseYear === currentYear) {
        console.log(`🔹 Gasto ${doc.id} ya existe para este mes, omitiendo`);
        continue;
      }

      // Crear la nueva fecha manteniendo el mismo día pero en el mes actual
      const originalDay = expenseDate.getDate();

      // Asegurarnos de que el día sea válido para el mes actual
      // (por ejemplo, 31 no es válido para todos los meses)
      const lastDayOfMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
      ).getDate();
      const validDay = Math.min(originalDay, lastDayOfMonth);

      const newDate = new Date(currentYear, currentMonth, validDay);
      const formattedDate = newDate.toISOString().split('T')[0]; // formato YYYY-MM-DD

      // Crear un nuevo documento con los mismos datos pero fecha actualizada
      const newExpense = {
        ...expense,
        date: formattedDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Eliminar el ID si existe
      if ('id' in newExpense) {
        delete newExpense.id;
      }

      // Añadir al lote
      const newDocRef = db.collection('expenses').doc();
      batch.set(newDocRef, newExpense);
      processedExpenses.push(newDocRef.id);
      operationCount++;

      // Si llegamos al límite del lote, comprometer y crear uno nuevo
      if (operationCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        operationCount = 0;
      }
    }

    // Comprometer cualquier operación restante
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Procesados ${processedExpenses.length} gastos recurrentes`);
    return res.status(200).json({
      message: 'Recurring expenses processed successfully',
      count: processedExpenses.length,
      ids: processedExpenses,
    });
  } catch (error) {
    console.error('❌ Error procesando gastos recurrentes:', error);
    return res.status(500).json({
      message: 'Error processing recurring expenses',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
