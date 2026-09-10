import React, { useState } from 'react';
import { Order } from '@/src/core/types/index';
import { Printer, CaretRight, Check, X, Clock, Tote, Truck, Storefront } from '@phosphor-icons/react';
import { Box } from '@mui/material';

interface AdminOrdersModuleProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: number | string, newStatus: Order['status']) => void;
  onPrintOrder: (order: Order) => void;
}

export const AdminOrdersModule: React.FC<AdminOrdersModuleProps> = ({
  orders,
  onUpdateOrderStatus,
  onPrintOrder
}) => {
  // Configuração das colunas do Kanban
  const kanbanColumns = [
    { id: 'pendente', title: 'Novos / Pendentes', statusList: ['pendente_pix'], color: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/20', borderColor: 'border-amber-200 dark:border-amber-900/50' },
    { id: 'preparo', title: 'Na Cozinha', statusList: ['em_preparo'], color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950/20', borderColor: 'border-blue-200 dark:border-blue-900/50' },
    { id: 'pronto', title: 'Pronto / Em Rota', statusList: ['pronto_retirada', 'saiu_entrega'], color: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950/20', borderColor: 'border-purple-200 dark:border-purple-900/50' },
    { id: 'concluido', title: 'Finalizados', statusList: ['entregue'], color: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/20', borderColor: 'border-emerald-200 dark:border-emerald-900/50' }
  ];

  // Helper function to render action button based on current status
  const renderActionButton = (order: Order) => {
    switch (order.status) {
      case 'pendente_pix':
        return (
          <button 
            onClick={() => onUpdateOrderStatus(order.id, 'em_preparo')}
            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1"
          >
            <span>Preparar</span>
            <CaretRight className="w-4 h-4" />
          </button>
        );
      case 'em_preparo':
        return (
          <button 
            onClick={() => onUpdateOrderStatus(order.id, order.tipo_entrega === 'retirada' ? 'pronto_retirada' : 'saiu_entrega')}
            className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1"
          >
            <span>Finalizar Produção</span>
            <CaretRight className="w-4 h-4" />
          </button>
        );
      case 'pronto_retirada':
      case 'saiu_entrega':
        return (
          <button 
            onClick={() => onUpdateOrderStatus(order.id, 'entregue')}
            className="flex-1 py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1"
          >
            <span>Concluir Entrega</span>
            <Check className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  const [activeMobileTab, setActiveMobileTab] = useState('pendente');

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-2xl text-[var(--color-on-surface)]" style={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic' }}>
            Quadro de Pedidos
          </h3>
          <p className="text-sm text-[var(--color-on-surface-variant)]">Acompanhe e mova os pedidos visualmente no fluxo de produção.</p>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="sm:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar w-full max-w-[100vw]">
        {kanbanColumns.map(col => (
          <button
            key={col.id}
            onClick={() => setActiveMobileTab(col.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeMobileTab === col.id 
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm' 
                : 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
            }`}
          >
            {col.title}
          </button>
        ))}
      </div>

      {/* Board Container - Single column on mobile, Grid on desktop */}
      <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4 pb-4 min-h-[60vh]">
        
        {kanbanColumns.map(col => {
          const colOrders = orders.filter(o => col.statusList.includes(o.status)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          return (
            <div 
              key={col.id} 
              className={`${activeMobileTab === col.id ? 'flex' : 'hidden sm:flex'} flex-col w-full sm:flex-none sm:w-auto rounded-3xl border ${col.borderColor} ${col.bgLight} overflow-hidden h-full max-h-[75vh]`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-[var(--color-surface-container-lowest)]/50 dark:bg-black/20 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${col.color} shadow-sm`} />
                  <h4 className="font-bold text-[var(--color-on-surface)]">{col.title}</h4>
                </div>
                <span className="text-xs font-black px-2 py-1 bg-[var(--color-surface)] rounded-full text-[var(--color-on-surface)] shadow-sm">
                  {colOrders.length}
                </span>
              </div>
              
              {/* Column Body - Scrollable */}
              <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                {colOrders.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl">
                    <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">Nenhum pedido</span>
                  </div>
                ) : (
                  colOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative group"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-1.5 mb-1">
                            <span className="text-[10px] font-extrabold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-md">
                              #{order.id}
                            </span>
                            <span className="text-[10px] text-[var(--color-on-surface-variant)] flex items-center">
                              <Clock className="w-3 h-3 mr-0.5" />
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-[var(--color-on-surface)] leading-tight">{order.cliente_nome}</h5>
                        </div>
                        
                        <div className="flex items-center text-[10px] font-bold text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] px-1.5 py-1 rounded-lg">
                          {order.tipo_entrega === 'entrega' ? <Truck className="w-3 h-3 mr-1 text-blue-500" /> : <Storefront className="w-3 h-3 mr-1 text-emerald-500" />}
                          <span className="capitalize">{order.tipo_entrega}</span>
                        </div>
                      </div>

                      {/* Card Items summary */}
                      <div className="bg-[var(--color-surface-container-lowest)] p-2 rounded-xl mb-3">
                        <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
                          {order.itens.map(i => `${i.quantidade}x ${i.nomeProduto || 'Item'}`).join(', ')}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-outline-variant)]/20">
                        {renderActionButton(order)}
                        
                        <button
                          onClick={() => onPrintOrder(order)}
                          className="p-2 bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] rounded-xl transition-colors shrink-0 shadow-sm"
                          title="Imprimir Comanda"
                          aria-label="Imprimir Comanda"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Quick Cancel button (only in first column) */}
                      {col.id === 'pendente' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) {
                              onUpdateOrderStatus(order.id, 'cancelado');
                            }
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-200"
                          title="Cancelar Pedido"
                          aria-label="Cancelar Pedido"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
