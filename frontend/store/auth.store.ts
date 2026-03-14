import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalRole } from '../types';

interface AuthState {
  user: { id: string; username: string; email: string; role: GlobalRole } | null;
  accessToken: string | null;
  encryptedPrivateKey: string | null;
  keySalt: string | null;
  setAuth: (user: AuthState['user'], token: string) => void;
  setKeyData: (enc: string, salt: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      encryptedPrivateKey: null,
      keySalt: null,
      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken });
      },
      setKeyData: (encryptedPrivateKey, keySalt) => set({ encryptedPrivateKey, keySalt }),
      clearAuth: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, encryptedPrivateKey: null, keySalt: null });
      },
    }),
    {
      name: 'axiom-auth',
      partialize: (s) => ({
        user: s.user,
        encryptedPrivateKey: s.encryptedPrivateKey,
        keySalt: s.keySalt,
      }),
    }
  )
);
