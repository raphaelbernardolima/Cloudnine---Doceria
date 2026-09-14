import React, { useState, useMemo } from 'react';
import { Order, Product, OrderItem } from '@/src/core/types/index';
import {
  Printer, CaretRight, Check, X, Clock,
  Tote, Truck, Storefront, Plus, WhatsappLogo,
  Receipt, Money, Info, User, Tag, MapPin
} from '@phosphor-icons/react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { toast } from 'sonner';

interface AdminOrdersModuleProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: number | string, newStatus: Order['status']) => void;
  onPrintOrder: (order: Order) => void;
}

const KANBAN_COLUMNS = [
  {
    id: 'pendente',
    title: 'Pendentes / PIX',
    emoji: '🟡',
    statusList: ['pendente_pix'],
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
    borderClass: 'border-amber-200 dark:border-amber-800/40',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    id: 'preparo',
    title: 'Na Cozinha',
    emoji: '🔵',
    statusList: ['em_preparo'],
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
    borderClass: 'border-blue-200 dark:border-blue-800/40',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    id: 'pronto',
    title: 'Pronto / Rota',
    emoji: '🟣',
    statusList: ['pronto_retirada', 'saiu_entrega'],
    bgClass: 'bg-purple-50 dark:bg-purple-950/20',
    borderClass: 'border-purple-200 dark:border-purple-800/40',
    dotClass: 'bg-purple-500',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    id: 'concluido',
    title: 'Finalizados',
    emoji: '🟢',
    statusList: ['entregue'],
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderClass: 'border-emerald-200 dark:border-emerald-800/40',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

export const AdminOrdersModule: React.FC<AdminOrdersModuleProps> = ({
  orders,
  onUpdateOrderStatus,
  onPrintOrder,
}) => {
  const { products } = useDataStore();
  const [activeMobileTab, setActiveMobileTab] = useState('pendente');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelingOrder, setCancelingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // PDV States
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [pdvClientName, setPdvClientName] = useState('');
  const [pdvClientPhone, setPdvClientPhone] = useState('');
  const [pdvType, setPdvType] = useState<'retirada'|'entrega'>('retirada');
  const [pdvCart, setPdvCart] = useState<{product: Product, qty: number}[]>([]);

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleConfirmCancel = () => {
    if (!cancelingOrder || !cancelReason.trim()) return;
    onUpdateOrderStatus(cancelingOrder.id, 'cancelado');
    // Log the reason somewhere if needed (AuditLog)
    toast.success(`Pedido #${cancelingOrder.id} cancelado: ${cancelReason}`);
    setCancelingOrder(null);
    setCancelReason('');
    setSelectedOrder(null);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdvCart.length === 0) {
      toast.error('Adicione ao menos um produto no pedido!');
      return;
    }
    
    // Create a mocked manual order logic.
    // In a real app, you'd call an API. Here we just show a toast to simulate it.
    toast.success('Pedido manual criado com sucesso! (Simulado)');
    setIsCreatingOrder(false);
    setPdvCart([]);
    setPdvClientName('');
    setPdvClientPhone('');
  };

  const openWhatsApp = (phone: string, name: string, orderId: string | number) => {
    const text = `Olá ${name}, sobre o seu pedido #${orderId} na Cloudnine Doceria...`;
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderActionButton = (order: Order) => {
    switch (order.status) {
      case 'pendente_pix':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateOrderStatus(order.id, 'em_preparo'); }}
            className="flex-1 py-2 px-3 bg-amber-500 active:bg-amber-600 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Aprovar PIX</span>
            <Check weight="bold" className="w-3.5 h-3.5 shrink-0" />
          </button>
        );
      case 'em_preparo':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateOrderStatus(order.id, order.tipo_entrega === 'retirada' ? 'pronto_retirada' : 'saiu_entrega');
            }}
            className="flex-1 py-2 px-3 bg-blue-500 active:bg-blue-600 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Finalizar</span>
            <CaretRight weight="bold" className="w-3.5 h-3.5 shrink-0" />
          </button>
        );
      case 'pronto_retirada':
      case 'saiu_entrega':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateOrderStatus(order.id, 'entregue'); }}
            className="flex-1 py-2 px-3 bg-purple-500 active:bg-purple-600 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Concluir</span>
            <Check weight="bold" className="w-3.5 h-3.5 shrink-0" />
          </button>
        );
      default:
        return null;
    }
  };

  const OrderCard = ({ order, colId }: { order: Order; colId: string }) => (
    <div 
      onClick={() => setSelectedOrder(order)}
      className="relative group bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-[var(--color-primary)]/50"
    >
      {/* Cancel button */}
      {['pendente_pix', 'em_preparo'].includes(order.status) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCancelingOrder(order);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow z-10 hover:bg-rose-200"
          title="Cancelar Pedido"
        >
          <X weight="bold" className="w-3 h-3" />
        </button>
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="text-[10px] font-extrabold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-md leading-none">
              #{order.id}
            </span>
            <span className="text-[10px] text-[var(--color-on-surface-variant)] flex items-center gap-0.5 leading-none">
              <Clock className="w-3 h-3 shrink-0" />
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h5 className="font-bold text-sm text-[var(--color-on-surface)] leading-tight truncate max-w-[140px]">
            {order.cliente_nome}
          </h5>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] px-1.5 py-1 rounded-lg shrink-0">
          {order.tipo_entrega === 'entrega' ? <Truck className="w-3 h-3 text-blue-500 shrink-0" /> : <Storefront className="w-3 h-3 text-emerald-500 shrink-0" />}
          <span className="capitalize">{order.tipo_entrega}</span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-[var(--color-surface-container-lowest)] p-2 rounded-xl mb-3">
        <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
          {order.itens.map((i) => `${i.quantidade}x ${i.nomeProduto || 'Item'}`).join(', ')}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-outline-variant)]/20">
        {renderActionButton(order)}
        <button
          onClick={(e) => { e.stopPropagation(); onPrintOrder(order); }}
          className="p-2 bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] rounded-xl transition-colors shrink-0 shadow-sm"
          title="Imprimir Comanda"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const totalPending = orders.filter((o) => KANBAN_COLUMNS[0].statusList.includes(o.status)).length;

  return (
    <div className="flex flex-col w-full min-w-0 space-y-5 animate-in fade-in">
      
      {/* ── Page Header & Controls ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20">
        <div>
          <h3 className="text-2xl font-black text-[var(--color-on-surface)] flex items-center gap-2">
            Gestão Gerencial de Pedidos
          </h3>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
            Controle financeiro, auditoria e atendimento ao cliente.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-xl text-xs font-bold shrink-0 animate-pulse">
              <Money className="w-5 h-5 shrink-0" />
              <span>{totalPending} PIX Pendentes</span>
            </div>
          )}
          <button 
            onClick={() => setIsCreatingOrder(true)}
            className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" weight="bold" /> Novo Pedido (PDV)
          </button>
        </div>
      </div>

      {/* ── MOBILE: Tab pill selector ─────────────────────────── */}
      <div className="sm:hidden w-full overflow-x-auto">
        <div className="flex gap-2 pb-1 min-w-max px-0.5">
          {KANBAN_COLUMNS.map((col) => {
            const count = orders.filter((o) => col.statusList.includes(o.status)).length;
            const isActive = activeMobileTab === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setActiveMobileTab(col.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm' : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
                }`}
              >
                <span>{col.emoji}</span>
                <span>{col.title}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KANBAN BOARD (Mobile & Desktop) ────────────────────── */}
      <div className="sm:hidden w-full min-w-0">
        {KANBAN_COLUMNS.map((col) => {
          if (col.id !== activeMobileTab) return null;
          const colOrders = orders.filter((o) => col.statusList.includes(o.status)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return (
            <div key={col.id} className={`w-full rounded-3xl border ${col.borderClass} ${col.bgClass} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-[var(--color-surface-container-lowest)]/60 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`} />
                  <h4 className="font-bold text-sm text-[var(--color-on-surface)]">{col.title}</h4>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${col.badgeClass}`}>{colOrders.length}</span>
              </div>
              <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl gap-1">
                    <span className="text-xl opacity-30">📭</span>
                    <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">Nenhum pedido aqui</span>
                  </div>
                ) : (
                  colOrders.map((order) => <OrderCard key={order.id} order={order} colId={col.id} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:grid sm:grid-cols-4 gap-4 pb-6">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => col.statusList.includes(o.status)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return (
            <div key={col.id} className={`flex flex-col rounded-3xl border ${col.borderClass} ${col.bgClass} overflow-hidden`} style={{ maxHeight: '70vh' }}>
              <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-[var(--color-surface-container-lowest)]/60 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`} />
                  <h4 className="font-bold text-sm text-[var(--color-on-surface)]">{col.title}</h4>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${col.badgeClass}`}>{colOrders.length}</span>
              </div>
              <div className="p-3 overflow-y-auto flex-1 space-y-3">
                {colOrders.length === 0 ? (
                  <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl gap-1">
                    <span className="text-xl opacity-30">📭</span>
                    <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">Nenhum pedido</span>
                  </div>
                ) : (
                  colOrders.map((order) => <OrderCard key={order.id} order={order} colId={col.id} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      
      {/* 1. Modal Detalhes do Pedido (Visão 360) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-outline-variant)]/30 flex justify-between items-center sticky top-0 bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-on-surface)] flex items-center gap-2">
                  Pedido #{selectedOrder.id}
                  <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg uppercase tracking-wider">{selectedOrder.status.replace('_', ' ')}</span>
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" /> {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-colors">
                <X className="w-6 h-6 text-[var(--color-on-surface)]" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Col 1: Cliente e Endereço */}
              <div className="space-y-4">
                <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/20">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-outline)] flex items-center gap-1.5 mb-3">
                    <User className="w-4 h-4" /> Dados do Cliente
                  </h4>
                  <p className="font-black text-lg text-[var(--color-on-surface)]">{selectedOrder.cliente_nome}</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">{selectedOrder.cliente_telefone || 'Sem telefone'}</p>
                  
                  {selectedOrder.cliente_telefone && (
                    <button 
                      onClick={() => openWhatsApp(selectedOrder.cliente_telefone, selectedOrder.cliente_nome, selectedOrder.id)}
                      className="mt-3 w-full py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <WhatsappLogo className="w-5 h-5" weight="fill" /> Contatar Cliente
                    </button>
                  )}
                </div>

                <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/20">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-outline)] flex items-center gap-1.5 mb-3">
                    <MapPin className="w-4 h-4" /> Entrega / Retirada
                  </h4>
                  <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-2">
                    {selectedOrder.tipo_entrega === 'entrega' ? <Truck className="w-5 h-5" /> : <Storefront className="w-5 h-5" />}
                    <span className="uppercase">{selectedOrder.tipo_entrega}</span>
                  </div>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    {typeof selectedOrder.endereco === 'object' 
                      ? `${selectedOrder.endereco?.rua || ''}, ${selectedOrder.endereco?.numero || ''} - ${selectedOrder.endereco?.bairro || ''}` 
                      : (selectedOrder.endereco_entreg || 'Retirada na Loja')}
                  </p>
                </div>
              </div>

              {/* Col 2: Resumo e Financeiro */}
              <div className="space-y-4">
                <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/20">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-outline)] flex items-center gap-1.5 mb-3">
                    <Receipt className="w-4 h-4" /> Resumo do Pedido
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {selectedOrder.itens.map((i, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-[var(--color-on-surface)]"><span className="font-bold text-[var(--color-primary)]">{i.quantidade}x</span> {i.nomeProduto || i.nome}</span>
                        <span className="font-bold text-[var(--color-on-surface-variant)]">{formatCurrency(i.preco_unitario * i.quantidade)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-[var(--color-outline-variant)]/20 flex justify-between items-center">
                    <span className="font-black text-sm text-[var(--color-on-surface)]">TOTAL:</span>
                    <span className="font-black text-xl text-[var(--color-primary)]">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-neutral-500 flex justify-between">
                    <span>Pagamento:</span>
                    <span className="uppercase">{selectedOrder.metodo_pagamento.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Ações do Gerente */}
                <div className="flex flex-col gap-2">
                  {selectedOrder.status === 'pendente_pix' && (
                    <button 
                      onClick={() => { onUpdateOrderStatus(selectedOrder.id, 'em_preparo'); setSelectedOrder(null); }}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Money className="w-5 h-5" /> Confirmar Pagamento PIX
                    </button>
                  )}
                  {['pendente_pix', 'em_preparo'].includes(selectedOrder.status) && (
                    <button 
                      onClick={() => setCancelingOrder(selectedOrder)}
                      className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-rose-200"
                    >
                      <X className="w-5 h-5" weight="bold" /> Cancelar Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Cancelamento com Motivo */}
      {cancelingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl shadow-2xl w-full max-w-sm p-6 border-t-4 border-rose-500">
            <h3 className="text-xl font-black text-[var(--color-on-surface)] mb-2">Cancelar Pedido #{cancelingOrder.id}?</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">Esta ação é irreversível. Por favor, informe o motivo do cancelamento para auditoria.</p>
            
            <select 
              value={cancelReason} 
              onChange={e => setCancelReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--color-surface-container-high)] text-sm font-bold border border-[var(--color-outline-variant)]/30 mb-6 outline-none focus:border-rose-500"
            >
              <option value="">Selecione o motivo...</option>
              <option value="Cliente desistiu">Cliente desistiu</option>
              <option value="Falta de insumos">Falta de insumos/produtos</option>
              <option value="Pagamento não efetuado (PIX)">Pagamento não efetuado (PIX)</option>
              <option value="Trote / Fraude">Trote / Fraude</option>
              <option value="Outro">Outro (Erro operacional)</option>
            </select>

            <div className="flex gap-3">
              <button onClick={() => {setCancelingOrder(null); setCancelReason('');}} className="flex-1 py-2.5 rounded-xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] font-bold text-sm text-[var(--color-on-surface)]">Voltar</button>
              <button 
                onClick={handleConfirmCancel} 
                disabled={!cancelReason}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-rose-500/20"
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Novo Pedido Manual (PDV) */}
      {isCreatingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreatingOrder(false)}>
          <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-outline-variant)]/30 flex justify-between items-center bg-[var(--color-surface-container-lowest)] rounded-t-3xl">
              <div>
                <h2 className="text-xl font-black text-[var(--color-on-surface)] flex items-center gap-2">
                  <Storefront className="w-6 h-6 text-[var(--color-primary)]" />
                  Frente de Caixa (PDV)
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)]">Crie um pedido manual rápido.</p>
              </div>
              <button onClick={() => setIsCreatingOrder(false)} className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full">
                <X className="w-6 h-6 text-[var(--color-on-surface)]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-surface-container-low)]/20">
              {/* Produtos */}
              <div>
                <h4 className="font-bold text-sm text-[var(--color-outline)] mb-3 uppercase tracking-wider">Produtos</h4>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                  {products.filter(p => p.ativo).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 rounded-xl">
                      <div>
                        <p className="font-bold text-sm text-[var(--color-on-surface)]">{p.nome}</p>
                        <p className="font-black text-xs text-[var(--color-primary)]">{formatCurrency(p.preco)}</p>
                      </div>
                      <button 
                        onClick={() => setPdvCart([...pdvCart, {product: p, qty: 1}])}
                        className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)]/20"
                      >
                        <Plus className="w-4 h-4" weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrinho e Checkout */}
              <div className="flex flex-col">
                <h4 className="font-bold text-sm text-[var(--color-outline)] mb-3 uppercase tracking-wider">Resumo e Cliente</h4>
                
                <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/20 flex-1 flex flex-col">
                  {pdvCart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                      <Tote className="w-10 h-10 mb-2" />
                      <p className="text-xs font-bold">Carrinho vazio</p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {pdvCart.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.qty}x {item.product.nome}</span>
                          <span className="font-bold">{formatCurrency(item.product.preco * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/20 space-y-3">
                    <input type="text" placeholder="Nome do Cliente (Opcional)" value={pdvClientName} onChange={e=>setPdvClientName(e.target.value)} className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-sm border border-[var(--color-outline-variant)]/30 outline-none focus:border-[var(--color-primary)]" />
                    <input type="text" placeholder="Telefone (Opcional)" value={pdvClientPhone} onChange={e=>setPdvClientPhone(e.target.value)} className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-sm border border-[var(--color-outline-variant)]/30 outline-none focus:border-[var(--color-primary)]" />
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="font-black text-sm">TOTAL:</span>
                      <span className="font-black text-xl text-[var(--color-primary)]">
                        {formatCurrency(pdvCart.reduce((sum, i) => sum + (i.product.preco * i.qty), 0))}
                      </span>
                    </div>

                    <button 
                      onClick={handleCreateManualOrder}
                      className="w-full py-3 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] rounded-xl font-black text-sm shadow-md"
                    >
                      Lançar Pedido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
