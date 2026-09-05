import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  CreditCard,
  Truck,
  Store,
  Loader2,
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/src/core/store/useStore';
import { AddressLookupForm } from '@/src/modules/profile/ui/AddressLookupForm';
import { AddressResult } from '@/src/core/services/addressService';
import { Order } from '@/src/core/types/index';

interface CheckoutViewProps {
  onPlaceOrder?: (order: Partial<Order>) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onPlaceOrder }) => {
  const navigate = useNavigate();
  const { cartItems, appliedDiscount, currentUser, storeInfo, clearCart } = useStore();
  
  const [step, setStep] = useState<'checkout' | 'confirmation'>('checkout');
  const [copiedPix, setCopiedPix] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [nomeCliente, setNomeCliente] = useState(currentUser?.nome ? `${currentUser.nome} ${currentUser.sobrenome}` : '');
  const [telefoneCliente, setTelefoneCliente] = useState(currentUser?.telefone || '');
  const [tipoEntrega, setTipoEntrega] = useState<'entrega' | 'retirada'>('entrega');
  const [endereco, setEndereco] = useState(
    currentUser?.endereco_rua 
      ? `${currentUser.endereco_rua}, ${currentUser.endereco_numero} - ${currentUser.endereco_bairro}, ${currentUser.endereco_cidade}` 
      : ''
  );
  const [dataAgendada, setDataAgendada] = useState(new Date().toISOString().split('T')[0]);
  const [horarioAgendado, setHorarioAgendado] = useState('16:00 - 17:00');
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro_retirada'>('pix');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // If cart is empty and not in confirmation, redirect to shop
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'confirmation') {
      navigate('/');
    }
  }, [cartItems, step, navigate]);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const taxaEntrega = cartItems.length > 0 && tipoEntrega === 'entrega' ? 12.00 : 0;
  const totalFinal = Math.max(0, subtotal + taxaEntrega - appliedDiscount);

  const pixKey = storeInfo?.pix_chave || "00020126580014BR.GOV.BCB.PIX0136cloudnine.doceria.pix@cloudnine.com520400005303986540510.005802BR5920Cloudnine Confeitaria6009Sao Paulo62070503***6304E21A";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleFinishCheckout = async () => {
    setFormError(null);
    if (!nomeCliente.trim() || !telefoneCliente.trim()) {
      setFormError('Por favor, preencha seu nome e telefone.');
      return;
    }
    if (tipoEntrega === 'entrega' && (!endereco.trim() || endereco.length < 10)) {
      setFormError('Por favor, forneça um endereço completo para entrega.');
      return;
    }
    if (metodoPagamento === 'pix' || metodoPagamento === 'cartao_credito' || metodoPagamento === 'cartao_debito') {
      try {
        setIsProcessingPayment(true);
        // Simulate API call for Mercado Pago
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Real implementation would redirect to Mercado Pago here if needed.
        // For now, we simulate success and move to confirmation
      } catch (error) {
        console.error('Payment Error:', error);
      } finally {
        setIsProcessingPayment(false);
      }
    }

    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      cliente_id: currentUser?.id || 'guest',
      cliente_nome: nomeCliente,
      cliente_telefone: telefoneCliente,
      total: totalFinal,
      status: metodoPagamento === 'pix' ? 'pendente_pix' as const : 'em_preparo' as const,
      metodo_pagamento: metodoPagamento,
      tipo_entrega: tipoEntrega,
      data_agendada: dataAgendada,
      horario_agendado: horarioAgendado,
      endereco_entreg: tipoEntrega === 'entrega' ? endereco : 'Retirada no Balcão Cloudnine',
      itens: cartItems.map((i, idx) => {
        const itemTitle = i.product?.nome || (i.customCake ? `Bolo Personalizado ${i.customCake.tamanho}` : 'Doce Especial');
        return {
          id: idx,
          nomeProduto: itemTitle,
          quantidade: i.quantity,
          preco_unitario: i.unitPrice,
          detalhesCustomizados: i.customNote || (i.customCake ? `${i.customCake.massa} + ${i.customCake.recheio1}` : undefined)
        };
      })
    };

    if (onPlaceOrder) {
      onPlaceOrder(newOrder);
    }
    setStep('confirmation');
  };

  if (cartItems.length === 0 && step !== 'confirmation') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-(--color-surface-container-lowest) animate-in fade-in pb-20">
      {/* Checkout Header */}
      <div className="sticky top-0 z-30 bg-(--color-surface-container-lowest)/90 backdrop-blur-md border-b border-(--color-outline-variant)/30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step === 'checkout' && (
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-(--color-surface-container-low) text-(--color-on-surface) transition-colors"
                aria-label="Voltar para a loja"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-(--color-on-surface)">
              {step === 'checkout' ? 'Finalizar Pedido' : 'Pedido Confirmado! 🎉'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Seção: Seus Dados */}
              <section className="bg-white dark:bg-(--color-surface-container-low) rounded-3xl p-6 shadow-sm border border-(--color-outline-variant)/20">
                <h2 className="text-lg font-extrabold mb-4 text-(--color-on-surface) flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-(--color-primary) text-white flex items-center justify-center text-xs">1</span>
                  Identificação
                </h2>
                {formError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nomeCliente" className="font-bold text-sm text-(--color-on-surface-variant) block mb-1.5">
                      Nome Completo
                    </label>
                    <input
                      id="nomeCliente"
                      type="text"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      placeholder="Ex: Mariana Silva"
                      className="w-full p-3.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/50 text-base focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefoneCliente" className="font-bold text-sm text-(--color-on-surface-variant) block mb-1.5">
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="telefoneCliente"
                      type="tel"
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full p-3.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/50 text-base focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                      aria-required="true"
                    />
                  </div>
                </div>
              </section>

              {/* Seção: Entrega */}
              <section className="bg-white dark:bg-(--color-surface-container-low) rounded-3xl p-6 shadow-sm border border-(--color-outline-variant)/20">
                <h2 className="text-lg font-extrabold mb-4 text-(--color-on-surface) flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-(--color-primary) text-white flex items-center justify-center text-xs">2</span>
                  Como deseja receber?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('entrega')}
                    className={`p-4 rounded-2xl border-2 font-bold text-base flex flex-col items-center justify-center gap-2 transition-all ${
                      tipoEntrega === 'entrega'
                        ? 'bg-(--color-primary-container) text-(--color-on-primary-container) border-(--color-primary)'
                        : 'bg-transparent text-(--color-on-surface-variant) border-(--color-outline-variant)/30 hover:border-(--color-primary)/50'
                    }`}
                  >
                    <Truck className="w-6 h-6" />
                    <span>Entrega (R$ 12,00)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('retirada')}
                    className={`p-4 rounded-2xl border-2 font-bold text-base flex flex-col items-center justify-center gap-2 transition-all ${
                      tipoEntrega === 'retirada'
                        ? 'bg-(--color-primary-container) text-(--color-on-primary-container) border-(--color-primary)'
                        : 'bg-transparent text-(--color-on-surface-variant) border-(--color-outline-variant)/30 hover:border-(--color-primary)/50'
                    }`}
                  >
                    <Store className="w-6 h-6" />
                    <span>Retirada Grátis</span>
                  </button>
                </div>

                {tipoEntrega === 'entrega' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="font-bold text-sm text-(--color-on-surface-variant) block mb-1.5">
                      Endereço de Entrega
                    </label>
                    <AddressLookupForm
                      initialCep={currentUser?.endereco_cep || ''}
                      initialLogradouro={currentUser?.endereco_rua || ''}
                      initialNumero={currentUser?.endereco_numero || ''}
                      initialBairro={currentUser?.endereco_bairro || ''}
                      initialCidade={currentUser?.endereco_cidade || ''}
                      initialUf={currentUser?.endereco_uf || ''}
                      initialComplemento={currentUser?.endereco_complemento || ''}
                      compact={true}
                      onAddressChange={(addr: AddressResult) => {
                        const formatted = addr.formattedAddress || `${addr.logradouro}, ${addr.numero || ''} - ${addr.bairro}, ${addr.cidade} - ${addr.uf} (CEP: ${addr.cep})`;
                        setEndereco(formatted);
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label htmlFor="dataAgendada" className="font-bold text-sm text-(--color-on-surface-variant) block mb-1.5">
                      Data
                    </label>
                    <input
                      id="dataAgendada"
                      type="date"
                      value={dataAgendada}
                      onChange={(e) => setDataAgendada(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/50 text-base focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                    />
                  </div>
                  <div>
                    <label htmlFor="horarioAgendado" className="font-bold text-sm text-(--color-on-surface-variant) block mb-1.5">
                      Horário
                    </label>
                    <select
                      id="horarioAgendado"
                      value={horarioAgendado}
                      onChange={(e) => setHorarioAgendado(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/50 text-base focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                    >
                      <option value="10:00 - 12:00">10:00 - 12:00</option>
                      <option value="14:00 - 16:00">14:00 - 16:00</option>
                      <option value="16:00 - 17:00">16:00 - 17:00</option>
                      <option value="18:00 - 19:30">18:00 - 19:30</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Seção: Pagamento */}
              <section className="bg-white dark:bg-(--color-surface-container-low) rounded-3xl p-6 shadow-sm border border-(--color-outline-variant)/20 mb-8">
                <h2 className="text-lg font-extrabold mb-4 text-(--color-on-surface) flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-(--color-primary) text-white flex items-center justify-center text-xs">3</span>
                  Pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('pix')}
                    className={`p-4 rounded-2xl border-2 font-bold text-base flex flex-col items-center justify-center gap-2 transition-all ${
                      metodoPagamento === 'pix'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-transparent text-(--color-on-surface-variant) border-(--color-outline-variant)/30 hover:border-emerald-500/50'
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                    <span>Pix (Rápido)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento('cartao_credito')}
                    className={`p-4 rounded-2xl border-2 font-bold text-base flex flex-col items-center justify-center gap-2 transition-all ${
                      metodoPagamento === 'cartao_credito'
                        ? 'bg-(--color-primary-container) text-(--color-on-primary-container) border-(--color-primary)'
                        : 'bg-transparent text-(--color-on-surface-variant) border-(--color-outline-variant)/30 hover:border-(--color-primary)/50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span>Cartão na Entrega</span>
                  </button>
                </div>

                {metodoPagamento === 'pix' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 block mb-2">
                      A chave Pix será gerada após a confirmação.
                    </span>
                    <QrCode className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto opacity-50" />
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white dark:bg-(--color-surface-container-low) rounded-3xl p-6 shadow-md border border-(--color-outline-variant)/20">
                <h3 className="text-xl font-black text-(--color-on-surface) mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-(--color-primary)" />
                  Resumo do Pedido
                </h3>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-(--color-on-surface) truncate">
                          {item.quantity}x {item.product?.nome || (item.customCake ? `Bolo ${item.customCake.tamanho}` : 'Doce')}
                        </h4>
                      </div>
                      <span className="font-extrabold text-sm text-(--color-primary) shrink-0">
                        R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-(--color-outline-variant)/30 pt-4 space-y-2 text-sm text-(--color-on-surface-variant)">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Entrega</span>
                    <span className="font-bold">{tipoEntrega === 'entrega' ? 'R$ 12,00' : 'Grátis'}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Desconto</span>
                      <span className="font-bold">- R$ {appliedDiscount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-(--color-outline-variant)/30 pt-4 mt-4 flex justify-between items-end">
                  <span className="font-bold text-base text-(--color-on-surface)">Total Final</span>
                  <span className="font-black text-2xl text-(--color-primary)">
                    R$ {totalFinal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={handleFinishCheckout}
                  disabled={isProcessingPayment}
                  className="w-full mt-6 py-4 rounded-full bg-(--color-primary) hover:bg-(--color-primary)/90 text-white font-black text-lg flex items-center justify-center space-x-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Confirmar Pedido e Pagar"
                >
                  {isProcessingPayment ? (
                    <>
                      <span>Processando...</span>
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Confirmar Pedido</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {step === 'confirmation' && (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <CheckCircle className="w-14 h-14" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-(--color-on-surface)">Pedido Confirmado!</h2>
              <p className="text-base text-(--color-on-surface-variant)">
                Nossos confeiteiros já receberam sua solicitação no painel da cozinha.
              </p>
            </div>

            {metodoPagamento === 'pix' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-(--color-surface-container-low) border-2 border-emerald-500/20 shadow-md">
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-4">
                  Escaneie o QR Code ou copie a chave Pix
                </h3>
                <div className="p-3 bg-white rounded-xl inline-block shadow-sm border border-neutral-100 mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixKey)}`}
                    alt="QR Code Pix"
                    className="w-40 h-40"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full max-w-sm mx-auto py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-sm transition-colors"
                >
                  {copiedPix ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
                </button>
              </div>
            )}

            <div className="p-6 rounded-3xl bg-white dark:bg-(--color-surface-container-low) shadow-sm border border-(--color-outline-variant)/20 text-left space-y-4">
              <h3 className="font-extrabold text-lg border-b border-(--color-outline-variant)/20 pb-2">Detalhes</h3>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--color-on-surface-variant)">Nome:</span>
                <span className="font-bold">{nomeCliente}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--color-on-surface-variant)">Agendamento:</span>
                <span className="font-bold">{dataAgendada} ({horarioAgendado})</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--color-on-surface-variant)">Entrega:</span>
                <span className="font-bold capitalize">{tipoEntrega}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-(--color-outline-variant)/20">
                <span className="text-(--color-on-surface-variant)">Total:</span>
                <span className="font-black text-(--color-primary) text-lg">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <a
                href={`https://wa.me/5511999990000?text=${encodeURIComponent(`Olá Cloudnine! Fiz o pedido no site no valor de R$ ${totalFinal.toFixed(2).replace('.', ',')}`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-4 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-base flex items-center justify-center space-x-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <Send className="w-5 h-5" />
                <span>Enviar Comprovante WhatsApp</span>
              </a>

              <button
                onClick={() => navigate('/')}
                className="py-4 px-6 rounded-full bg-(--color-surface-container-highest) hover:bg-(--color-surface-container-high) text-(--color-on-surface) font-bold text-base transition-colors w-full sm:w-auto"
              >
                Voltar à Loja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
