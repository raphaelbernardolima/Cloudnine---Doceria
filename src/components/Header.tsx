import React, { useState } from 'react';
import { ShoppingBag, Cake, Sparkles, Sun, Moon, Contrast, Award, Settings2, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'shop' | 'custom-cake' | 'loyalty' | 'admin' | 'profile';
  setActiveTab: (tab: 'shop' | 'custom-cake' | 'loyalty' | 'admin' | 'profile') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenCustomCakeModal: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenCustomCakeModal,
  themeMode,
  setThemeMode,
  currentUser,
  onOpenAuthModal,
  onOpenCustomerProfile,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('light-high-contrast');
    else if (themeMode === 'light-high-contrast') setThemeMode('dark-high-contrast');
    else setThemeMode('light');
  };

  const handleAdminClick = () => {
    setIsMobileMenuOpen(false);
    if (activeTab === 'admin') {
      setActiveTab('shop');
      return;
    }
    const staffRoles = ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'];
    if (currentUser && staffRoles.includes(currentUser.role)) {
      setActiveTab('admin');
    } else {
      onOpenAuthModal();
    }
  };

  const handleNavClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--color-surface)]/95 border-b border-[var(--color-outline-variant)]/30 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          onClick={() => handleNavClick(() => setActiveTab('shop'))}
        >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-tertiary)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Cake className="w-5 h-5 text-[var(--color-on-primary)]" />
          </div>
          <div>
            <span className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-[var(--color-on-surface)] flex items-center gap-1">
              Cloudnine
            </span>
            <p className="text-sm text-[var(--color-outline)] hidden sm:block leading-none">Confeitaria Artesanal</p>
          </div>
        </div>

        {/* Central Navigation Bar (Tablet / Desktop: md:flex) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-[var(--color-surface-container)] p-1 rounded-full border border-[var(--color-outline-variant)]/30 shrink-0">
          <button
            id="nav-tab-shop"
            onClick={() => setActiveTab('shop')}
            className={`flex items-center space-x-1.5 px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
              activeTab === 'shop'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cardápio</span>
          </button>

          <button
            id="nav-tab-custom-cake"
            onClick={onOpenCustomCakeModal}
            className="flex items-center space-x-1.5 px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-all min-h-[36px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Monte seu Bolo</span>
          </button>

          <button
            id="nav-tab-loyalty"
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center space-x-1.5 px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
              activeTab === 'loyalty'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Cloudnine Club</span>
            <span className="lg:hidden">Club</span>
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => {
              if (currentUser) setActiveTab('profile');
              else onOpenAuthModal();
            }}
            className={`flex items-center space-x-1.5 px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
              activeTab === 'profile'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Meu Perfil</span>
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">

          {/* User Account Button (Tablet/Desktop) */}
          <div className="hidden md:flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-1.5 bg-[var(--color-surface-container-high)] pl-1 pr-1 py-1 rounded-xl border border-[var(--color-outline-variant)]/30 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-1.5 hover:text-[var(--color-primary)] transition-colors"
                  title="Abrir Meu Perfil / Portal do Cliente"
                >
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-[var(--color-primary)]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                  <span className="text-[var(--color-on-surface)] max-w-[80px] lg:max-w-[120px] truncate">{currentUser.nome?.replace(/["']/g, '') || 'Usuário'}</span>
                  {currentUser.role !== 'cliente' && currentUser.role !== 'USUARIO_PADRAO' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] uppercase font-extrabold hidden lg:inline">
                      {currentUser.role}
                    </span>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  title="Sair da Conta"
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 transition-colors flex items-center justify-center min-w-[28px] min-h-[28px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container-highest)] transition-all flex items-center space-x-1.5 min-h-[38px]"
              >
                <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span className="hidden lg:inline">Entrar / Minha Conta</span>
                <span className="lg:hidden">Entrar</span>
              </button>
            )}
          </div>

          {/* Theme Mode Button */}
          <button
            id="header-theme-toggle"
            onClick={toggleTheme}
            title={`Alternar Tema (${themeMode})`}
            className="p-2 sm:p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-colors flex items-center justify-center border border-[var(--color-outline-variant)]/30 text-xs min-w-[46px] min-h-[46px]"
          >
            {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-600" />}
            {themeMode === 'dark' && <Moon className="w-4 h-4 text-rose-300" />}
            {(themeMode === 'light-high-contrast' || themeMode === 'dark-high-contrast') && (
              <Contrast className="w-4 h-4 text-purple-500" />
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-95 transition-all shadow-xs font-bold text-xs min-h-[46px] min-w-[46px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Sacola</span>
            {cartCount > 0 && (
              <span className="ml-0.5 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-extrabold rounded-full w-5 h-5 text-sm flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle (md:hidden) */}
          <button
            id="header-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu de Navegação"
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container-highest)] transition-all min-w-[46px] min-h-[46px] flex items-center justify-center"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Ergonomic Mobile Slide-Down Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            
            {/* User Account / Auth Bar */}
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <div className="p-3.5 rounded-2xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/30 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] flex items-center justify-center font-extrabold text-sm shadow-xs overflow-hidden shrink-0">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.nome.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-sm text-[var(--color-on-surface)] truncate">
                      {(currentUser.nome?.replace(/["']/g, '') || 'Usuário')} {(currentUser.sobrenome?.replace(/["']/g, '') || '')}
                    </p>
                    <p className="text-xs text-[var(--color-outline)] font-semibold uppercase truncate">
                      {currentUser.role !== 'cliente' && currentUser.role !== 'USUARIO_PADRAO' ? `${currentUser.role} • ` : ''}{currentUser.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick(() => setActiveTab('profile'))}
                    className="p-2.5 rounded-xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/30 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--color-surface-container-highest)] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Ver Perfil</span>
                  </button>
                  <button
                    onClick={() => handleNavClick(onLogout)}
                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick(onOpenAuthModal)}
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/40 text-xs font-extrabold text-[var(--color-on-surface)] flex items-center justify-between hover:bg-[var(--color-surface-container-highest)] transition-all min-h-[48px]"
              >
                <div className="flex items-center space-x-2.5">
                  <User className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Entrar / Criar Minha Conta</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-outline)]" />
              </button>
            )}

            {/* Navigation List */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleNavClick(() => setActiveTab('shop'))}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all min-h-[48px] ${
                  activeTab === 'shop'
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                    : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cardápio de Doces</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick(() => {
                  if (currentUser) setActiveTab('profile');
                  else onOpenAuthModal();
                })}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all min-h-[48px] ${
                  activeTab === 'profile'
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                    : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>Meu Perfil / Portal do Cliente</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick(onOpenCustomCakeModal)}
                className="w-full px-4 py-3 rounded-2xl text-xs font-extrabold bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] flex items-center justify-between transition-all min-h-[48px]"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Monte seu Bolo Personalizado</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick(() => setActiveTab('loyalty'))}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all min-h-[48px] ${
                  activeTab === 'loyalty'
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                    : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-4 h-4" />
                  <span>Cloudnine Club & Fidelidade</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={handleAdminClick}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all min-h-[48px] ${
                  activeTab === 'admin'
                    ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] shadow-xs'
                    : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Settings2 className="w-4 h-4" />
                  <span>Painel de Gestão (Admin / Equipe)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* Quick Actions Footer inside Drawer */}
            <div className="pt-2.5 border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between text-sm text-[var(--color-outline)] font-bold">
              <span>Tema: {themeMode.toUpperCase()}</span>
              <button
                onClick={toggleTheme}
                className="text-[var(--color-primary)] hover:underline"
              >
                Alternar Modo de Cor
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
