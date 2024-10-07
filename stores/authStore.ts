import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserState } from "@/types";

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
    //test
    return unsubscribe;
  },
}));
