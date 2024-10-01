import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore"; // Firestore v9 functions

interface UserState {
  userID: string | null;
  role: string | null;
  setUserID: (id: string | null) => void;
  setUserRole: (role: string | null) => void;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<UserState>((set) => ({
  userID: null,
  role: null,
  setUserID: (id) => set({ userID: id }),
  setUserRole: (role) => set({ role }),
  initializeAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userRef);
        const userRole = userDoc.exists() ? userDoc.data()?.role : null;
        set({ userID: user.uid, role: userRole });
      } else {
        set({ userID: null, role: null });
      }
    });
    return unsubscribe;
  },
}));
