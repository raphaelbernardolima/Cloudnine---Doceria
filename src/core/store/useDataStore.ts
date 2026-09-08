import { create } from 'zustand';
import { Product, UserProfile, Order, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig, Banner, StoreInfo } from '@/src/core/types';

interface DataStoreState {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
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
}

export const useDataStore = create<DataStoreState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
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
}));
