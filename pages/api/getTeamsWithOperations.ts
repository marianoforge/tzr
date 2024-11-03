// pages/api/getTeamsWithOperations.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  [key: string]: any; // Extendable properties
};

type Operation = {
  id: string;
  user_uid: string;
  [key: string]: any; // Extendable properties
};

type TeamMemberWithOperations = TeamMember & {
  operations: Operation[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Step 1: Fetch all Team Members
    const teamMembersSnapshot = await db.collection('teams').get();
    const teamMembers: TeamMember[] = [];

    teamMembersSnapshot.forEach((doc) => {
      teamMembers.push({ id: doc.id, ...doc.data() } as TeamMember);
    });

    // Step 2: Fetch all Operations
    const operationsSnapshot = await db.collection('operations').get();
    const operations: Operation[] = [];

    operationsSnapshot.forEach((doc) => {
      operations.push({ id: doc.id, ...doc.data() } as Operation);
    });

    // Step 3: Combine data
    const result: TeamMemberWithOperations[] = teamMembers.map((member) => {
      const memberOperations = operations.filter(
        (op) => op.user_uid === member.id
      );

      return { ...member, operations: memberOperations };
    });

    // Step 4: Respond with the combined data
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
