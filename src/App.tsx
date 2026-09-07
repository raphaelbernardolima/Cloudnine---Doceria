import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/src/core/ui/layout/Header';
import { SplashScreen } from '@/src/core/ui/components/SplashScreen';
import { MobileBottomNav } from '@/src/core/ui/layout/MobileBottomNav';
import { ShopView } from '@/src/modules/shop/ui/ShopView';
import { AboutUsView } from '@/src/modules/shop/ui/AboutUsView';
import { ProductModal } from '@/src/modules/shop/ui/ProductModal';
import { CustomCakeModal } from '@/src/modules/shop/ui/CustomCakeModal';
import { CartDrawer } from '@/src/modules/shop/ui/CartDrawer';
import { CheckoutView } from '@/src/modules/shop/ui/CheckoutView';
import { LoyaltyView } from '@/src/modules/profile/ui/LoyaltyView';
import { AuthModal } from '@/src/modules/auth/ui/AuthModal';
import { Product } from '@/src/core/types';

import { useSupabaseSync } from '@/src/core/hooks/useSupabaseSync';
import { usePaymentHandler } from '@/src/core/hooks/usePaymentHandler';
import { useAppTheme } from '@/src/core/theme/ThemeContext';
import { Sparkles, ShieldAlert, LogIn, User } from 'lucide-react';

// New Stores
import { useUIStore } from '@/src/core/store/useUIStore';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useCartStore } from '@/src/core/store/useCartStore';
import { signOutSupabase } from '@/src/core/services/supabase';
import { isStaff } from '@/src/core/constants/roles';

// Lazy-loaded heavy modules (code splitting)
const AdminDashboard = lazy(() => import('@/src/modules/admin/ui/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CustomerProfileView = lazy(() => import('@/src/modules/profile/ui/CustomerProfileView').then(m => ({ default: m.CustomerProfileView })));

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useSupabaseSync();
  usePaymentHandler();
  
  const { mode } = useAppTheme();
  
  // Stores
  const { currentUser, setCurrentUser, isLoadingProducts, orders } = useDataStore();
  const { isAuthModalOpen, setIsAuthModalOpen, authRequiredNotice, toastMessage } = useUIStore();
  const { isCartOpen, setIsCartOpen, addToCart } = useCartStore();

  const [isCustomCakeOpen, setIsCustomCakeOpen] = useState(false);
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<Product | null>(null);

  // Synchronize theme attribute on body
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light-high-contrast', 'dark-high-contrast');
    if (mode === 'dark') document.documentElement.classList.add('dark');
  }, [mode]);

  const handleOpenAuthModal = (notice?: string) => {
    setIsAuthModalOpen(true, notice);
  };

  const handleLogout = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    navigate('/');
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    if (isStaff(user)) {
      navigate('/admin');
    }
  };

  const isUserAdminOrStaff = isStaff(currentUser);

  const handleAddToCart = (product: Product, quantity: number, observacoes?: string) => {
    addToCart({
      product: product,
      quantity: quantity,
      unitPrice: product.preco,
      customNote: observacoes || ''
    });
    setSelectedQuickProduct(null);
    setIsCartOpen(true);
  };

  const handleAddCustomCake = (cake: any) => {
    addToCart({
      customCake: cake,
      quantity: 1,
      unitPrice: cake.preco_total,
      customNote: `Bolo Personalizado: ${cake.tamanho}, ${cake.massa}, Recheios: ${cake.recheio1} e ${cake.recheio2}, Cobertura: ${cake.cobertura}. Obs: ${cake.observacoes}`
    });
    setIsCustomCakeOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-(--color-surface) text-(--color-on-surface) transition-colors font-sans flex flex-col">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        onOpenCart={() => setIsCartOpen(!isCartOpen)}
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        onOpenAuthModal={(notice) => handleOpenAuthModal(notice)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-6">
        <Routes>
          <Route path="/" element={
            <ShopView
              isLoadingProducts={isLoadingProducts}
              onOpenCustomCake={() => setIsCustomCakeOpen(true)}
              onNavigateLoyalty={() => navigate('/loyalty')}
              onOpenQuickView={setSelectedQuickProduct}
            />
          } />

          <Route path="/checkout" element={<CheckoutView />} />
          <Route path="/sobre" element={<AboutUsView />} />
          <Route path="/loyalty" element={<LoyaltyView onOpenAuthModal={(msg) => handleOpenAuthModal(msg)} />} />

          <Route path="/profile" element={
            currentUser ? (
              <Suspense fallback={<div className="py-20 text-center text-(--color-outline)">Carregando perfil...</div>}>
                <CustomerProfileView
                  currentUser={currentUser}
                  orders={orders}
                  onUpdateUser={(updated) => setCurrentUser(updated)}
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

          <Route path="/admin" element={
            isUserAdminOrStaff ? (
              <Suspense fallback={<div className="py-20 text-center text-(--color-outline)">Carregando painel...</div>}>
                <AdminDashboard />
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

      <MobileBottomNav
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        isAuthenticated={!!currentUser}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        requiredRoleMessage={authRequiredNotice}
      />

      {selectedQuickProduct && (
        <ProductModal
          product={selectedQuickProduct}
          isOpen={!!selectedQuickProduct}
          onClose={() => setSelectedQuickProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CustomCakeModal
        isOpen={isCustomCakeOpen}
        onClose={() => setIsCustomCakeOpen(false)}
        onAddCustomCake={handleAddCustomCake}
      />

      <CartDrawer />

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-999 bg-(--color-on-surface) text-(--color-surface) px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 text-sm font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating WhatsApp Support Button */}
      {!isStaff(currentUser) && (() => {
        const { storePhone } = useDataStore.getState();
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
              Ajuda?
            </span>
          </a>
        );
      })()}
    </div>
  );
}
