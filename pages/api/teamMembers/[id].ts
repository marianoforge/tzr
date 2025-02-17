import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Import Firebase Admin for auth

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 🔹 Validate Firebase Token for Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    const { id } = req.query; // Get team member ID from URL

    // 🔹 Ensure the authenticated user has permissions
    const memberRef = doc(db, 'teams', id as string);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const memberData = memberSnap.data();

    // 🔒 Ensure the user is the Team Lead of this member
    if (memberData.teamLeadID !== userUID) {
      return res
        .status(403)
        .json({
          message: 'Forbidden: You are not allowed to modify this team member',
        });
    }

    if (req.method === 'DELETE') {
      await deleteDoc(memberRef);
      return res.status(200).json({ message: 'Member deleted successfully' });
    }

    if (req.method === 'PUT') {
      const { firstName, lastName, email } = req.body;
      await updateDoc(memberRef, { firstName, lastName, email });
      return res.status(200).json({ message: 'Member updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
