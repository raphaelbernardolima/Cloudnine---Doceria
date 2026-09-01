import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/src/core/ui/layout/Header';
import { MobileBottomNav } from '@/src/core/ui/layout/MobileBottomNav';
import { ShopView } from '@/src/modules/shop/ui/ShopView';
import { ProductModal } from '@/src/modules/shop/ui/ProductModal';
import { CustomCakeModal } from '@/src/modules/shop/ui/CustomCakeModal';
import { CartDrawer } from '@/src/modules/shop/ui/CartDrawer';
import { LoyaltyView } from '@/src/modules/profile/ui/LoyaltyView';
import { AuthModal } from '@/src/modules/auth/ui/AuthModal';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STAFF, INITIAL_AUDIT_LOGS, INITIAL_INGREDIENTS, INITIAL_DRIVERS, INITIAL_COUPONS, INITIAL_LOYALTY_SETTINGS } from './data/doceriaData';
import { Product, CartItem, Order, CustomCakeBuilder, ThemeMode, AuditLog, UserProfile, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig } from '@/src/core/types/index';
import { getCurrentSupabaseUser, signOutSupabase, updateUserProfileInDB, getSupabaseClient, getStoreConfig } from '@/src/core/services/supabase';
import { sendOrderStatusNotification, requestNotificationPermission } from '@/src/core/services/notificationService';
import { useStore } from '@/src/core/store/useStore';
import { useSupabaseSync } from '@/src/core/hooks/useSupabaseSync';
import { usePaymentHandler } from '@/src/core/hooks/usePaymentHandler';
import { useCouponLogic } from '@/src/core/hooks/useCouponLogic';
import { globalEventBus, AppEvents } from '@/src/core/events/EventBus';
import { isStaff } from '@/src/core/constants/roles';
import { Sparkles, ShieldAlert, LogIn, User } from 'lucide-react';

