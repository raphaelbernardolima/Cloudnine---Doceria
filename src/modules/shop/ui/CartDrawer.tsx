import React, { useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ChevronRight,
  Cake,
  Tag
} from 'lucide-react';
import { CartItem, Order } from '@/src/core/types/index';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/src/core/store/useStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Partial<Order>) => void; // Keep for interface compatibility if needed elsewhere
  appliedDiscount: number;
  onApplyCoupon: (code: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  appliedDiscount,
  onApplyCoupon
}) => {
  const navigate = useNavigate();
  const { coupons } = useStore();
  const activeCoupons = coupons.filter(c => c.ativo);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const totalFinal = Math.max(0, subtotal - appliedDiscount);

  const handleGoToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-md bg-[#FFF8F7] dark:bg-[#1E1716] text-[#3D3331] dark:text-[#E8DFDC] h-full max-h-dvh shadow-2xl flex flex-col justify-between overflow-hidden border-l border-rose-200/50 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FDF2F0] dark:bg-[#2A201F] border-b border-rose-100 dark:border-neutral-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-200/60 dark:bg-rose-900/40 flex items-center justify-center text-rose-800 dark:text-rose-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#3C2218] dark:text-rose-100 leading-tight">
                Sua Sacola
              </h2>
              {items.length > 0 && (
                <p className="text-xs text-[#7A6C68] dark:text-[#B5A5A2]">
                  {totalQuantity} {totalQuantity === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-rose-100/70 hover:bg-rose-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#3C2218] dark:text-[#E8DFDC] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fechar sacola"
            title="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-10 px-4">
              <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg text-[#3C2218] dark:text-rose-100">Sua sacola está vazia</p>
                <p className="text-xs text-[#7A6C68] dark:text-[#B5A5A2] max-w-xs mx-auto leading-relaxed">
                  Escolha alguns dos nossos deliciosos brigadeiros, macarons e bolos artesanais no cardápio!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-6 py-3 rounded-full bg-[#9E2A2B] hover:bg-[#831F20] text-white font-bold text-sm flex items-center space-x-2 shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Cake className="w-4 h-4" />
                <span>Explorar Cardápio</span>
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#261D1C] border border-rose-100 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-xs hover:border-rose-300/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <img
                        src={item.product?.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200'}
                        alt="Item"
                        className="w-14 h-14 rounded-xl object-cover border border-rose-100 dark:border-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-[#3C2218] dark:text-rose-100 truncate">
                          {item.product?.nome || (item.customCake ? `Bolo ${item.customCake.tamanho}` : 'Doce Especial')}
                        </h4>
                        {item.customCake && (
                          <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold truncate mt-0.5">
                            {item.customCake.massa} • {item.customCake.recheio1}
                          </p>
                        )}
                        {item.customNote && (
                          <p className="text-xs text-[#8A7975] dark:text-[#A89895] italic truncate mt-0.5">
                            Obs: {item.customNote}
                          </p>
                        )}
                        <span className="font-extrabold text-sm text-[#9E2A2B] dark:text-rose-300 block mt-1">
                          R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <div className="flex items-center space-x-1 bg-rose-50 dark:bg-neutral-800 border border-rose-100 dark:border-neutral-700 px-2 py-1 rounded-xl">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-rose-800 dark:text-rose-200 hover:bg-rose-200/60 dark:hover:bg-neutral-700 transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm px-1.5 min-w-5 text-center text-[#3C2218] dark:text-rose-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-rose-800 dark:text-rose-200 hover:bg-rose-200/60 dark:hover:bg-neutral-700 transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remover da sacola"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* One-Tap Coupons */}
              <div className="pt-4 pb-2 border-t border-rose-100 dark:border-neutral-800 mt-4">
                <h4 className="text-xs font-bold text-[#7A6C68] dark:text-[#B5A5A2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Cupons Disponíveis
                </h4>
                
                {activeCoupons.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeCoupons.map(coupon => (
                      <button
                        key={coupon.id}
                        onClick={() => onApplyCoupon(coupon.codigo)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-rose-200/50 dark:border-neutral-700 text-[#9E2A2B] dark:text-rose-300 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        {coupon.codigo}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8A7975] dark:text-[#A89895] italic">Nenhum cupom ativo no momento.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Action Button */}
        {items.length > 0 && (
          <div className="p-5 bg-[#FDF2F0] dark:bg-[#261D1C] border-t border-rose-100 dark:border-neutral-800 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7A6C68] dark:text-[#B5A5A2]">
                <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'})</span>
                <span className="font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Desconto de Cupom</span>
                  <span>- R$ {appliedDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline font-black text-base text-[#3C2218] dark:text-rose-100 pt-2 border-t border-rose-200/50 dark:border-neutral-700">
                <span>Total Final</span>
                <span className="text-xl text-[#9E2A2B] dark:text-rose-300 font-extrabold">
                  R$ {totalFinal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoToCheckout}
              className="w-full py-3.5 px-5 rounded-full font-bold text-sm flex items-center justify-center space-x-2 shadow-md bg-[#9E2A2B] hover:bg-[#831F20] text-white transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Avançar para Identificação</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
