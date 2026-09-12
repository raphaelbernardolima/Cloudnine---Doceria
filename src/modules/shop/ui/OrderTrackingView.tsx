import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDataStore } from '@/src/core/store/useDataStore';
import { SEO } from '@/src/core/ui/shared/SEO';
import { ArrowLeft, CheckCircle, CookingPot, Clock, MapPin, Package, QrCode, Storefront, Truck, ChatCircle, WarningCircle, Star } from '@phosphor-icons/react';
import type { Order } from '@/src/core/types/index';
import { useOrderMutations } from '@/src/core/hooks/useOrderMutations';

export const OrderTrackingView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, storePhone } = useDataStore();
  const { handleSubmitReview } = useOrderMutations();
  const [order, setOrder] = useState<Order | undefined>(undefined);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const found = orders.find(o => String(o.id) === id);
    setOrder(found);
  }, [id, orders]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-[var(--color-on-surface-variant)] mb-4 opacity-50" />
        <h2 className="text-2xl font-black text-[var(--color-on-surface)] mb-2">Pedido não encontrado</h2>
        <p className="text-[var(--color-on-surface-variant)] mb-6 text-center">
          Não conseguimos localizar o pedido #{id}.
        </p>
        <Link 
          to="/"
          className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-2xl"
        >
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  // Definição das etapas
  const isEntrega = order.tipo_entrega === 'entrega';
  
  const steps = [
    {
      id: 'pendente_pix',
      title: 'Aguardando Pagamento',
      desc: 'Pedido recebido, aguardando confirmação do PIX.',
      icon: QrCode,
      color: 'bg-amber-500',
    },
    {
      id: 'em_preparo',
      title: 'Na Cozinha',
      desc: 'Nossos confeiteiros estão preparando seu pedido.',
      icon: CookingPot,
      color: 'bg-orange-500',
    },
    {
      id: isEntrega ? 'saiu_entrega' : 'pronto_retirada',
      title: isEntrega ? 'Saiu para Entrega' : 'Pronto para Retirada',
      desc: isEntrega ? 'O entregador está a caminho do seu endereço.' : 'Seu pedido está prontinho te esperando no balcão.',
      icon: isEntrega ? Truck : Storefront,
      color: 'bg-blue-500',
    },
    {
      id: 'entregue',
      title: isEntrega ? 'Pedido Entregue' : 'Pedido Retirado',
      desc: 'Esperamos que você tenha uma doce experiência!',
      icon: CheckCircle,
      color: 'bg-emerald-500',
    }
  ];

  // Identifica o índice do status atual (pulando o pendente_pix se for cartão/dinheiro e estiver em_preparo)
  let currentStepIndex = steps.findIndex(s => s.id === order.status);
  
  // Se for cartão/dinheiro, o pedido pula o status pendente_pix e vai direto pra em_preparo
  if (order.status === 'em_preparo' && order.metodo_pagamento !== 'pix') {
    currentStepIndex = 1;
  }

  if (order.status === 'cancelado') {
    currentStepIndex = -1;
  }

  const handleWhatsApp = () => {
    const unmaskedPhone = storePhone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Queria falar sobre o meu pedido #${order.id}.`);
    window.open(`https://wa.me/55${unmaskedPhone}?text=${msg}`, '_blank');
  };

  const onReviewSubmit = async () => {
    if (rating === 0) return;
    setIsSubmittingReview(true);
    await handleSubmitReview(order.id, rating, reviewComment);
    setIsSubmittingReview(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20">
      <SEO title={`Acompanhar Pedido #${order.id}`} />
      
      {/* Header */}
      <div className="bg-[var(--color-surface-container-lowest)] sticky top-0 z-30 shadow-xs border-b border-[var(--color-outline-variant)]/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--color-on-surface)]" />
            </button>
            <div>
              <p className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Acompanhar Pedido</p>
              <h1 className="text-lg font-black text-[var(--color-on-surface)]">
                #{order.id}
              </h1>
            </div>
          </div>
          <button 
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-200 transition-colors"
          >
            <ChatCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Ajuda</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Warning se Cancelado */}
        {order.status === 'cancelado' && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
            <WarningCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-800">Pedido Cancelado</h3>
              <p className="text-sm text-rose-700 mt-1">
                Este pedido foi cancelado. Se você já havia feito o pagamento via PIX, o estorno será realizado em até 24h. Dúvidas? Chame no WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Informações Resumidas */}
        <div className="bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] font-medium mb-1">Previsão</p>
              <p className="font-bold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                {order.data_agendada && order.horario_agendado 
                  ? `${new Date(order.data_agendada).toLocaleDateString('pt-BR')} às ${order.horario_agendado}`
                  : 'Aprox. 45 min'}
              </p>
            </div>
            
            <div className="h-px w-full sm:h-12 sm:w-px bg-[var(--color-outline-variant)]/30"></div>
            
            <div className="flex-1">
              <p className="text-sm text-[var(--color-on-surface-variant)] font-medium mb-1">
                {isEntrega ? 'Endereço de Entrega' : 'Local de Retirada'}
              </p>
              <p className="font-bold text-sm flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                <span className="leading-tight">
                  {order.endereco_entreg}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        {order.status !== 'cancelado' && (
          <div className="bg-[var(--color-surface-container-lowest)] p-6 sm:p-8 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm relative">
            <div className="absolute top-0 bottom-0 left-[41px] sm:left-[51px] w-0.5 bg-[var(--color-outline-variant)]/20 z-0"></div>

            <div className="space-y-8 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;
                const isFuture = currentStepIndex < index;
                const Icon = step.icon;

                // Se o método não for pix e for o step 'pendente_pix', marcamos como completo escondido ou pulamos?
                // Visualmente, vamos deixar completado mas com opacidade menor.
                const isSkippedPix = step.id === 'pendente_pix' && order.metodo_pagamento !== 'pix';

                return (
                  <div key={step.id} className={`flex items-start gap-4 sm:gap-6 ${isFuture ? 'opacity-40' : ''}`}>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-[var(--color-surface-container-lowest)] transition-colors duration-500
                      ${isCompleted ? step.color : 'bg-[var(--color-surface-container-high)]'} 
                      ${isCurrent ? 'ring-4 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-surface-container-lowest)] animate-pulse' : ''}
                    `}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isCompleted ? 'text-white' : 'text-[var(--color-on-surface-variant)]'}`} />
                    </div>
                    
                    <div className="pt-1.5 sm:pt-2">
                      <h4 className={`font-black text-lg ${isCurrent ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                        {step.title}
                        {isSkippedPix && ' (Não aplicável)'}
                      </h4>
                      <p className={`text-sm mt-1 leading-relaxed ${isCurrent ? 'text-[var(--color-on-surface-variant)]' : 'text-[var(--color-on-surface-variant)]/70'}`}>
                        {step.desc}
                      </p>
                      
                      {isCurrent && step.id === 'pendente_pix' && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                          <p className="text-sm text-amber-800 font-bold mb-2">Chave PIX para pagamento:</p>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              readOnly 
                              value="00020126580014BR.GOV.BCB.PIX..." 
                              className="flex-1 p-2 bg-white rounded-lg text-xs border border-amber-200"
                            />
                            <button className="px-3 py-2 bg-amber-500 text-white font-bold text-xs rounded-lg whitespace-nowrap">
                              Copiar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resumo dos Itens */}
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm">
          <h3 className="font-bold text-[var(--color-on-surface)] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--color-primary)]" />
            Itens do Pedido
          </h3>
          
          <div className="space-y-3">
            {order.itens.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-[var(--color-outline-variant)]/10 last:border-0">
                <div className="flex-1">
                  <p className="font-bold text-sm text-[var(--color-on-surface)]">
                    {item.quantidade}x {item.nomeProduto}
                  </p>
                  {item.detalhesCustomizados && (
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 italic">
                      {item.detalhesCustomizados}
                    </p>
                  )}
                </div>
                <p className="font-bold text-sm text-[var(--color-on-surface-variant)]">
                  {(item.preco_unitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/20 flex justify-between items-center">
            <span className="font-medium text-[var(--color-on-surface-variant)]">Total pago</span>
            <span className="text-xl font-black text-[var(--color-primary)]">
              {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        {/* Avaliação do Pedido */}
        {order.status === 'entregue' && !order.avaliacao && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-3xl border border-amber-200/50 dark:border-amber-700/30 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="font-black text-lg text-amber-900 dark:text-amber-400 mb-1">Como foi sua experiência?</h3>
              <p className="text-sm text-amber-700/80 dark:text-amber-500/80">
                Sua opinião nos ajuda a criar doces cada vez mais perfeitos.
              </p>
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    weight={(hoverRating || rating) >= star ? "fill" : "regular"}
                    className={`w-10 h-10 ${(hoverRating || rating) >= star ? "text-amber-500" : "text-amber-300 dark:text-amber-800"}`} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="O que achou dos nossos doces? (Opcional)"
              className="w-full p-3 rounded-2xl bg-white/60 dark:bg-black/20 border border-amber-200 dark:border-amber-900/50 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none h-24 mb-4"
            />

            <button
              onClick={onReviewSubmit}
              disabled={rating === 0 || isSubmittingReview}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        )}
        
        {order.status === 'entregue' && order.avaliacao && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-700/30 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" weight="fill" />
            </div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-1">Obrigado pela sua avaliação!</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-500">
              Você deu {order.avaliacao.rating} estrelas para este pedido.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
