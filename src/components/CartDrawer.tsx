import React, { useState } from 'react';
import { X, Trash2, Calendar, Clock, QrCode, CreditCard, ShoppingBag, CheckCircle, ChevronRight, Copy, Check, Send, Truck, Store, Loader2 } from 'lucide-react';
import { CartItem, Order } from '../types';
import { AddressLookupForm } from './AddressLookupForm';
import { AddressResult } from '../lib/addressService';

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

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const taxaEntrega = tipoEntrega === 'entrega' ? 12.00 : 0;
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

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
              email: "cliente@email.com", // In a real app, collect the email
            },
            external_reference: `ORDER-${Math.floor(1000 + Math.random() * 9000)}`
          })
        });

        if (!response.ok) {
          throw new Error('Falha ao processar pagamento via Mercado Pago');
        }

        const data = await response.json();
        
        // Redirect to Mercado Pago checkout
        if (data.init_point) {
          window.location.href = data.init_point;
          return;
        }
      } catch (error) {
        console.error('Payment Error:', error);
        // Silently continue to fallback order creation
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
      itens: items.map(i => ({
        nomeProduto: i.product?.nome || (i.customCake ? `Bolo Personalizado ${i.customCake.tamanho}` : 'Doce Especial'),
        quantidade: i.quantity,
        preco_unitario: i.unitPrice,
        detalhesCustomizados: i.customNote || (i.customCake ? `${i.customCake.massa} + ${i.customCake.recheio1}` : undefined)
      }))
    };

    onPlaceOrder(newOrder);
    setStep('confirmation');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--color-surface)] h-full shadow-2xl border-l border-[var(--color-outline-variant)]/40 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="font-extrabold text-base text-[var(--color-on-surface)]">
              {step === 'cart' && 'Sua Sacola Cloudnine'}
              {step === 'checkout' && 'Finalizar Pedido'}
              {step === 'confirmation' && 'Pedido Confirmado! 🎉'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS */}
        {step === 'cart' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 my-12 text-[var(--color-outline)]">
                <ShoppingBag className="w-12 h-12 stroke-1" />
                <p className="font-bold text-sm text-[var(--color-on-surface)]">Sua sacola está vazia</p>
                <p className="text-xs max-w-xs">Escolha alguns dos nossos deliciosos brigadeiros, macarons e bolos no cardápio!</p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img 
                      src={item.product?.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200'} 
                      alt="Item" 
                      className="w-12 h-12 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-[var(--color-on-surface)] truncate">
                        {item.product?.nome || (item.customCake ? `Bolo ${item.customCake.tamanho}` : 'Doce Especial')}
                      </h4>
                      {item.customCake && (
                        <p className="text-[10px] text-[var(--color-primary)] font-semibold truncate">
                          {item.customCake.massa} • {item.customCake.recheio1}
                        </p>
                      )}
                      {item.customNote && (
                        <p className="text-[10px] text-[var(--color-outline)] italic truncate">
                          Obs: {item.customNote}
                        </p>
                      )}
                      <span className="font-extrabold text-xs text-[var(--color-primary)] block mt-0.5">
                        R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-[var(--color-surface-container-high)] px-2 py-1 rounded-xl">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-xs font-bold px-1"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-xs font-bold px-1"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Coupon Form */}
            {items.length > 0 && (
              <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Cupom de Desconto (ex: CLOUDNINE10)"
                  className="flex-1 p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-secondary)] text-[var(--color-on-secondary)] font-bold text-xs"
                >
                  Aplicar
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Customer info */}
            <div className="space-y-2">
              <label className="font-bold text-[var(--color-on-surface)] block">Seus Dados de Contato</label>
              <input
                type="text"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Nome Completo"
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none"
              />
              <input
                type="text"
                value={telefoneCliente}
                onChange={(e) => setTelefoneCliente(e.target.value)}
                placeholder="Telefone / WhatsApp"
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none"
              />
            </div>

            {/* Delivery type */}
            <div className="space-y-2">
              <label className="font-bold text-[var(--color-on-surface)] block">Modalidade de Entrega</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoEntrega('entrega')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center space-x-2 ${
                    tipoEntrega === 'entrega'
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent'
                      : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/40'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Entrega (R$ 12,00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEntrega('retirada')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center space-x-2 ${
                    tipoEntrega === 'retirada'
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent'
                      : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/40'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Retirada Grátis</span>
                </button>
              </div>
            </div>

            {tipoEntrega === 'entrega' && (
              <div className="space-y-2 pt-1">
                <label className="font-extrabold text-[var(--color-on-surface)] block text-xs">Endereço de Entrega (Busca por CEP & GPS)</label>
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
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Data Agendada</label>
                <input
                  type="date"
                  value={dataAgendada}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Horário</label>
                <select
                  value={horarioAgendado}
                  onChange={(e) => setHorarioAgendado(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none"
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
              <label className="font-bold text-[var(--color-on-surface)] block">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('pix')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-1.5 ${
                    metodoPagamento === 'pix'
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/40'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pix (Instantâneo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('cartao_credito')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-1.5 ${
                    metodoPagamento === 'cartao_credito'
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent'
                      : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/40'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão no Balcão</span>
                </button>
              </div>
            </div>

            {metodoPagamento === 'pix' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-center">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
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
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-2"
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[var(--color-on-surface)]">Pedido Recebido com Sucesso!</h3>
              <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs">
                Nossos confeiteiros já receberam sua solicitação no painel da cozinha.
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 text-left text-xs space-y-1.5">
              <p><strong>Cliente:</strong> {nomeCliente}</p>
              <p><strong>Total:</strong> R$ {totalFinal.toFixed(2).replace('.', ',')}</p>
              <p><strong>Agendado para:</strong> {dataAgendada} ({horarioAgendado})</p>
              <p><strong>Pagamento:</strong> {metodoPagamento.toUpperCase()}</p>
            </div>

            <a
              href={`https://wa.me/5511999990000?text=${encodeURIComponent(`Olá Cloudnine! Fiz o pedido no site com o valor de R$ ${totalFinal.toFixed(2)}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:bg-emerald-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Comprovante via WhatsApp</span>
            </a>
          </div>
        )}

        {/* Footer Summary & Action Button */}
        {step !== 'confirmation' && (
          <div className="p-5 bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)]/30 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {tipoEntrega === 'entrega' && (
                <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                  <span>Taxa de Entrega</span>
                  <span>R$ 12,00</span>
                </div>
              )}
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Desconto Cupom</span>
                  <span>- R$ {appliedDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-[var(--color-on-surface)] pt-2 border-t border-[var(--color-outline-variant)]/20">
                <span>Total Final</span>
                <span className="text-[var(--color-primary)]">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                disabled={items.length === 0}
                onClick={() => setStep('checkout')}
                className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all ${
                  items.length > 0
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-95'
                    : 'bg-[var(--color-surface-container-high)] text-[var(--color-outline)] cursor-not-allowed'
                }`}
              >
                <span>Avançar para Identificação</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 rounded-2xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold text-xs"
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinishCheckout}
                  disabled={isProcessingPayment}
                  className="flex-1 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <span>Processando Pagamento...</span>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Confirmar e Finalizar Pedido</span>
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
