import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  CheckCircle, 
  ChevronRight, 
  Copy, 
  Check, 
  Send, 
  Truck, 
  Store, 
  Loader2, 
  ArrowLeft,
  QrCode, 
  CreditCard, 
  Cake,
  Tag
} from 'lucide-react';
import { CartItem, Order } from '@/src/core/types/index';
import { AddressLookupForm } from '@/src/modules/profile/ui/AddressLookupForm';
import { AddressResult } from '@/src/core/services/addressService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Partial<Order>) => void;
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
  onPlaceOrder,
  appliedDiscount,
  onApplyCoupon
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Form Fields
  const [nomeCliente, setNomeCliente] = useState('Mariana Silva');
  const [telefoneCliente, setTelefoneCliente] = useState('(11) 98765-4321');
  const [tipoEntrega, setTipoEntrega] = useState<'entrega' | 'retirada'>('entrega');
  const [endereco, setEndereco] = useState('Av. Paulista, 1500 - Apt 82 - Bela Vista');
  const [dataAgendada, setDataAgendada] = useState(new Date().toISOString().split('T')[0]);
  const [horarioAgendado, setHorarioAgendado] = useState('16:00 - 17:00');
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro_retirada'>('pix');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
  const taxaEntrega = items.length > 0 && tipoEntrega === 'entrega' ? 12.00 : 0;
  const totalFinal = Math.max(0, subtotal + taxaEntrega - appliedDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  const pixKey = "00020126580014BR.GOV.BCB.PIX0136cloudnine.doceria.pix@cloudnine.com520400005303986540510.005802BR5920Cloudnine Confeitaria6009Sao Paulo62070503***6304E21A";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleFinishCheckout = async () => {
    if (metodoPagamento === 'pix' || metodoPagamento === 'cartao_credito' || metodoPagamento === 'cartao_debito') {
      try {
        setIsProcessingPayment(true);
        // Call backend API to create Mercado Pago preference
        const response = await fetch('/api/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(item => ({
              title: item.product?.nome || 'Doce Especial Cloudnine',
              quantity: item.quantity,
              unit_price: item.unitPrice,
            })),
            payer: {
              name: nomeCliente,
              email: "cliente@email.com",
            },
            external_reference: `ORDER-${Math.floor(1000 + Math.random() * 9000)}`
          })
        });

        if (!response.ok) {
          throw new Error('Falha ao processar pagamento via Mercado Pago');
        }

        const data = await response.json();
        
        // Redirect to Mercado Pago checkout if available
        if (data.init_point) {
          window.location.href = data.init_point;
          return;
        }
      } catch (error) {
        console.error('Payment Error:', error);
      } finally {
        setIsProcessingPayment(false);
      }
    }

    // Default flow for cash/fallback
    const newOrder: Partial<Order> = {
      id: Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      cliente_nome: nomeCliente,
      cliente_telefone: telefoneCliente,
      total: totalFinal,
      status: metodoPagamento === 'pix' ? 'pendente_pix' : 'em_preparo',
      metodo_pagamento: metodoPagamento,
      tipo_entrega: tipoEntrega,
      data_agendada: dataAgendada,
      horario_agendado: horarioAgendado,
      endereco_entreg: tipoEntrega === 'entrega' ? endereco : 'Retirada no Balcão Cloudnine (Al. Gabriel Monteiro da Silva, 450)',
      itens: items.map(i => {
        const itemTitle = i.product?.nome || (i.customCake ? `Bolo Personalizado ${i.customCake.tamanho}` : 'Doce Especial');
        return {
          nome: itemTitle,
          nomeProduto: itemTitle,
          quantidade: i.quantity,
          preco_unitario: i.unitPrice,
          detalhesCustomizados: i.customNote || (i.customCake ? `${i.customCake.massa} + ${i.customCake.recheio1}` : undefined)
        };
      })
    };

    onPlaceOrder(newOrder);
    setStep('confirmation');
  };

  const handleResetAndClose = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-full max-w-md bg-[#FFF8F7] dark:bg-[#1E1716] text-[#3D3331] dark:text-[#E8DFDC] h-full max-h-[100dvh] shadow-2xl flex flex-col justify-between overflow-hidden border-l border-rose-200/50 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FDF2F0] dark:bg-[#2A201F] border-b border-rose-100 dark:border-neutral-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            {step === 'checkout' ? (
              <button 
                onClick={() => setStep('cart')} 
                className="p-1.5 -ml-1.5 rounded-full hover:bg-rose-200/50 text-[#3D3331] dark:text-[#E8DFDC] transition-colors"
                title="Voltar para a sacola"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-200/60 dark:bg-rose-900/40 flex items-center justify-center text-rose-800 dark:text-rose-200">
                <ShoppingBag className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-base text-[#3C2218] dark:text-rose-100 leading-tight">
                {step === 'cart' && 'Sua Sacola'}
                {step === 'checkout' && 'Identificação & Entrega'}
                {step === 'confirmation' && 'Pedido Confirmado! 🎉'}
              </h2>
              {step === 'cart' && items.length > 0 && (
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

        {/* STEP 1: CART ITEMS */}
        {step === 'cart' && (
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
                          <span className="font-bold text-sm px-1.5 min-w-[20px] text-center text-[#3C2218] dark:text-rose-100">
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

                {/* Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Cupom (ex: CLOUDNINE10)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#261D1C] border border-rose-200/70 dark:border-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
                    />
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#3C2218] dark:text-rose-100 font-bold text-xs transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
            {/* Customer info */}
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[#7A6C68] dark:text-[#B5A5A2] block">
                Seus Dados
              </label>
              <input
                type="text"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Nome Completo"
                className="w-full p-3 rounded-xl bg-white dark:bg-[#261D1C] border border-rose-200/70 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <input
                type="text"
                value={telefoneCliente}
                onChange={(e) => setTelefoneCliente(e.target.value)}
                placeholder="Telefone / WhatsApp"
                className="w-full p-3 rounded-xl bg-white dark:bg-[#261D1C] border border-rose-200/70 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Delivery type */}
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[#7A6C68] dark:text-[#B5A5A2] block">
                Forma de Entrega
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoEntrega('entrega')}
                  className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    tipoEntrega === 'entrega'
                      ? 'bg-[#9E2A2B] text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#261D1C] text-[#3C2218] dark:text-rose-100 border-rose-200/70 dark:border-neutral-800'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span>Entrega (R$ 12,00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEntrega('retirada')}
                  className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    tipoEntrega === 'retirada'
                      ? 'bg-[#9E2A2B] text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#261D1C] text-[#3C2218] dark:text-rose-100 border-rose-200/70 dark:border-neutral-800'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span>Retirada no Balcão</span>
                </button>
              </div>
            </div>

            {tipoEntrega === 'entrega' && (
              <div className="space-y-2 pt-1">
                <label className="font-bold text-xs uppercase tracking-wider text-[#7A6C68] dark:text-[#B5A5A2] block">
                  Endereço de Entrega
                </label>
                <AddressLookupForm
                  initialCep="01500-000"
                  initialLogradouro="Av. Paulista"
                  initialNumero="1500"
                  initialBairro="Bela Vista"
                  initialCidade="São Paulo"
                  initialUf="SP"
                  initialComplemento="Apt 82"
                  compact={true}
                  onAddressChange={(addr: AddressResult) => {
                    const formatted = addr.formattedAddress || `${addr.logradouro}, ${addr.numero || ''} - ${addr.bairro}, ${addr.cidade} - ${addr.uf} (CEP: ${addr.cep})`;
                    setEndereco(formatted);
                  }}
                />
              </div>
            )}

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-xs uppercase tracking-wider text-[#7A6C68] dark:text-[#B5A5A2] block mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={dataAgendada}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#261D1C] border border-rose-200/70 dark:border-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="font-bold text-xs uppercase tracking-wider text-[#7A6C68] dark:text-[#B5A5A2] block mb-1">
                  Horário
                </label>
                <select
                  value={horarioAgendado}
                  onChange={(e) => setHorarioAgendado(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#261D1C] border border-rose-200/70 dark:border-neutral-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  <option value="10:00 - 12:00">10:00 - 12:00</option>
                  <option value="14:00 - 16:00">14:00 - 16:00</option>
                  <option value="16:00 - 17:00">16:00 - 17:00</option>
                  <option value="18:00 - 19:30">18:00 - 19:30</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[#7A6C68] dark:text-[#B5A5A2] block">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('pix')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                    metodoPagamento === 'pix'
                      ? 'bg-emerald-700 text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-[#261D1C] text-[#3C2218] dark:text-rose-100 border-rose-200/70 dark:border-neutral-800'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pix (Instantâneo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('cartao_credito')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                    metodoPagamento === 'cartao_credito'
                      ? 'bg-[#9E2A2B] text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-[#261D1C] text-[#3C2218] dark:text-rose-100 border-rose-200/70 dark:border-neutral-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão no Local</span>
                </button>
              </div>
            </div>

            {metodoPagamento === 'pix' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-center">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  Chave Pix E-mail da Confeitaria
                </span>
                <div className="p-2 bg-white rounded-xl inline-block shadow-xs">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(pixKey)}`} 
                    alt="QR Code Pix"
                    className="w-28 h-28 mx-auto"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
                >
                  {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPix ? 'Copia e Cola Copiado!' : 'Copiar Chave Pix'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 'confirmation' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#3C2218] dark:text-rose-100">Pedido Recebido com Sucesso!</h3>
              <p className="text-xs text-[#7A6C68] dark:text-[#B5A5A2] max-w-xs">
                Nossos confeiteiros já receberam sua solicitação no painel da cozinha.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-white dark:bg-[#261D1C] border border-rose-100 dark:border-neutral-800 text-left text-xs space-y-2 shadow-xs">
              <div className="flex justify-between border-b border-rose-50 dark:border-neutral-800 pb-1.5">
                <span className="text-[#7A6C68]">Cliente:</span>
                <span className="font-bold text-[#3C2218] dark:text-rose-100">{nomeCliente}</span>
              </div>
              <div className="flex justify-between border-b border-rose-50 dark:border-neutral-800 pb-1.5">
                <span className="text-[#7A6C68]">Total Pago:</span>
                <span className="font-black text-[#9E2A2B] dark:text-rose-300">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between border-b border-rose-50 dark:border-neutral-800 pb-1.5">
                <span className="text-[#7A6C68]">Agendamento:</span>
                <span className="font-medium text-[#3C2218] dark:text-rose-100">{dataAgendada} ({horarioAgendado})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6C68]">Pagamento:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{metodoPagamento.replace('_', ' ')}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/5511999990000?text=${encodeURIComponent(`Olá Cloudnine! Fiz o pedido no site no valor de R$ ${totalFinal.toFixed(2).replace('.', ',')}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Comprovante no WhatsApp</span>
            </a>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#3C2218] dark:text-rose-100 font-bold text-xs transition-colors"
            >
              Voltar ao Cardápio
            </button>
          </div>
        )}

        {/* Footer Summary & Action Button */}
        {step !== 'confirmation' && items.length > 0 && (
          <div className="p-5 bg-[#FDF2F0] dark:bg-[#261D1C] border-t border-rose-100 dark:border-neutral-800 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7A6C68] dark:text-[#B5A5A2]">
                <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'})</span>
                <span className="font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <div className="flex justify-between text-[#7A6C68] dark:text-[#B5A5A2]">
                <span>Taxa de Entrega ({tipoEntrega === 'entrega' ? 'Padrão' : 'Retirada'})</span>
                <span className="font-semibold">
                  {tipoEntrega === 'entrega' ? 'R$ 12,00' : 'Grátis'}
                </span>
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

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-5 rounded-full font-bold text-sm flex items-center justify-center space-x-2 shadow-md bg-[#9E2A2B] hover:bg-[#831F20] text-white transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Avançar para Identificação</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-5 py-3.5 rounded-full bg-rose-200/70 hover:bg-rose-200 text-[#3C2218] dark:bg-neutral-800 dark:text-rose-100 font-bold text-xs transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinishCheckout}
                  disabled={isProcessingPayment}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#9E2A2B] hover:bg-[#831F20] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessingPayment ? (
                    <>
                      <span>Processando...</span>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Confirmar Pedido</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
