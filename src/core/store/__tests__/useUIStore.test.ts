import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      themeMode: 'light',
      isAuthModalOpen: false,
      authRequiredNotice: undefined,
      toastMessage: null,
      notifications: []
    });
  });

  it('should toggle theme mode', () => {
    useUIStore.getState().setThemeMode('dark');
    expect(useUIStore.getState().themeMode).toBe('dark');
  });

  it('should open auth modal with notice', () => {
    useUIStore.getState().setIsAuthModalOpen(true, 'Please login');
    expect(useUIStore.getState().isAuthModalOpen).toBe(true);
    expect(useUIStore.getState().authRequiredNotice).toBe('Please login');
  });

  it('should set notifications and mark as read', () => {
    const notif = {
      id: '1',
      titulo: 'Nova notificação',
      mensagem: 'Notificação',
      data: '2021-01-01',
      created_at: '2021-01-01',
      lida: false,
      tipo: 'sistema' as const
    };

    useUIStore.getState().setNotifications([notif]);
    expect(useUIStore.getState().notifications).toHaveLength(1);
    expect(useUIStore.getState().notifications[0].lida).toBe(false);

    useUIStore.getState().markNotificationAsRead('1');
    expect(useUIStore.getState().notifications[0].lida).toBe(true);
  });
});
