import React, { useState } from 'react';
import { SEO } from '@/src/core/ui/shared/SEO';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Calendar, Package, Printer, Truck, Gift, ShieldCheck, Sparkles, Store, Cake, LayoutDashboard, CreditCard } from 'lucide-react';
import { Product, Order, UserProfile, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig } from '@/src/core/types/index';
import { updateStoreConfig } from '@/src/core/services/supabase';

// Modules
import { AdminFinanceModule } from './AdminFinanceModule';
import { AdminStoreConfigModule } from './AdminStoreConfigModule';
import { AdminPaymentConfigModule } from './AdminPaymentConfigModule';
import { AdminCustomCakeModule } from './AdminCustomCakeModule';
import { AdminStaffModule } from './AdminStaffModule';
import { AdminCalendarModule } from './AdminCalendarModule';
import { AdminInventoryModule } from './AdminInventoryModule';
import { AdminDeliveryModule } from './AdminDeliveryModule';
import { AdminMarketingModule } from './AdminMarketingModule';
import { AdminOrdersModule } from './AdminOrdersModule';
import { AdminKitchenModule } from './AdminKitchenModule';
import { AdminAIModule } from './AdminAIModule';
import { AdminAuditLogsModule } from './AdminAuditLogsModule';
import { AdminAddProductModal } from './AdminAddProductModal';
import { AdminPrintModal } from './AdminPrintModal';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  staff: UserProfile[];
  auditLogs: AuditLog[];
  currentUser: UserProfile;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (id: number | string, newStock: number) => void;
  onDeleteProduct: (id: number | string) => void;
  onUpdateOrderStatus: (orderId: number | string, newStatus: Order['status']) => void;
  onUpdateRole: (userId: string, newRole: UserProfile['role']) => void;
  ingredients: Ingredient[];
  drivers: Driver[];
  coupons: Coupon[];
  loyaltySettings: LoyaltySettings;
  onUpdateLoyalty: (settings: LoyaltySettings) => void;
  customCakeConfig: CustomCakeConfig;
  onUpdateCustomCakeConfig: (config: CustomCakeConfig) => void;
  setCustomCakeConfig?: (config: CustomCakeConfig) => void;
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredientStock: (id: string, newStock: number) => void;
  onDeleteIngredient: (id: string) => void;
  onAddCoupon: (c: Omit<Coupon, 'id'>) => void;
  onToggleCoupon: (id: string, ativo: boolean) => void;
  onAssignDriver: (orderId: string | number, driverId: string) => void;
  showToast?: (msg: string) => void;
  storePhone?: string;
  setStorePhone?: (phone: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  staff,
  auditLogs,
  currentUser,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateRole,
  ingredients,
  drivers,
  coupons,
  loyaltySettings,
  onUpdateLoyalty,
  customCakeConfig,
  setCustomCakeConfig,
  onAddIngredient,
  onUpdateIngredientStock,
  onDeleteIngredient,
  onAddCoupon,
  onToggleCoupon,
  onAssignDriver,
  showToast,
  setStorePhone
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const previousOrderCount = React.useRef(orders.length);

  React.useEffect(() => {
    if (orders.length > previousOrderCount.current) {
      const newOrder = orders[orders.length - 1] || orders[0];
      setToastMessage(`🎉 Novo pedido #${newOrder?.id || ''} recebido de ${newOrder?.cliente_nome || 'Cliente'}!`);
      setTimeout(() => setToastMessage(null), 5000);
    }
    previousOrderCount.current = orders.length;
  }, [orders]);

  // Kitchen thermal receipt modal & settings
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [receiptType, setReceiptType] = useState<'cozinha' | 'cliente'>('cozinha');
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [printerProtocol, setPrinterProtocol] = useState<string>('system');
  const [printerStatusMessage, setPrinterStatusMessage] = useState('Pronta para impressão (ESC/POS & Driver do Sistema)');

  // New product form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto py-4 px-4 items-start">
      <SEO 
        title="Painel Administrativo" 
        description="Área restrita de gestão da Cloudnine Doceria." 
      />
      
      {/* Sidebar Navigation (Desktop Only) */}
      <div className="hidden md:flex w-[260px] shrink-0 bg-[var(--color-surface-container-lowest)] rounded-3xl p-4 border border-[var(--color-outline-variant)]/20 shadow-sm flex-col gap-2 overflow-visible sticky top-24">
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] px-2 mb-2">Menu Administrativo</h3>
        
        {['admin', 'ADMIN'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'dashboard'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Financeiro & Dashboard</span>
          </button>
        )}

        {['admin', 'ADMIN', 'CAIXA', 'ATENDIMENTO', 'atendente'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'orders'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Pedidos ({orders.length})</span>
          </button>
        )}

        {['admin', 'ADMIN', 'COZINHA'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'calendar'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Calendário de Encomendas</span>
          </button>
        )}
        {['admin', 'ADMIN', 'COZINHA'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'products'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <Package className="w-5 h-5" />
            <span>Estoque & Catálogo</span>
          </button>
        )}

        {['admin', 'ADMIN', 'COZINHA', 'confeiteiro'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'kitchen'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <Printer className="w-5 h-5" />
            <span>Comanda Cozinha</span>
          </button>
        )}

        {['admin', 'ADMIN', 'ATENDIMENTO'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('delivery')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'delivery'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <Truck className="w-5 h-5" />
            <span>Despacho & Logística</span>
          </button>
        )}
        
        {['admin', 'ADMIN'].includes(currentUser.role) && (
          <button
            onClick={() => setActiveTab('marketing')}
            className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'marketing'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
              : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
              }`}
          >
            <Gift className="w-5 h-5" />
            <span>Marketing & Fidelidade</span>
          </button>
        )}
        
        {['admin', 'ADMIN'].includes(currentUser.role) && (
          <>
            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'staff'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Equipe & Permissões</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'ai'
                ? 'bg-linear-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>Marketing IA</span>
            </button>

            <button
              onClick={() => setActiveTab('store-config')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'store-config'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Store className="w-5 h-5" />
              <span>Configurações da Loja</span>
            </button>

            <button
              onClick={() => setActiveTab('custom-cake')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'custom-cake'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Cake className="w-5 h-5" />
              <span>Bolos Personalizados</span>
            </button>

            <button
              onClick={() => setActiveTab('payment-config')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'payment-config'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Configurações de Pagamento</span>
            </button>
            
            <button
              onClick={() => setActiveTab('database')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'database'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Logs de Auditoria</span>
            </button>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6 pb-20">
        
        {/* Top Header */}
        <div className="p-8 rounded-[32px] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] bg-[var(--color-primary-container)]/20 px-3 py-1.5 rounded-full">
            Painel Administrativo Restrito
          </span>
          <h1 className="text-3xl mt-3 text-[var(--color-on-surface)]" style={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic' }}>
            Gestão Operacional Cloudnine
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 font-medium">
            Controle de pedidos, catálogo de produtos, impressão da cozinha e inteligência de vendas.
          </p>
        </div>

        {/* TAB RENDERING */}
        {activeTab === 'dashboard' && (
          <AdminFinanceModule orders={orders} products={products} ingredients={ingredients} />
        )}

        {activeTab === 'store-config' && (
          <AdminStoreConfigModule
            showToast={showToast || (() => { })}
            onStoreConfigUpdated={(cfg) => {
              if (cfg.telefone && setStorePhone) setStorePhone(cfg.telefone);
            }}
          />
        )}

        {activeTab === 'payment-config' && (
          <AdminPaymentConfigModule showToast={showToast || (() => { })} />
        )}

        {activeTab === 'custom-cake' && (
          <AdminCustomCakeModule
            config={customCakeConfig || { tamanhos: [], massas: [], recheios: [], coberturas: [] }}
            onUpdateConfig={async (newConfig) => {
              if (setCustomCakeConfig) setCustomCakeConfig(newConfig);
              showToast?.('Configurações do Bolo Personalizado atualizadas localmente!');
              const res = await updateStoreConfig({ custom_cake_config: newConfig });
              if (res.success) showToast?.('Configurações salvas no banco com sucesso!');
              else showToast?.('Erro ao salvar no banco: ' + res.error);
            }}
          />
        )}

        {activeTab === 'staff' && (
          <AdminStaffModule staffList={staff} onUpdateRole={onUpdateRole} />
        )}

        {activeTab === 'orders' && (
          <AdminOrdersModule 
            orders={orders} 
            onUpdateOrderStatus={onUpdateOrderStatus} 
            onPrintOrder={setPrintingOrder} 
          />
        )}

        {activeTab === 'calendar' && (
          <AdminCalendarModule orders={orders} />
        )}

        {activeTab === 'products' && (
          <AdminInventoryModule
            products={products}
            onAddProduct={() => setShowAddProductModal(true)}
            onUpdateStock={onUpdateStock}
            onDeleteProduct={onDeleteProduct}
            ingredients={ingredients}
            onAddIngredient={onAddIngredient}
            onUpdateIngredientStock={onUpdateIngredientStock}
            onDeleteIngredient={onDeleteIngredient}
          />
        )}

        {activeTab === 'delivery' && (
          <AdminDeliveryModule
            orders={orders}
            drivers={drivers}
            onAssignDriver={onAssignDriver}
            onUpdateOrderStatus={onUpdateOrderStatus}
          />
        )}

        {activeTab === 'marketing' && (
          <AdminMarketingModule
            coupons={coupons}
            loyaltySettings={loyaltySettings}
            onUpdateLoyalty={onUpdateLoyalty}
            onAddCoupon={onAddCoupon}
            onToggleCoupon={onToggleCoupon}
          />
        )}

        {activeTab === 'kitchen' && (
          <AdminKitchenModule
            orders={orders}
            paperWidth={paperWidth}
            setPaperWidth={setPaperWidth}
            receiptType={receiptType}
            setReceiptType={setReceiptType}
            printerProtocol={printerProtocol}
            setPrinterProtocol={setPrinterProtocol}
            printerStatusMessage={printerStatusMessage}
            setPrinterStatusMessage={setPrinterStatusMessage}
            onPrintOrder={setPrintingOrder}
          />
        )}

        {activeTab === 'ai' && <AdminAIModule />}

        {activeTab === 'database' && <AdminAuditLogsModule auditLogs={auditLogs} />}

        {/* MODALS */}
        {printingOrder && (
          <AdminPrintModal
            printingOrder={printingOrder}
            receiptType={receiptType}
            paperWidth={paperWidth}
            setReceiptType={setReceiptType}
            setPaperWidth={setPaperWidth}
            onClose={() => setPrintingOrder(null)}
          />
        )}

        {showAddProductModal && (
          <AdminAddProductModal
            onAddProduct={(p) => {
              onAddProduct(p);
              setShowAddProductModal(false);
            }}
            onClose={() => setShowAddProductModal(false)}
          />
        )}

        {/* NEW ORDER NOTIFICATION TOAST */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-9999 bg-(--color-primary) text-(--color-on-primary) px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Atenção Equipe!</p>
              <p className="text-xs opacity-90">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="ml-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              X
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
