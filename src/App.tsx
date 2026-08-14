import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProductCard, ProductSkeleton } from './components/shop/ProductCard';
import { ShopView } from './components/shop/ShopView';
import { ProductModal } from './components/shop/ProductModal';
import { CustomCakeModal } from './components/shop/CustomCakeModal';
import { CartDrawer } from './components/shop/CartDrawer';
import { LoyaltyView } from './components/profile/LoyaltyView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { CustomerProfileView } from './components/profile/CustomerProfileView';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STAFF, INITIAL_AUDIT_LOGS, INITIAL_INGREDIENTS, INITIAL_DRIVERS, INITIAL_COUPONS, INITIAL_LOYALTY_SETTINGS } from './data/doceriaData';
import { Product, CartItem, Order, CustomCakeBuilder, ThemeMode, AuditLog, UserProfile, Ingredient, Driver, Coupon, LoyaltySettings } from './types/index';
import { getCurrentSupabaseUser, signOutSupabase, updateUserProfileInDB, getSupabaseClient } from './services/supabase';
import { sendOrderStatusNotification, requestNotificationPermission } from './services/notificationService';
import { Search, Sparkles, Heart, ChevronRight, Cake, Gift, ArrowRight, ShieldAlert, LogIn, User } from 'lucide-react';

export const STAFF_ROLES = ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'];

export function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [activeTab, setActiveTab] = useState<'shop' | 'custom-cake' | 'loyalty' | 'admin' | 'profile'>('shop');

  // Auth User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRequiredNotice, setAuthRequiredNotice] = useState<string | undefined>(undefined);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(INITIAL_LOYALTY_SETTINGS);

  
  // Fetch real data from Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      setIsLoadingProducts(true);
      const client = getSupabaseClient();
      if (!client) {
        // Fallback to initial if no supabase configured
        setProducts(INITIAL_PRODUCTS);
        setIsLoadingProducts(false);
        return;
      }

      try {
        // Fetch products
        const { data: prodData, error: prodErr } = await client.from('produtos').select('*');
        if (!prodErr && prodData && prodData.length > 0) {
          setProducts(prodData);
        } else {
          setProducts([]);
        }

        // Fetch orders
        const { data: ordData, error: ordErr } = await client.from('pedidos').select('*, itens_pedidos(*)');
        if (!ordErr && ordData && ordData.length > 0) {
          // Transform db format to app format if needed, but assuming compatible for now
          setOrders(ordData as any);
        } else {
          setOrders([]);
        }

      } catch (err) {
        console.error("Error fetching from Supabase", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchSupabaseData();
  }, []);
