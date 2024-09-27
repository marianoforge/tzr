import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserState {
  userID: string | null;
  setUserID: (id: string | null) => void;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<UserState>((set) => ({
  userID: null,
  setUserID: (id) => set({ userID: id }),
  initializeAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ userID: user ? user.uid : null });
    });
    return unsubscribe;
  },
}));
