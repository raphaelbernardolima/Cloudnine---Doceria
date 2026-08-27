import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Package, ChevronLeft, ChevronRight, X, Phone, User } from 'lucide-react';
import { Order } from '@/src/core/types/index';

interface AdminCalendarModuleProps {
  orders: Order[];
}

export const AdminCalendarModule: React.FC<AdminCalendarModuleProps> = ({ orders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayOrders, setSelectedDayOrders] = useState<{ day: number; orders: Order[] } | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getOrdersForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return orders.filter(o => o.data_agendada === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs gap-3">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[var(--color-primary)]" />
          Calendário de Encomendas
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 bg-[var(--color-surface-container)] rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-black text-sm sm:text-base text-[var(--color-on-surface)] w-36 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 bg-[var(--color-surface-container)] rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center font-bold text-[10px] sm:text-xs text-[var(--color-outline)] p-1.5 uppercase">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 rounded-2xl bg-[var(--color-surface-container-lowest)]/30 border border-transparent"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayOrders = getOrdersForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

          return (
            <div 
              key={day} 
              onClick={() => dayOrders.length > 0 && setSelectedDayOrders({ day, orders: dayOrders })}
              className={`p-1.5 sm:p-3 rounded-2xl border flex flex-col min-h-[72px] sm:min-h-[110px] transition-all cursor-pointer ${
                isToday 
                  ? 'bg-[var(--color-primary-container)]/70 border-[var(--color-primary)] shadow-sm' 
                  : dayOrders.length > 0 
                  ? 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary)]' 
                  : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-black text-xs sm:text-sm ${isToday ? 'text-[var(--color-on-primary-container)]' : 'text-[var(--color-on-surface)]'}`}>{day}</span>
                {dayOrders.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    {dayOrders.length}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {dayOrders.slice(0, 2).map(order => (
                  <div key={order.id} className="bg-[var(--color-surface)] p-1 rounded-md border border-[var(--color-outline-variant)]/30 shadow-2xs hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      <span className="text-[10px] font-bold truncate text-[var(--color-on-surface)]">{order.horario_agendado || '12:00'} - {order.cliente_nome}</span>
                    </div>
                  </div>
                ))}
                {dayOrders.length > 2 && (
                  <span className="text-[10px] font-bold text-[var(--color-outline)] text-center hidden sm:block">+{dayOrders.length - 2} mais</span>
                )}
                {dayOrders.length > 0 && (
                  <div className="sm:hidden mt-auto pt-1 text-center">
                    <span className="text-[9px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-container)] px-1 rounded">
                      {dayOrders.length} ped.
                    </span>
                  </div>
                )}
                {dayOrders.length === 0 && (
                  <span className="text-[10px] text-[var(--color-outline)] opacity-50 font-medium italic my-auto text-center hidden sm:block">Livre</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Orders Modal */}
      {selectedDayOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[var(--color-surface)] p-6 rounded-3xl space-y-5 shadow-2xl border border-[var(--color-outline-variant)]/40 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--color-outline-variant)]/20">
              <div>
                <h3 className="font-black text-lg text-[var(--color-on-surface)] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  Encomendas do Dia {selectedDayOrders.day} de {monthNames[currentDate.getMonth()]}
                </h3>
                <p className="text-xs text-[var(--color-outline)] mt-0.5">{selectedDayOrders.orders.length} pedido(s) agendado(s)</p>
              </div>
              <button onClick={() => setSelectedDayOrders(null)} className="p-2 rounded-full hover:bg-[var(--color-surface-container-high)] text-[var(--color-outline)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedDayOrders.orders.map(order => (
                <div key={order.id} className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-[var(--color-primary)]">Pedido #{order.id}</span>
                      <h4 className="font-bold text-sm text-[var(--color-on-surface)] mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[var(--color-outline)]" />
                        {order.cliente_nome}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.horario_agendado || 'Horário flexível'}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--color-outline)] space-y-1">
                    {order.cliente_telefone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        {order.cliente_telefone}
                      </p>
                    )}
                    <div className="pt-2 border-t border-[var(--color-outline-variant)]/20">
                      <p className="font-bold text-[var(--color-on-surface)] mb-1">Itens:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {order.itens.map((item, idx) => (
                          <li key={idx}>{item.quantidade}x {item.nomeProduto}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--color-outline-variant)]/20 text-xs font-bold">
                    <span className="text-[var(--color-outline)]">Total:</span>
                    <span className="text-[var(--color-primary)] text-sm">R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDayOrders(null)}
              className="w-full py-3 rounded-2xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
