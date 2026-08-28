import React, { useState } from 'react';
import { X, Star, ShoppingBag, Plus, Minus, Check, Flame, ShieldAlert } from 'lucide-react';
import { Product } from '@/src/core/types/index';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, customNote?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, customNote);
    onClose();
    setQuantity(1);
    setCustomNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-outline-variant)]/40 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[var(--color-surface)]/80 text-[var(--color-on-surface)] backdrop-blur-xs hover:bg-[var(--color-surface)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image side */}
        <div className="w-full md:w-1/2 relative bg-[var(--color-surface-container)] min-h-[220px] md:min-h-full">
          <img
            src={product.image_url}
            alt={product.nome}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {product.is_best_seller && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" /> Bestseller
            </span>
          )}
        </div>

        {/* Content side */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold text-sm uppercase">
                {product.categoria}
              </span>
              <span className="text-sm font-bold text-[var(--color-outline)]">
                Estoque: {product.estoque} un
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-[var(--color-on-surface)] leading-snug">
              {product.nome}
            </h2>

            {product.rating && (
              <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-xs">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-sm text-[var(--color-outline)] font-normal">
                  ({product.reviews_count || 12} avaliações de clientes)
                </span>
              </div>
            )}

            <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
              {product.descricao}
            </p>

            {product.ingredients && product.ingredients.length > 0 && (
              <div className="pt-2 border-t border-[var(--color-outline-variant)]/20">
                <span className="font-bold text-[var(--color-on-surface)] block mb-1">Ingredientes Principais:</span>
                <div className="flex flex-wrap gap-1">
                  {product.ingredients.map((ing, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div className="pt-2">
              <label className="font-bold text-[var(--color-on-surface)] block mb-1">Observação do Item:</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ex: Enviar com laço de fita rosa / Sem morangos"
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 text-xs text-[var(--color-on-surface)] focus:outline-none"
              />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="pt-4 border-t border-[var(--color-outline-variant)]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-[var(--color-surface-container-high)] p-1 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-xl text-[var(--color-on-surface)] hover:bg-[var(--color-surface)] transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-[var(--color-on-surface)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 rounded-xl text-[var(--color-on-surface)] hover:bg-[var(--color-surface)] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-sm text-[var(--color-outline)] font-bold block uppercase">Subtotal</span>
                <span className="text-lg font-black text-[var(--color-primary)]">
                  R$ {(product.preco * quantity).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:opacity-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar à Sacola • R$ {(product.preco * quantity).toFixed(2).replace('.', ',')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
