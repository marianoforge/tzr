// pages/api/getTeamsWithOperations.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import { db } from '@/lib/firebaseAdmin';
import { adminAuth } from '@/lib/firebaseAdmin';

type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  [key: string]: string | Operation[]; // Extendable properties
};

type Operation = {
  id: string;
  user_uid: string;
  user_uid_Adicional: string;
  [key: string]: string | Operation[]; // Extendable properties
};

type TeamMemberWithOperations = TeamMember & {
  operations: Operation[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 🔹 Validar el token de Firebase para autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    // Step 1: Fetch all Team Members and Operations in parallel
    const [teamMembersSnapshot, operationsSnapshot] = await Promise.all([
      db.collection('teams').get(),
      db.collection('operations').get(),
    ]);

    const teamMembers: TeamMember[] = [];
    teamMembersSnapshot.forEach((doc) => {
      teamMembers.push({ id: doc.id, ...doc.data() } as TeamMember);
    });

    const operations: Operation[] = [];
    operationsSnapshot.forEach((doc) => {
      operations.push({ id: doc.id, ...doc.data() } as Operation);
    });

    // Step 2: Combine data
    const result: TeamMemberWithOperations[] = teamMembers.map((member) => {
      const memberOperations = operations.filter(
        (op) => op.user_uid === member.id || op.user_uid_adicional === member.id
      );

      return { ...member, operations: memberOperations };
    });

    // Step 3: Respond with the combined data
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