// Lazy-loaded heavy modules (code splitting)
const AdminDashboard = lazy(() => import('@/src/modules/admin/ui/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CustomerProfileView = lazy(() => import('@/src/modules/profile/ui/CustomerProfileView').then(m => ({ default: m.CustomerProfileView })));

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Custom Hooks for Logic Separation
  useSupabaseSync();
  usePaymentHandler();
  const { handleApplyCoupon } = useCouponLogic();

  // Global State (Zustand)
  const {
    themeMode, setThemeMode,
    currentUser, setCurrentUser,
    isAuthModalOpen, setIsAuthModalOpen, authRequiredNotice,
    toastMessage, showToast,
    products, setProducts, isLoadingProducts,
    orders, setOrders,
    staff, setStaff,
    auditLogs, setAuditLogs,
    ingredients, setIngredients,
    drivers, setDrivers,
    coupons, setCoupons,
    loyaltySettings, setLoyaltySettings,
    storePhone, setStorePhone,
    customCakeConfig, setCustomCakeConfig,
    appliedDiscount, setAppliedDiscount,
    cartItems, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, clearCart
  } = useStore();

  // Local UI State (Modals & Filters)
  const [isCustomCakeOpen, setIsCustomCakeOpen] = useState(false);
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize theme attribute on body
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light-high-contrast', 'dark-high-contrast');
    if (themeMode === 'dark') document.documentElement.classList.add('dark');
    else if (themeMode === 'light-high-contrast') document.documentElement.classList.add('light-high-contrast');
    else if (themeMode === 'dark-high-contrast') document.documentElement.classList.add('dark', 'dark-high-contrast');
  }, [themeMode]);

  // Handle Auth open
  const handleOpenAuthModal = (notice?: string) => {
    setIsAuthModalOpen(true, notice);
  };

  const handleLogout = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    navigate('/');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (isStaff(user)) {
      navigate('/admin');
    }
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    setCurrentUser(updated);
    if (updated.id) {
      const { error } = await updateUserProfileInDB(updated.id, updated);
      if (error) {
        console.error('Failed to update profile:', error);
      }
    }
  };

  // Handle Add Standard Product to Cart
  const handleAddToCart = (product: Product, quantity = 1, customNote?: string) => {
    addToCart({ product, quantity, customNote, unitPrice: product.preco });
  };

  // Handle Add Custom Cake to Cart
  const handleAddCustomCakeToCart = (cake: CustomCakeBuilder) => {
    addToCart({
      customCake: cake,
      quantity: 1,
      customNote: `Frase no bolo: ${cake.mensagemBolo || 'Nenhuma'} | Obs: ${cake.observacoes || 'Nenhuma'}`,
      unitPrice: cake.precoCalculado
    });
  };

  const handlePlaceOrder = async (newOrderData: Partial<Order>) => {
    requestNotificationPermission().catch(() => { });
    const fullOrder: Order = {
      id: newOrderData.id || Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      cliente_id: currentUser?.id || 'usr-guest',
      cliente_nome: newOrderData.cliente_nome || currentUser?.nome || 'Cliente Cloudnine',
      cliente_telefone: newOrderData.cliente_telefone || currentUser?.telefone || '',
      total: newOrderData.total || 0,
      status: newOrderData.status || 'em_preparo',
      metodo_pagamento: newOrderData.metodo_pagamento || 'pix',
      tipo_entrega: newOrderData.tipo_entrega || 'entrega',
      data_agendada: newOrderData.data_agendada,
      horario_agendado: newOrderData.horario_agendado,
      endereco_entreg: newOrderData.endereco_entreg || '',
      itens: newOrderData.itens || []
    };

    const client = getSupabaseClient();
    if (client) {
      const pedidoDB = {
        cliente_id: fullOrder.cliente_id !== 'usr-guest' ? fullOrder.cliente_id : null,
        total: fullOrder.total,
        status: fullOrder.status,
        endereco_entreg: fullOrder.endereco_entreg
      };

      const { data, error } = await client.from('pedidos').insert([pedidoDB]).select();
      if (!error && data && data.length > 0) {
        fullOrder.id = data[0].id; // Replace ID with DB serial ID

        // Insert order items
        if (fullOrder.itens.length > 0) {
          const itensDB = fullOrder.itens.map(item => ({
            pedido_id: fullOrder.id,
            produto_id: typeof item.produto_id === 'number' ? item.produto_id : null,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario
          }));
          await client.from('itens_pedidos').insert(itensDB);
        }
      } else {
        console.error("Erro ao inserir pedido", error);
      }
    }

    setOrders([fullOrder, ...orders]);
    clearCart();
    setAppliedDiscount(0);

    // Audit log entry
    const novoLog: AuditLog = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      admin_id: currentUser?.id || 'system',
      admin_nome: currentUser?.nome || 'Cliente',
      acao: 'NOVO_PEDIDO',
      detalhes: `Novo pedido #${fullOrder.id} realizado por ${fullOrder.cliente_nome} no valor de R$ ${fullOrder.total.toFixed(2)}`
    };

    if (client) {
      await client.from('logs_auditoria').insert([{
        acao: novoLog.acao,
        detalhes: novoLog.detalhes,
        admin_id: currentUser?.id || null
      }]);
    }

    setAuditLogs([novoLog, ...auditLogs]);
  };

  // Product Admin handlers
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('produtos').insert([newProd]).select();
      if (!error && data) {
        setProducts([data[0], ...products]);
        return;
      }
    }
    // Fallback if no client or error
    const created: Product = { ...newProd, id: Date.now() };
    setProducts([created, ...products]);
  };

  const handleUpdateStock = async (id: number | string, newStock: number) => {
    const client = getSupabaseClient();
    if (client) {
      await client.from('produtos').update({ estoque: newStock }).eq('id', id);
    }
    setProducts(products.map(p => p.id === id ? { ...p, estoque: newStock } : p));
  };

  const handleDeleteProduct = async (id: number | string) => {
    const client = getSupabaseClient();
    if (client) {
      await client.from('produtos').delete().eq('id', id);
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: Order['status']) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const client = getSupabaseClient();
    if (client) {
      await client.from('pedidos').update({ status: newStatus }).eq('id', orderId);
    }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    if (newStatus === 'saiu_entrega' || newStatus === 'entregue') {
      sendOrderStatusNotification(orderId, newStatus, targetOrder?.cliente_nome);
    }
  };

  const handleUpdateRole = (userId: string, newRole: UserProfile['role']) => {
    setStaff(staff.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  // Filter products by category and search
  const categories = ['Todos', 'Brigadeiros', 'Bolos de Pote', 'Macarons', 'Tortas & Mousse', 'Kits & Presentes'];
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'Todos' || p.categoria === selectedCategory;
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isUserAdminOrStaff = isStaff(currentUser);

  return (
    <div className="min-h-screen bg-(--color-surface) text-(--color-on-surface) transition-colors font-sans flex flex-col">

      {/* Header */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(!isCartOpen)}
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        themeMode={themeMode}
        toggleTheme={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        currentUser={currentUser}
        onOpenAuthModal={(notice) => handleOpenAuthModal(notice)}
        onLogout={handleLogout}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-6">
        <Routes>
          {/* CUSTOMER SHOP VIEW */}
          <Route path="/" element={
            <ShopView
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoadingProducts={isLoadingProducts}
              filteredProducts={filteredProducts}
              onOpenCustomCake={() => setIsCustomCakeOpen(true)}
              onNavigateLoyalty={() => navigate('/loyalty')}
              onAddToCart={handleAddToCart}
              onOpenQuickView={setSelectedQuickProduct}
            />
          } />

          {/* CUSTOMER LOYALTY VIEW */}
          <Route path="/loyalty" element={
            <LoyaltyView
              currentUser={currentUser}
              orders={orders}
              onOpenAuthModal={(msg) => handleOpenAuthModal(msg)}
              onApplyRewardCoupon={(code) => {
                handleApplyCoupon(code);
                setIsCartOpen(true);
              }}
            />
          } />

          {/* CUSTOMER PORTAL / PROFILE VIEW */}
          <Route path="/profile" element={
            currentUser ? (
              <Suspense fallback={<div className="py-20 text-center text-(--color-outline)">Carregando perfil...</div>}>
                <CustomerProfileView
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                  orders={orders}
                  onNavigateToShop={() => navigate('/')}
                  onNavigateToAdmin={() => navigate('/admin')}
                />
              </Suspense>
            ) : (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center mx-auto">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black">Portal do Cliente Cloudnine</h2>
                <p className="text-xs text-(--color-outline)">
                  Faça login ou crie sua conta para acessar seu histórico de pedidos, saldo de pontos do clube de fidelidade e personalizar seu perfil.
                </p>
                <button
                  onClick={() => handleOpenAuthModal('Acesse sua conta para ver seus pedidos e pontos do clube de fidelidade.')}
                  className="px-6 py-3 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-bold text-xs flex items-center justify-center space-x-2 mx-auto shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar ou Criar Conta</span>
                </button>
              </div>
            )
          } />

          {/* ADMIN DASHBOARD VIEW (Protected) */}
          <Route path="/admin" element={
            isUserAdminOrStaff ? (
              <Suspense fallback={<div className="py-20 text-center text-(--color-outline)">Carregando painel...</div>}>
                <AdminDashboard
                  products={products}
                  orders={orders}
                  staff={staff}
                  auditLogs={auditLogs}
                  ingredients={ingredients}
                  drivers={drivers}
                  coupons={coupons}
                  loyaltySettings={loyaltySettings}
                  onUpdateLoyalty={setLoyaltySettings}
                  onAddIngredient={(ing) => setIngredients([...ingredients, { ...ing, id: Math.random().toString() }])}
                  onUpdateIngredientStock={(id, stock) => setIngredients(ingredients.map(i => i.id === id ? { ...i, estoqueAtual: stock } : i))}
                  onDeleteIngredient={(id) => setIngredients(ingredients.filter(i => i.id !== id))}
                  onAddCoupon={(c) => setCoupons([...coupons, { ...c, id: Math.random().toString() }])}
                  onToggleCoupon={(id, ativo) => setCoupons(coupons.map(c => c.id === id ? { ...c, ativo } : c))}
                  onAssignDriver={(orderId, driverId) => setOrders(orders.map(o => o.id === orderId ? { ...o, entregador_id: driverId } : o))}
                  currentUser={currentUser!}
                  onAddProduct={handleAddProduct}
                  onUpdateStock={handleUpdateStock}
                  onDeleteProduct={handleDeleteProduct}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onUpdateRole={handleUpdateRole}
                  showToast={showToast}
                  storePhone={storePhone}
                  setStorePhone={setStorePhone}
                  customCakeConfig={customCakeConfig}
                  onUpdateCustomCakeConfig={setCustomCakeConfig} />
              </Suspense>
            ) : (
              <div className="py-20 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black">Área Restrita do Sistema</h2>
                <p className="text-xs text-(--color-outline)">
                  Você precisa estar autenticado com uma conta de Administrador ou Equipe para acessar esta página.
                </p>
                <button
                  onClick={() => handleOpenAuthModal('Acesso Administrativo: Por favor, entre com sua conta de colaborador para acessar o painel de gestão.')}
                  className="px-6 py-3 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-bold text-xs flex items-center justify-center space-x-2 mx-auto shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Acessar Conta Autorizada</span>
                </button>
              </div>
            )
          } />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        isAuthenticated={!!currentUser}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        requiredRoleMessage={authRequiredNotice}
      />

      {/* Quick View Modal */}
      <ProductModal
        product={selectedQuickProduct}
        isOpen={!!selectedQuickProduct}
        onClose={() => setSelectedQuickProduct(null)}
        onAddToCart={(p, qty, note) => handleAddToCart(p, qty, note)}
      />

      {/* Custom Cake Builder Modal */}
      <CustomCakeModal
        isOpen={isCustomCakeOpen}
        onClose={() => setIsCustomCakeOpen(false)}
        onAddCustomCake={handleAddCustomCakeToCart}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onPlaceOrder={handlePlaceOrder}
        appliedDiscount={appliedDiscount}
        onApplyCoupon={handleApplyCoupon}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-999 bg-(--color-on-surface) text-(--color-surface) px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 text-sm font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating WhatsApp Support Button */}
      {!isStaff(currentUser) && (() => {
        const cleanPhone = storePhone ? storePhone.replace(/\D/g, '') : '5513988747014';
        const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        const whatsappUrl = `https://wa.me/${finalPhone}?text=Olá!%20Gostaria%20de%20suporte%20com%20meu%20pedido%20na%20Cloudnine.`;

        return (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Atendimento via WhatsApp"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#22bf5b] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm tracking-wide pl-0 group-hover:pl-2">
              Suporte WhatsApp
            </span>
          </a>
        );
      })()}
    </div>
  );
}
