import React from 'react';
import { ProductCard, ProductSkeleton } from './ProductCard';
import { Sparkles, Cake, Gift, Search } from 'lucide-react';
import { Product } from '@/src/core/types/index';

interface ShopViewProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoadingProducts: boolean;
  filteredProducts: Product[];
  onOpenCustomCake: () => void;
  onNavigateLoyalty: () => void;
  onAddToCart: (p: Product, qty: number) => void;
  onOpenQuickView: (p: Product) => void;
}

export function ShopView({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  isLoadingProducts,
  filteredProducts,
  onOpenCustomCake,
  onNavigateLoyalty,
  onAddToCart,
  onOpenQuickView
}: ShopViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Brand Banner */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[var(--color-primary-container)] via-[var(--color-surface-container-high)] to-[var(--color-secondary-container)] border border-[var(--color-outline-variant)]/30 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
        <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Confeitaria Fina & Artesanal</span>
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] tracking-tight leading-tight">
            Momentos Inesquecíveis Pedem Doces Especiais ☁️
          </h1>
          
          <p className="text-xs sm:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Ingredientes nobres importados, preparo diário e carinho em cada detalhe. Faça seu pedido para entrega agendada ou monte seu bolo exclusivo.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={onOpenCustomCake}
              className="px-5 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-xs flex items-center space-x-2 shadow-md hover:opacity-95 transition-all"
            >
              <Cake className="w-4 h-4" />
              <span>Monte seu Bolo Personalizado</span>
            </button>

            <button
              onClick={onNavigateLoyalty}
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
              onAddToCart={(p) => onAddToCart(p, 1)}
              onOpenQuickView={(p) => onOpenQuickView(p)}
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
  );
}
