import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from '@/src/core/ui/layout/Header';
import { Footer } from '@/src/core/ui/layout/Footer';
import { ProductCard, ProductSkeleton } from '@/src/modules/shop/ui/ProductCard';
import { ShopView } from '@/src/modules/shop/ui/ShopView';
import { ProductModal } from '@/src/modules/shop/ui/ProductModal';
import { CustomCakeModal } from '@/src/modules/shop/ui/CustomCakeModal';
import { CartDrawer } from '@/src/modules/shop/ui/CartDrawer';
import { LoyaltyView } from '@/src/modules/profile/ui/LoyaltyView';
import { AdminDashboard } from '@/src/modules/admin/ui/AdminDashboard';
import { AuthModal } from '@/src/modules/auth/ui/AuthModal';
import { CustomerProfileView } from '@/src/modules/profile/ui/CustomerProfileView';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STAFF, INITIAL_AUDIT_LOGS, INITIAL_INGREDIENTS, INITIAL_DRIVERS, INITIAL_COUPONS, INITIAL_LOYALTY_SETTINGS } from './data/doceriaData';
import { Product, CartItem, Order, CustomCakeBuilder, ThemeMode, AuditLog, UserProfile, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig } from '@/src/core/types/index';
import { getCurrentSupabaseUser, signOutSupabase, updateUserProfileInDB, getSupabaseClient, getStoreConfig } from '@/src/core/services/supabase';
import { sendOrderStatusNotification, requestNotificationPermission } from '@/src/core/services/notificationService';
import { globalEventBus, AppEvents } from '@/src/core/events/EventBus';
import { Search, Sparkles, Heart, ChevronRight, Cake, Gift, ArrowRight, ShieldAlert, LogIn, User } from 'lucide-react';

export const STAFF_ROLES = ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'];

export function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const navigate = useNavigate();


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
  const [storePhone, setStorePhone] = useState<string>('(13) 98874-7014');
  const [customCakeConfig, setCustomCakeConfig] = useState<any>({
    tamanhos: [
      { id: '13cm', label: 'Bolo M - 13cm (Rende ~10 fatias)', preco_base: 120.0, peso_estimado_kg: 1.2, fatias: 10 },
      { id: '15cm', label: 'Bolo G - 15cm (Rende ~15 fatias)', preco_base: 160.0, peso_estimado_kg: 1.8, fatias: 15 },
      { id: '17cm', label: 'Bolo GG - 17cm (Rende ~20 fatias)', preco_base: 210.0, peso_estimado_kg: 2.2, fatias: 20 }
    ],
    massas: [
      { id: 'm1', label: 'Massa Branca (Baunilha)', preco_adicional: 0 },
      { id: 'm2', label: 'Massa de Chocolate', preco_adicional: 0 },
      { id: 'm3', label: 'Massa Red Velvet', preco_adicional: 15.0 },
      { id: 'm4', label: 'Massa de Churros', preco_adicional: 10.0 }
    ],
    recheios: [
      { id: 'r1', label: 'Brigadeiro Tradicional', preco_adicional: 0 },
      { id: 'r2', label: 'Brigadeiro Branco', preco_adicional: 0 },
      { id: 'r3', label: 'Ninho Trufado', preco_adicional: 10.0 },
      { id: 'r4', label: 'Doce de Leite com Nozes', preco_adicional: 15.0 },
      { id: 'r5', label: 'Geleia de Morango Artesanal', preco_adicional: 12.0 },
      { id: 'r6', label: 'Creme de Pistache', preco_adicional: 25.0 }
    ]
  });

  useEffect(() => {
    async function loadStoreConfig() {
      const config = await getStoreConfig();
      if (config && config.telefone) {
        setStorePhone(config.telefone);
      }
    }
    loadStoreConfig();
  }, []);


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
    navigate('/');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'confeiteiro' || user.role === 'atendente') {
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
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product?.id === product.id && item.customNote === customNote);
      let newCart;
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        newCart = updated;
      } else {
        newCart = [
          ...prev,
          {
            id: `cart-prod-${product.id}-${Date.now()}`,
            product,
            quantity,
            customNote,
            unitPrice: product.preco
          }
        ];
      }
      globalEventBus.emit(AppEvents.CART_UPDATED, { items: newCart.length, added: { product } });
      return newCart;
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
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        currentUser={currentUser}
        onOpenAuthModal={(notice) => handleOpenAuthModal(notice)}
        onLogout={handleLogout}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <CustomerProfileView
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                orders={orders}
                onNavigateToShop={() => navigate('/')}
                onNavigateToAdmin={() => navigate('/admin')}
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
          } />

          {/* ADMIN DASHBOARD VIEW (Protected) */}
          <Route path="/admin" element={
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
                showToast={showToast}
                storePhone={storePhone}
                setStorePhone={setStorePhone} customCakeConfig={undefined} onUpdateCustomCakeConfig={function (config: CustomCakeConfig): void {
                  throw new Error('Function not implemented.');
                }} />
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
          } />
        </Routes>
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

      {/* Floating WhatsApp Support Button */}
      {(() => {
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
