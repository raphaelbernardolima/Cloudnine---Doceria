import { formatCurrency } from '@/src/core/utils/formatters';
import React from 'react';
import { Order, Ingredient } from '@/src/core/types/index';
import { CurrencyDollar, Tote, Warning, TrendUp, Package } from '@phosphor-icons/react';
import { Box, Typography } from '@mui/material';

interface AdminHomeDashboardProps {
  orders: Order[];
  ingredients: Ingredient[];
  setActiveTab: (tab: string) => void;
}

export const AdminHomeDashboard: React.FC<AdminHomeDashboardProps> = ({ orders, ingredients, setActiveTab }) => {
  // Metrics calculation
  const today = new Date().toISOString().split('T')[0];
  
  const todaysOrders = orders.filter(o => o.created_at.startsWith(today));
  const todaysRevenue = todaysOrders.reduce((acc, order) => acc + (order.total || 0), 0);
  
  const pendingOrders = orders.filter(o => ['pendente_pix', 'em_preparo', 'pronto_retirada'].includes(o.status));
  const lowStockItems = ingredients.filter(i => (i.estoqueAtual || 0) <= 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl text-[var(--color-on-surface)]" style={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic' }}>
            Visão Geral
          </h3>
          <p className="text-sm text-[var(--color-on-surface-variant)]">Acompanhe as métricas vitais da sua doceria em tempo real.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <TrendUp className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <span className="text-emerald-100 font-bold text-sm uppercase tracking-wider block mb-2">Faturamento Hoje</span>
            <span className="text-4xl font-black block">{formatCurrency(todaysRevenue)}</span>
            <span className="text-xs text-emerald-100 mt-2 block">{todaysOrders.length} pedidos hoje</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute right-4 top-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 transition-transform group-hover:scale-110">
            <Tote className="w-6 h-6" />
          </div>
          <span className="text-[var(--color-on-surface-variant)] font-bold text-sm uppercase tracking-wider block mb-2">Pedidos Ativos</span>
          <span className="text-4xl font-black text-[var(--color-on-surface)] block">{pendingOrders.length}</span>
          <span className="text-xs text-amber-600 font-bold mt-2 block">Aguardando ação</span>
        </div>

        {/* Low Stock */}
        <div 
          onClick={() => setActiveTab('products')}
          className={`border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${
            lowStockItems.length > 0 
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50' 
              : 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]'
          }`}
        >
          <div className={`absolute right-4 top-4 p-3 rounded-2xl transition-transform group-hover:scale-110 ${
            lowStockItems.length > 0 ? 'bg-rose-200 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]'
          }`}>
            {lowStockItems.length > 0 ? <Warning className="w-6 h-6" /> : <Package className="w-6 h-6" />}
          </div>
          <span className="text-[var(--color-on-surface-variant)] font-bold text-sm uppercase tracking-wider block mb-2">Alerta de Estoque</span>
          <span className={`text-4xl font-black block ${lowStockItems.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--color-on-surface)]'}`}>
            {lowStockItems.length}
          </span>
          <span className={`text-xs font-bold mt-2 block ${lowStockItems.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--color-on-surface-variant)]'}`}>
            {lowStockItems.length > 0 ? 'Itens com estoque crítico (<= 5)' : 'Estoque saudável'}
          </span>
        </div>

        {/* Total Orders Metric */}
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 p-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded-2xl">
            <CurrencyDollar className="w-6 h-6" />
          </div>
          <span className="text-[var(--color-on-surface-variant)] font-bold text-sm uppercase tracking-wider block mb-2">Total de Vendas (Geral)</span>
          <span className="text-4xl font-black text-[var(--color-on-surface)] block">{orders.length}</span>
          <span className="text-xs text-[var(--color-on-surface-variant)] mt-2 block">Pedidos registrados</span>
        </div>

      </div>
      
      {/* Quick Access or empty state filler below */}
      <Box sx={{ mt: 4, p: 4, borderRadius: 4, bgcolor: 'var(--color-surface-container-lowest)', border: '1px dashed var(--color-outline-variant)' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Selecione uma opção no menu lateral para iniciar as operações.
        </Typography>
      </Box>

    </div>
  );
};
