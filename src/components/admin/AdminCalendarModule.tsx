import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from '../../types/index';

interface AdminCalendarModuleProps {
  orders: Order[];
}

export const AdminCalendarModule: React.FC<AdminCalendarModuleProps> = ({ orders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <div className="flex items-center justify-between p-4 bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[var(--color-primary)]" />
          Calendário de Encomendas
        </h3>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 bg-[var(--color-surface-container)] rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-black text-[var(--color-on-surface)] w-32 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 bg-[var(--color-surface-container)] rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center font-bold text-xs text-[var(--color-outline)] p-2 uppercase">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-4 rounded-2xl bg-[var(--color-surface-container-lowest)]/50 border border-transparent"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayOrders = getOrdersForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

          return (
            <div key={day} className={`p-3 rounded-2xl border flex flex-col min-h-[100px] transition-colors ${isToday ? 'bg-[var(--color-primary-container)] border-[var(--color-primary)]/50' : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/30'} hover:border-[var(--color-primary)]/40`}>
              <span className={`font-black text-sm mb-2 ${isToday ? 'text-[var(--color-on-primary-container)]' : 'text-[var(--color-on-surface)]'}`}>{day}</span>
              <div className="flex-1 flex flex-col gap-1.5">
                {dayOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="bg-[var(--color-surface)] p-1.5 rounded-lg border border-[var(--color-outline-variant)]/40 shadow-xs flex items-center justify-between group cursor-pointer" title={`${order.cliente_nome} - ${order.horario_agendado}`}>
                    <div className="flex items-center gap-1 min-w-0">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold truncate text-[var(--color-on-surface)]">{order.horario_agendado}</span>
                    </div>
                  </div>
                ))}
                {dayOrders.length > 3 && (
                  <span className="text-sm font-semibold text-[var(--color-outline)] text-center mt-1">+{dayOrders.length - 3} pedidos</span>
                )}
                {dayOrders.length === 0 && (
                  <span className="text-sm text-[var(--color-outline)] opacity-80 font-medium italic mt-auto">Livre</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
