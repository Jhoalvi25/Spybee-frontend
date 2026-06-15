import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from './types';

const MOCK_USER: AuthUser = {
  name: 'Admin Spybee',
  email: 'admin@spybee.com',
};

const MOCK_PASSWORD = '123456';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 300));
        if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
          set({ user: MOCK_USER, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'spybee-auth' }
  )
);