// Cart & UI State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomCakeOpen, setIsCustomCakeOpen] = useState(false);
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<Product | null>(null);
  
  // Category & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // Check Supabase user session on startup
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentSupabaseUser();
      if (user) {
        setCurrentUser(user);
      }
    }
    loadUser();
  }, []);

  // Handle Mercado Pago Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
      alert('🎉 Pagamento aprovado com sucesso! Seu pedido já está sendo preparado.');
      // Limpa os parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failure') {
      alert('⚠️ Houve um problema com o pagamento. Por favor, tente novamente ou escolha outra forma de pagamento.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'pending') {
      alert('⏳ Seu pagamento está em análise. Avisaremos assim que for aprovado.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Synchronize theme attribute on body
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light-high-contrast', 'dark-high-contrast');
    if (themeMode === 'dark') document.documentElement.classList.add('dark');
    else if (themeMode === 'light-high-contrast') document.documentElement.classList.add('light-high-contrast');
    else if (themeMode === 'dark-high-contrast') document.documentElement.classList.add('dark', 'dark-high-contrast');
  }, [themeMode]);

  // Handle Auth open
  const handleOpenAuthModal = (notice?: string) => {
    setAuthRequiredNotice(notice);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('shop');
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'confeiteiro' || user.role === 'atendente') {
      setActiveTab('admin');
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

  // Handle Tab Change with Security Check
  const handleTabChange = (tab: 'shop' | 'custom-cake' | 'loyalty' | 'admin') => {
    if (tab === 'admin') {
      if (!currentUser) {
        handleOpenAuthModal('Acesso Administrativo: Por favor, entre com sua conta de colaborador para acessar o painel de gestão.');
        return;
      }
      if (!STAFF_ROLES.includes(currentUser.role)) {
        handleOpenAuthModal('Acesso Negado: Sua conta atual não possui permissão de Administrador ou Equipe.');
        return;
      }
    }
    setActiveTab(tab);
  };

  // Handle Add Standard Product to Cart
  const handleAddToCart = (product: Product, quantity = 1, customNote?: string) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product?.id === product.id && item.customNote === customNote);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-prod-${product.id}-${Date.now()}`,
          product,
          quantity,
          customNote,
          unitPrice: product.preco
        }
      ];
    });
    setIsCartOpen(true);
  };

  // Handle Add Custom Cake to Cart
  const handleAddCustomCakeToCart = (cake: CustomCakeBuilder) => {
    setCartItems(prev => [
      ...prev,
      {
        id: `cart-cake-${Date.now()}`,
        customCake: cake,
        quantity: 1,
        customNote: `Frase no bolo: ${cake.mensagemBolo || 'Nenhuma'} | Obs: ${cake.observacoes || 'Nenhuma'}`,
        unitPrice: cake.precoCalculado
      }
    ]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApplyCoupon = (code: string) => {
    if (code.toUpperCase() === 'CLOUDNINE10') {
      const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      setAppliedDiscount(subtotal * 0.10);
      showToast('Cupom CLOUDNINE10 de 10% de desconto aplicado com sucesso!');
    } else if (code.toUpperCase() === 'DOCE10') {
      setAppliedDiscount(10.00);
      showToast('Cupom DOCE10 de R$ 10,00 OFF aplicado!');
    } else if (code.toUpperCase() === 'CAIXAGIFT20') {
      setAppliedDiscount(20.00);
      showToast('Desconto de R$ 20,00 aplicado com sucesso!');
    } else if (code.toUpperCase() === 'BRIGADEIROSGRATIS') {
      showToast('Recompensa de Brigadeiros resgatada! Adicionaremos ao seu pedido.');
    } else {
      showToast('Cupom inválido ou expirado.');
    }
  };

  const handlePlaceOrder = async (newOrderData: Partial<Order>) => {
    requestNotificationPermission().catch(() => {});
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

    setOrders(prev => [fullOrder, ...prev]);
    setCartItems([]);
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
    
    setAuditLogs(prev => [novoLog, ...prev]);
  };

  // Product Admin handlers
const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('produtos').insert([newProd]).select();
      if (!error && data) {
        setProducts(prev => [data[0], ...prev]);
        return;
      }
    }
    // Fallback if no client or error
    const created: Product = { ...newProd, id: Date.now() };
    setProducts(prev => [created, ...prev]);
  };

  const handleUpdateStock = async (id: number | string, newStock: number) => {
    const client = getSupabaseClient();
    if (client) {
      await client.from('produtos').update({ estoque: newStock }).eq('id', id);
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, estoque: newStock } : p));
  };

  const handleDeleteProduct = async (id: number | string) => {
    const client = getSupabaseClient();
    if (client) {
      await client.from('produtos').delete().eq('id', id);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: Order['status']) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const client = getSupabaseClient();
    if (client) {
      await client.from('pedidos').update({ status: newStatus }).eq('id', orderId);
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    if (newStatus === 'saiu_entrega' || newStatus === 'entregue') {
      sendOrderStatusNotification(orderId, newStatus, targetOrder?.cliente_nome);
    }
  };

  const handleUpdateRole = (userId: string, newRole: UserProfile['role']) => {
    setStaff(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
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

  const isUserAdminOrStaff = currentUser && STAFF_ROLES.includes(currentUser.role);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] transition-colors font-sans flex flex-col">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal()}
        onLogout={handleLogout}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* CUSTOMER SHOP VIEW */}
        {activeTab === 'shop' && (
          <ShopView
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoadingProducts={isLoadingProducts}
            filteredProducts={filteredProducts}
            onOpenCustomCake={() => setIsCustomCakeOpen(true)}
            onNavigateLoyalty={() => handleTabChange('loyalty')}
            onAddToCart={handleAddToCart}
            onOpenQuickView={setSelectedQuickProduct}
          />
        )}

        {/* CUSTOMER LOYALTY VIEW */}
        {activeTab === 'loyalty' && (
          <LoyaltyView
            currentUser={currentUser}
            orders={orders}
            onOpenAuthModal={(msg) => handleOpenAuthModal(msg)}
            onApplyRewardCoupon={(code) => {
              handleApplyCoupon(code);
              setIsCartOpen(true);
            }}
          />
        )}

        {/* CUSTOMER PORTAL / PROFILE VIEW */}
        {activeTab === 'profile' && (
          currentUser ? (
            <CustomerProfileView
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              orders={orders}
              onNavigateToShop={() => setActiveTab('shop')}
              onNavigateToAdmin={() => setActiveTab('admin')}
            />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black">Portal do Cliente Cloudnine</h2>
              <p className="text-xs text-[var(--color-outline)]">
                Faça login ou crie sua conta para acessar seu histórico de pedidos, saldo de pontos do clube de fidelidade e personalizar seu perfil.
              </p>
              <button
                onClick={() => handleOpenAuthModal('Acesse sua conta para ver seus pedidos e pontos do clube de fidelidade.')}
                className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-2 mx-auto shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar ou Criar Conta</span>
              </button>
            </div>
          )
        )}

        {/* ADMIN DASHBOARD VIEW (Protected) */}
        {activeTab === 'admin' && (
          isUserAdminOrStaff ? (
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
              onAddIngredient={(ing) => setIngredients(prev => [...prev, { ...ing, id: Math.random().toString() }])}
              onUpdateIngredientStock={(id, stock) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, estoqueAtual: stock } : i))}
              onDeleteIngredient={(id) => setIngredients(prev => prev.filter(i => i.id !== id))}
              onAddCoupon={(c) => setCoupons(prev => [...prev, { ...c, id: Math.random().toString() }])}
              onToggleCoupon={(id, ativo) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, ativo } : c))}
              onAssignDriver={(orderId, driverId) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, entregador_id: driverId } : o))}
              currentUser={currentUser!}
              onAddProduct={handleAddProduct}
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateRole={handleUpdateRole}
            />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black">Área Restrita do Sistema</h2>
              <p className="text-xs text-[var(--color-outline)]">
                Você precisa estar autenticado com uma conta de Administrador ou Equipe para acessar esta página.
              </p>
              <button
                onClick={() => handleOpenAuthModal('Acesso Administrativo: Por favor, entre com sua conta de colaborador para acessar o painel de gestão.')}
                className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-2 mx-auto shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Acessar Conta Autorizada</span>
              </button>
            </div>
          )
        )}

      </main>

      {/* Footer */}
      <Footer />

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
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onPlaceOrder={handlePlaceOrder}
        appliedDiscount={appliedDiscount}
        onApplyCoupon={handleApplyCoupon}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-[var(--color-on-surface)] text-[var(--color-surface)] px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 text-sm font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
