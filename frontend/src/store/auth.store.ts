import { create } from 'zustand';

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	username?: string;
	role: string;
}

interface AuthState {
	user: AuthUser | null;
	sessionId: string | null;
	setUser: (user: AuthUser) => void;
	setSession: (sessionId: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	sessionId: null,
	setUser: (user) => set({ user }),
	setSession: (sessionId) => set({ sessionId }),
	logout: () => set({ user: null, sessionId: null }),
}));
