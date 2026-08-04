import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard, ProductSkeleton } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CustomCakeModal } from './components/CustomCakeModal';
import { CartDrawer } from './components/CartDrawer';
import { LoyaltyView } from './components/LoyaltyView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { CustomerProfileView } from './components/CustomerProfileView';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STAFF, INITIAL_AUDIT_LOGS, INITIAL_INGREDIENTS, INITIAL_DRIVERS, INITIAL_COUPONS, INITIAL_LOYALTY_SETTINGS } from './data/doceriaData';
import { Product, CartItem, Order, CustomCakeBuilder, ThemeMode, AuditLog, UserProfile, Ingredient, Driver, Coupon, LoyaltySettings } from './types';
import { getCurrentSupabaseUser, signOutSupabase, updateUserProfileInDB, getSupabaseClient } from './lib/supabase';
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
        handleOpenAuthModal('Para acessar a Área de Gestão, faça login com sua conta autorizada.');
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
    const client = getSupabaseClient();
    if (client) {
      await client.from('pedidos').update({ status: newStatus }).eq('id', orderId);
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Hero Brand Banner */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[var(--color-primary-container)] via-[var(--color-surface-container-high)] to-[var(--color-secondary-container)] border border-[var(--color-outline-variant)]/30 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
              <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Confeitaria Fina & Artesanal
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] tracking-tight leading-tight">
                  Momentos Inesquecíveis Pedem Doces Especiais ☁️
                </h1>
                <p className="text-xs sm:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  Ingredientes nobres importados, preparo diário e carinho em cada detalhe. Faça seu pedido para entrega agendada ou monte seu bolo exclusivo.
                </p>

                <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                  <button
                    onClick={() => setIsCustomCakeOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-xs flex items-center space-x-2 shadow-md hover:opacity-95 transition-all"
                  >
                    <Cake className="w-4 h-4" />
                    <span>Monte seu Bolo Personalizado</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('loyalty')}
                    className="px-5 py-3 rounded-2xl bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] font-bold text-xs flex items-center space-x-2 border border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container-high)] transition-all"
                  >
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span>Conheça o Cloudnine Club</span>
                  </button>
                </div>
              </div>

              {/* Banner Right Image */}
              <div className="relative w-full md:w-80 h-56 rounded-2xl overflow-hidden shadow-lg border border-white/20 transform rotate-1 hover:rotate-0 transition-transform">
                <img 
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800" 
                  alt="Doces Cloudnine" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Categories Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                          : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-outline)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar brigadeiro, bolo..."
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 text-xs focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-on-surface)]"
                  />
                </div>

              </div>
            </div>

            {/* Product Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingProducts ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onOpenQuickView={(p) => setSelectedQuickProduct(p)}
                  />
                ))
              )}
            </div>

            {!isLoadingProducts && filteredProducts.length === 0 && (
              <div className="py-16 text-center space-y-2 text-[var(--color-outline)]">
                <p className="font-bold text-sm text-[var(--color-on-surface)]">Nenhum doce encontrado nesta categoria</p>
                <p className="text-xs">Tente buscar por outro termo ou escolha outra categoria do cardápio.</p>
              </div>
            )}

          </div>
        )}

        {/* CUSTOMER LOYALTY VIEW */}
        {activeTab === 'loyalty' && (
          <LoyaltyView
            onApplyRewardCoupon={(code) => {
              handleApplyCoupon(code);
              if (cartItems.length > 0) {
                setIsCartOpen(true);
              }
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
                onClick={() => handleOpenAuthModal('Faça login com sua conta autorizada para acessar a Área de Gestão.')}
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
      <footer className="mt-16 border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] py-8 text-xs text-[var(--color-on-surface-variant)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-black">
              <Cake className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[var(--color-on-surface)]">Cloudnine Doceria</span>
            <span className="text-sm text-[var(--color-outline)]">© 2026 Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center space-x-4 font-semibold text-sm">
            <span>Alameda Gabriel Monteiro da Silva, 450 - SP</span>
            <span>Atendimento: (11) 99999-0000</span>
          </div>
        </div>
      </footer>

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
