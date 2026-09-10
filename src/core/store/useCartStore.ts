import { create } from 'zustand';
import { CartItem } from '@/src/core/types';
import { globalEventBus, AppEvents } from '@/src/core/events/EventBus';

interface CartStoreState {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  appliedDiscount: number;
  setAppliedDiscount: (discount: number) => void;
  activeTable: string | null;
  setActiveTable: (table: string | null) => void;
}

export const useCartStore = create<CartStoreState>((set) => ({
  cartItems: [],
  isCartOpen: false,
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  activeTable: null,
  setActiveTable: (table) => set({ activeTable: table }),
  
  addToCart: (item) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    const existingIndex = state.cartItems.findIndex(ci => 
      ci.product?.id === item.product?.id && 
      JSON.stringify(ci.customCake) === JSON.stringify(item.customCake) &&
      ci.customNote === item.customNote
    );

    if (existingIndex > -1) {
      const updated = [...state.cartItems];
      updated[existingIndex].quantity += item.quantity;
      globalEventBus.emit(AppEvents.CART_UPDATED, { items: updated.length, added: item });
      return { cartItems: updated, isCartOpen: true };
    }
    const newItems = [...state.cartItems, { ...item, id }];
    globalEventBus.emit(AppEvents.CART_UPDATED, { items: newItems.length, added: item });
    return { cartItems: newItems, isCartOpen: true };
  }),

  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== id)
  })),

  updateQuantity: (id, qty) => set((state) => ({
    cartItems: state.cartItems.map(item => item.id === id ? { ...item, quantity: Math.max(1, qty) } : item)
  })),

  clearCart: () => set({ cartItems: [], appliedDiscount: 0 }),

  appliedDiscount: 0,
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
}));
