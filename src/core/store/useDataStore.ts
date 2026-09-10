import { create } from 'zustand';
import { Product, UserProfile, Order, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig, Banner, StoreInfo, Expense, Table } from '@/src/core/types';

interface DataStoreState {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  isLoadingProducts: boolean;
  setIsLoadingProducts: (loading: boolean) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
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
  categories: string[];
  setCategories: (categories: string[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  tables: Table[];
  setTables: (tables: Table[]) => void;
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
  users: [],
  setUsers: (users) => set({ users }),
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
  banners: [],
  setBanners: (banners) => set({ banners }),
  storeInfo: {
    historia_loja: 'Fundada com muito amor, a Cloudnine Doceria traz os melhores doces artesanais...',
    fotos_loja: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600']
  },
  setStoreInfo: (info) => set({ storeInfo: info }),
  categories: ['Todos', 'Brigadeiros', 'Bolos de Pote', 'Macarons', 'Tortas & Mousse', 'Kits & Presentes'],
  setCategories: (categories) => set({ categories }),
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  tables: Array.from({ length: 15 }, (_, i) => ({
    id: String(i + 1),
    numero: String(i + 1).padStart(2, '0'),
    status: 'livre',
    seats: 4
  })),
  setTables: (tables) => set({ tables })
}));
