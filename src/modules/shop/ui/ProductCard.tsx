import React from 'react';
import { ShoppingBag, Star, Plus, Eye, Flame, ShieldAlert } from 'lucide-react';
import { Product } from '@/src/core/types/index';

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
    <div className="group relative bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 hover:border-[var(--color-primary)]/30 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-[var(--color-primary)]/5">
      {/* Image Container with mathematically derived padding/radius if needed, but here it's edge-to-edge */}
      <div className="relative aspect-4/3 overflow-hidden bg-[var(--color-surface-container-high)]">
        <img
          src={product.image_url}
          alt={product.nome}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          {product.is_best_seller && (
            <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/50 font-extrabold text-[12px] uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-sm backdrop-blur-md">
              <Flame className="w-3.5 h-3.5" />
              Bestseller
            </span>
          )}
          {product.is_gluten_free && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/50 font-extrabold text-[12px] uppercase tracking-[0.1em] shadow-sm backdrop-blur-md">
              Sem Glúten
            </span>
          )}
        </div>
        {/* Quick View */}
        <button
          onClick={() => onOpenQuickView(product)}
          className="absolute bottom-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-md text-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-white hover:scale-105"
          title="Ver detalhes do doce"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body - Using generous spacing */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-2 block">
                {product.categoria}
              </span>
              <h3 className="font-bold text-lg leading-tight text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                {product.nome}
              </h3>
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-sm text-amber-900">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-base text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
            {product.descricao}
          </p>
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-5 border-t border-[var(--color-outline-variant)]/30 flex items-center justify-between">
          <div>
            <span className="text-[12px] uppercase font-bold tracking-wider text-[var(--color-outline)] block mb-0.5">Preço</span>
            <span className="text-xl font-black text-[var(--color-on-surface)]">
              R$ {product.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="px-5 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-3xl overflow-hidden animate-pulse flex flex-col justify-between">
      <div className="aspect-4/3 w-full bg-[var(--color-surface-container-high)]"></div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="h-3 w-16 bg-[var(--color-surface-container-high)] rounded-md"></div>
          <div className="h-6 w-3/4 bg-[var(--color-surface-container-highest)] rounded-lg"></div>
          <div className="space-y-2 mt-4">
            <div className="h-4 w-full bg-[var(--color-surface-container-high)] rounded-md"></div>
            <div className="h-4 w-2/3 bg-[var(--color-surface-container-high)] rounded-md"></div>
          </div>
        </div>
        <div className="mt-6 pt-5 border-t border-[var(--color-outline-variant)]/10 flex items-center justify-between">
          <div className="h-8 w-24 bg-[var(--color-surface-container-high)] rounded-xl"></div>
          <div className="h-10 w-28 bg-[var(--color-surface-container-highest)] rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};
