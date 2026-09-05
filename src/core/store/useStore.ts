import { create } from 'zustand';
import { Product, CartItem, CustomCakeBuilder, UserProfile, ThemeMode, Order, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig, Banner, StoreInfo, NotificationItem } from '@/src/core/types';
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

  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
  storeInfo: StoreInfo;
  setStoreInfo: (info: StoreInfo) => void;
  notifications: NotificationItem[];
  setNotifications: (notifs: NotificationItem[]) => void;
  markNotificationAsRead: (id: string | number) => void;

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

  banners: [
    { id: '1', image_url: 'https://images.unsplash.com/photo-1557925923-33b251dc3296?auto=format&fit=crop&q=80&w=1200&h=400', ativo: true, link: '/?tab=kits' },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=1200&h=400', ativo: true }
  ],
  setBanners: (banners) => set({ banners }),
  
  storeInfo: {
    historia_loja: 'Fundada com muito amor, a Cloudnine Doceria traz os melhores doces artesanais...',
    fotos_loja: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600']
  },
  setStoreInfo: (info) => set({ storeInfo: info }),

  notifications: [
    { id: '1', created_at: new Date().toISOString(), titulo: 'Bem-vindo à Cloudnine!', mensagem: 'Aproveite nossas delícias.', lida: false }
  ],
  setNotifications: (notifs) => set({ notifications: notifs }),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, lida: true } : n)
  })),

  appliedDiscount: 0,
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
}));
