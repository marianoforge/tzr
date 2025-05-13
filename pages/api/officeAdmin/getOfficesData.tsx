import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin';

interface OfficeData {
  [key: string]: {
    office: string;
    [key: string]: any;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(
      '🔹 Nueva petición a /api/officeAdmin/getOfficesData',
      req.method
    );

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

    if (req.method === 'GET') {
      // UID específico a buscar
      const targetUID = '2t9qNCFDD1XLEdisyXp9wOITJcc2';

      // Buscar el usuario específico
      const userRef = db.collection('usuarios').doc(targetUID);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        console.warn('⚠️ Usuario no encontrado:', targetUID);
        return res.status(404).json({ message: 'User not found' });
      }

      // Obtener todas las oficinas del usuario
      const officesSnapshot = await userRef.collection('offices').get();

      if (officesSnapshot.empty) {
        console.log('⚠️ No se encontraron oficinas para el usuario');
        return res.status(200).json({ operations: [] });
      }

      // Recopilar todos los UIDs de oficinas y sus nombres
      const officeUIDs = officesSnapshot.docs.map((doc) => doc.id);
      const officeData: OfficeData = officesSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = {
          office: doc.data().office || doc.id,
          ...doc.data(),
        };
        return acc;
      }, {} as OfficeData);

      console.log('🔹 UIDs de oficinas encontrados:', officeUIDs);

      // Lista los ids individuales para debugging
      officesSnapshot.docs.forEach((doc) => {
        console.log(`- Oficina ID: ${doc.id}, Datos:`, doc.data());
      });

      // Buscar operaciones que coincidan con los UIDs de oficinas
      const operationsSnapshot = await db
        .collection('operations')
        .where('teamId', 'in', officeUIDs)
        .get();

      if (operationsSnapshot.empty) {
        console.log('⚠️ No se encontraron operaciones para estas oficinas');
        return res.status(200).json({ operations: [], offices: officeData });
      }

      // Transformar los documentos en un array de datos
      const operations = operationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`✅ Se encontraron ${operations.length} operaciones`);
      return res.status(200).json({ operations, offices: officeData });
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('❌ Error en la API /api/officeAdmin/getOfficesData:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
