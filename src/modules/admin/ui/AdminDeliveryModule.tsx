import React, { useState } from 'react';
import { Truck, MapPin, DollarSign, CheckCircle2, ChevronDown } from 'lucide-react';
import { Order, Driver } from '@/src/core/types/index';

interface AdminDeliveryModuleProps {
  orders: Order[];
  drivers: Driver[];
  onAssignDriver: (orderId: string | number, driverId: string) => void;
  onUpdateOrderStatus: (orderId: string | number, status: Order['status']) => void;
}

export const AdminDeliveryModule: React.FC<AdminDeliveryModuleProps> = ({ orders, drivers, onAssignDriver, onUpdateOrderStatus }) => {
  const deliveryOrders = orders.filter(o => o.tipo_entrega === 'entrega' && (o.status === 'pronto_retirada' || o.status === 'saiu_entrega'));

  return (
    <div className="space-y-6">
      <div className="p-4 bg-(--color-surface-container-lowest) rounded-3xl border border-(--color-outline-variant)/30 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs">
        <div>
          <h3 className="font-bold text-lg text-(--color-on-surface) flex items-center gap-2">
            <Truck className="w-5 h-5 text-(--color-primary)" />
            Despacho & Logística
          </h3>
          <p className="text-xs text-(--color-outline)">Controle de motoboys e rotas de entrega</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Orders Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-sm text-(--color-on-surface)">Fila de Despacho</h4>
          {deliveryOrders.map(o => {
            const driver = drivers.find(d => d.id === o.entregador_id);
            return (
              <div key={o.id} className="p-4 bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40 rounded-3xl shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-sm block">Pedido #{o.id} - {o.cliente_nome}</span>
                    <span className="text-xs text-(--color-outline) flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {o.endereco_entreg}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-sm font-bold uppercase tracking-wider ${o.status === 'saiu_entrega' ? 'bg-blue-500/20 text-blue-600' : 'bg-emerald-500/20 text-emerald-600'}`}>
                    {o.status === 'saiu_entrega' ? 'Em Rota' : 'Aguardando Coleta'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-(--color-outline-variant)/20">
                  <select
                    value={o.entregador_id || ''}
                    onChange={e => onAssignDriver(o.id, e.target.value)}
                    className="p-2 bg-(--color-surface-container) rounded-xl text-xs font-bold border border-transparent hover:border-(--color-primary)/50 transition-colors flex-1"
                  >
                    <option value="">Atribuir Motoboy...</option>
                    {drivers.filter(d => d.status !== 'indisponivel').map(d => (
                      <option key={d.id} value={d.id}>{d.nome} (R$ {d.taxaPorEntrega.toFixed(2)})</option>
                    ))}
                  </select>

                  {o.entregador_id && o.status !== 'saiu_entrega' && (
                    <button
                      onClick={() => onUpdateOrderStatus(o.id, 'saiu_entrega')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors"
                    >
                      Despachar
                    </button>
                  )}
                  {o.entregador_id && o.status === 'saiu_entrega' && (
                    <button
                      onClick={() => onUpdateOrderStatus(o.id, 'entregue')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Concluir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {deliveryOrders.length === 0 && (
            <div className="p-8 text-center text-(--color-outline) font-bold italic border border-dashed border-(--color-outline-variant)/50 rounded-3xl">
              Nenhum pedido aguardando despacho.
            </div>
          )}
        </div>

        {/* Drivers Status */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-(--color-on-surface)">Acerto de Entregadores</h4>
          <div className="space-y-3">
            {drivers.map(d => (
              <div key={d.id} className="p-4 bg-(--color-surface-container-lowest) rounded-3xl border border-(--color-outline-variant)/30 shadow-xs flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{d.nome}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${d.status === 'disponivel' ? 'bg-emerald-500' : d.status === 'em_entrega' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                </div>
                <div className="flex justify-between text-xs text-(--color-outline)">
                  <span>{d.pedidosEntregues} entregas hj</span>
                  <span className="font-black text-emerald-600 flex items-center gap-0.5"><DollarSign className="w-3 h-3" /> {d.totalGanhos.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
