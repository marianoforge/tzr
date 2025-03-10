import { create } from 'zustand';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { UserState } from '@/common/types/';

export const useAuthStore = create<UserState>((set) => ({
  userID: null,
  role: null,
  setUserID: (id) => set({ userID: id }),
  setUserRole: (role) => set({ role }),
  initializeAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);
        const userRole = userDoc.exists() ? userDoc.data()?.role : null;
        set({ userID: user.uid, role: userRole });
      } else {
        set({ userID: null, role: null });
      }
    });
    return unsubscribe;
  },

  getAuthToken: async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null; // Si el usuario no está autenticado, retornamos null
  },
}));
