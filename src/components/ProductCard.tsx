import React from 'react';
import { ShoppingBag, Star, Plus, Eye, Flame, ShieldAlert } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenQuickView
}) => {
  return (
    <div className="group relative bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 overflow-hidden shadow-xs hover:shadow-lg hover:border-[var(--color-primary)]/40 transition-all duration-300 flex flex-col justify-between">
      
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-[var(--color-surface-container)]">
        <img
          src={product.image_url}
          alt={product.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.is_best_seller && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 fill-current" />
              Bestseller
            </span>
          )}
          {product.is_gluten_free && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              Sem Glúten
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => onOpenQuickView(product)}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[var(--color-on-surface)] opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-[var(--color-surface)]"
          title="Ver detalhes do doce"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-container)] px-2 py-0.5 rounded-md">
              {product.categoria}
            </span>

            {product.rating && (
              <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--color-outline)] font-normal">
                  ({product.reviews_count || 12})
                </span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-sm text-[var(--color-on-surface)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
            {product.nome}
          </h3>

          <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2 mt-1 leading-relaxed">
            {product.descricao}
          </p>
        </div>

        {/* Footer Price & Add CTA */}
        <div className="pt-2 border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-[var(--color-outline)] block">Preço</span>
            <span className="text-base font-extrabold text-[var(--color-on-surface)]">
              R$ {product.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="px-3.5 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:opacity-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/20 overflow-hidden shadow-xs flex flex-col justify-between animate-pulse">
      <div className="aspect-4/3 w-full bg-[var(--color-surface-container-high)]"></div>
      
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-16 bg-[var(--color-surface-container-high)] rounded-md"></div>
            <div className="h-3 w-10 bg-[var(--color-surface-container-high)] rounded-md"></div>
          </div>
          <div className="h-4 w-3/4 bg-[var(--color-surface-container-highest)] rounded-md mb-2"></div>
          <div className="h-3 w-full bg-[var(--color-surface-container-high)] rounded-md mb-1"></div>
          <div className="h-3 w-2/3 bg-[var(--color-surface-container-high)] rounded-md"></div>
        </div>
        
        <div className="pt-3 border-t border-[var(--color-outline-variant)]/10 flex items-center justify-between">
          <div className="h-5 w-16 bg-[var(--color-surface-container-highest)] rounded-md"></div>
          <div className="h-8 w-24 bg-[var(--color-surface-container-highest)] rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
