import { create } from 'zustand';
import { ThemeMode, NotificationItem } from '@/src/core/types';

interface UIStoreState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean, notice?: string) => void;
  authRequiredNotice?: string;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  notifications: NotificationItem[];
  setNotifications: (notifs: NotificationItem[]) => void;
  markNotificationAsRead: (id: string | number) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  themeMode: 'light',
  setThemeMode: (mode) => set({ themeMode: mode }),

  isAuthModalOpen: false,
  authRequiredNotice: undefined,
  setIsAuthModalOpen: (open, notice) => set({ isAuthModalOpen: open, authRequiredNotice: notice }),

  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 3500);
  },

  notifications: [
    { id: '1', created_at: new Date().toISOString(), titulo: 'Bem-vindo à Cloudnine!', mensagem: 'Aproveite nossas delícias.', lida: false }
  ],
  setNotifications: (notifs) => set({ notifications: notifs }),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, lida: true } : n)
  })),
}));
