import { create } from 'zustand';
import { Product, CartItem, CustomCakeBuilder, UserProfile, ThemeMode, Order, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig } from '@/src/core/types';
import { globalEventBus, AppEvents } from '@/src/core/events/EventBus';

interface StoreState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean, notice?: string) => void;
  authRequiredNotice?: string;

  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Datasets
  products: Product[];
  setProducts: (products: Product[]) => void;
  isLoadingProducts: boolean;
  setIsLoadingProducts: (loading: boolean) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  staff: UserProfile[];
  setStaff: (staff: UserProfile[]) => void;
  auditLogs: AuditLog[];
  setAuditLogs: (logs: AuditLog[]) => void;
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  coupons: Coupon[];
  setCoupons: (coupons: Coupon[]) => void;
  loyaltySettings: LoyaltySettings;
  setLoyaltySettings: (settings: LoyaltySettings) => void;
  storePhone: string;
  setStorePhone: (phone: string) => void;
  customCakeConfig: CustomCakeConfig;
  setCustomCakeConfig: (config: CustomCakeConfig) => void;

  // Shop state
  appliedDiscount: number;
  setAppliedDiscount: (discount: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  themeMode: 'light',
  setThemeMode: (mode) => set({ themeMode: mode }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  isAuthModalOpen: false,
  setIsAuthModalOpen: (open, notice) => set({ isAuthModalOpen: open, authRequiredNotice: notice }),

  cartItems: [],
  isCartOpen: false,
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  
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

  clearCart: () => set({ cartItems: [] }),

  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 3500);
  },

  products: [],
  setProducts: (products) => set({ products }),
  isLoadingProducts: true,
  setIsLoadingProducts: (loading) => set({ isLoadingProducts: loading }),
  orders: [],
  setOrders: (orders) => set({ orders }),
  staff: [],
  setStaff: (staff) => set({ staff }),
  auditLogs: [],
  setAuditLogs: (logs) => set({ auditLogs: logs }),
  ingredients: [],
  setIngredients: (ingredients) => set({ ingredients }),
  drivers: [],
  setDrivers: (drivers) => set({ drivers }),
  coupons: [],
  setCoupons: (coupons) => set({ coupons }),
  loyaltySettings: { pontosPorReal: 1, valorResgatePorPonto: 0.05 },
  setLoyaltySettings: (settings) => set({ loyaltySettings: settings }),
  storePhone: '(13) 98874-7014',
  setStorePhone: (phone) => set({ storePhone: phone }),
  customCakeConfig: { tamanhos: [], massas: [], recheios: [], coberturas: [] },
  setCustomCakeConfig: (config) => set({ customCakeConfig: config }),

  appliedDiscount: 0,
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
}));
