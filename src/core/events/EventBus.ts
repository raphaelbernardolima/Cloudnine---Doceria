export type EventCallback = (payload?: any) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, payload?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(payload));
  }
}

export const globalEventBus = new EventBus();

export const AppEvents = {
  CART_UPDATED: 'CART_UPDATED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  ORDER_PLACED: 'ORDER_PLACED',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
  CONFIG_UPDATED: 'CONFIG_UPDATED'
} as const;
