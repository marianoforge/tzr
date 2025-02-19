import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { userSchema } from '@/common/schemas/userSchema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/usersWithOps', req.method);

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

    if (req.method === 'GET') {
      try {
        console.log('🔹 Obteniendo usuarios y operaciones...');

        const csrfToken = setCsrfCookie(res);

        // Obtener todos los usuarios
        const usuariosSnapshot = await db.collection('usuarios').get();
        const usuarios = usuariosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Obtener operaciones de cada usuario en paralelo
        const usersWithOperations = await Promise.all(
          usuarios.map(async (usuario) => {
            const operationsSnapshot = await db
              .collection('operations')
              .where('user_uid', '==', usuario.id)
              .get();

            const operaciones = operationsSnapshot.docs.map((opDoc) =>
              opDoc.data()
            );

            return { ...usuario, operaciones };
          })
        );

        console.log('✅ Datos de usuarios y operaciones obtenidos.');
        return res.status(200).json({ csrfToken, usersWithOperations });
      } catch (error) {
        console.error('❌ Error obteniendo datos:', error);
        return res
          .status(500)
          .json({ message: 'Error fetching users and operations' });
      }
    }

    if (req.method === 'POST') {
      console.log('🔹 Intentando crear un nuevo usuario...');

      const isValidCsrf = validateCsrfToken(req);
      if (!isValidCsrf) {
        console.warn('⚠️ Token CSRF inválido.');
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }

      try {
        await userSchema.validate(req.body, { abortEarly: false });

        const { uid, email, numeroTelefono, firstName, lastName } = req.body;

        const newUserRef = await db.collection('usuarios').add({
          uid,
          email,
          numeroTelefono,
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
        });

        console.log('✅ Usuario creado con ID:', newUserRef.id);
        return res.status(201).json({
          message: 'User created successfully',
          id: newUserRef.id,
        });
      } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        return res.status(500).json({ message: 'Error creating user' });
      }
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Error en la API /api/usersWithOps:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
