import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Download, PieChart, Activity, AlertCircle, Package, ArrowUpRight, BarChart3, Calculator, Calendar
} from 'lucide-react';
import { Product, Order, Ingredient } from '../../types/index';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine
} from 'recharts';
import * as XLSX from 'xlsx';

interface AdminFinanceModuleProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
}

export const AdminFinanceModule: React.FC<AdminFinanceModuleProps> = ({ orders, products, ingredients }) => {
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'thisMonth' | 'lastMonth'>('thisMonth');

  // Utility to format BRL
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // 1. FILTER ORDERS BY DATE
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      if (dateFilter === 'today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateFilter === '7days') {
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        return diffTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (dateFilter === 'thisMonth') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'lastMonth') {
        let lastMonth = now.getMonth() - 1;
        let year = now.getFullYear();
        if (lastMonth < 0) { lastMonth = 11; year -= 1; }
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === year;
      }
      return true;
    }).filter(o => o.status !== 'cancelado');
  }, [orders, dateFilter]);

  // 2. FINANCIAL CALCULATIONS & KPIs
  const FIXED_COSTS = 8500; // Mock fixed costs for break-even

  const financeData = useMemo(() => {
    let rawRevenue = 0;
    let netRevenue = 0;
    let totalCMV = 0;
    
    // To build Scatter Chart (ABC Curve)
    const productStats: Record<string, { id: string | number; name: string; quantity: number; revenue: number; cmv: number }> = {};
    
    // To build Cash Flow (Area Chart)
    const dailyFlow: Record<string, number> = {};

    filteredOrders.forEach(order => {
      rawRevenue += order.total;

      // Fees Mock
      let fee = 0;
      if (order.metodo_pagamento === 'cartao_credito') fee = order.total * 0.0499; // 4.99%
      else if (order.metodo_pagamento === 'cartao_debito') fee = order.total * 0.0199; // 1.99%
      else if (order.metodo_pagamento === 'pix') fee = order.total * 0.0099; // 0.99%
      
      const orderNet = order.total - fee;
      netRevenue += orderNet;

      // Cash flow grouping
      const dateStr = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!dailyFlow[dateStr]) dailyFlow[dateStr] = 0;
      dailyFlow[dateStr] += orderNet;

      // Calculate Order CMV & Item Stats
      order.itens.forEach(item => {
        // Find product to check recipe
        const product = products.find(p => p.id === item.produto_id);
        let itemCMV = 0;
        
        if (product && product.receita) {
          product.receita.forEach(rec => {
            const ing = ingredients.find(i => i.id === rec.insumoId);
            if (ing) {
              itemCMV += rec.quantidade * ing.custoPorUnidade;
            }
          });
        } else {
          // Mock CMV if no recipe (e.g., 30% of price)
          itemCMV = item.preco_unitario * 0.3;
        }

        const totalItemCMV = itemCMV * item.quantidade;
        totalCMV += totalItemCMV;

        const prodId = String(item.produto_id || item.nomeProduto);
        if (!productStats[prodId]) {
          productStats[prodId] = { id: prodId, name: item.nomeProduto, quantity: 0, revenue: 0, cmv: 0 };
        }
        productStats[prodId].quantity += item.quantidade;
        productStats[prodId].revenue += item.preco_unitario * item.quantidade;
        productStats[prodId].cmv += totalItemCMV;
      });
    });

    const grossMargin = netRevenue - totalCMV;
    const grossMarginPercent = netRevenue > 0 ? (grossMargin / netRevenue) * 100 : 0;
    const ebitda = grossMargin - FIXED_COSTS;

    const chartDataFlow = Object.entries(dailyFlow).map(([date, value]) => ({ date, value }));

    const scatterData = Object.values(productStats).map(p => {
      const margin = p.revenue > 0 ? ((p.revenue - p.cmv) / p.revenue) * 100 : 0;
      let category = 'Ralos de Dinheiro';
      if (p.quantity >= 10 && margin >= 40) category = 'Campeões de Lucro';
      else if (p.quantity >= 10 && margin < 40) category = 'Chama-Cliente';
      
      return {
        name: p.name,
        quantity: p.quantity,
        margin: Number(margin.toFixed(2)),
        revenue: p.revenue,
        category
      };
    }).filter(p => p.quantity > 0);

    // Calculate Break Even percentage (max 100%)
    const breakEvenProgress = Math.min(Math.max((grossMargin / FIXED_COSTS) * 100, 0), 100);

    return {
      rawRevenue, netRevenue, totalCMV, grossMargin, grossMarginPercent, ebitda,
      chartDataFlow, scatterData, breakEvenProgress
    };
  }, [filteredOrders, products, ingredients]);

  // 3. EXPORT EXCEL VIA WEB WORKER (MOCKED SYNC VIA SHEETJS)
  const handleExportExcel = () => {
    // Aba 1: Resumo Executivo
    const wsResumo = XLSX.utils.json_to_sheet([
      { Metrica: "Faturamento Bruto", Valor: financeData.rawRevenue },
      { Metrica: "Receita Líquida", Valor: financeData.netRevenue },
      { Metrica: "CMV (Custo Mercadoria)", Valor: financeData.totalCMV },
      { Metrica: "Margem Bruta (R$)", Valor: financeData.grossMargin },
      { Metrica: "Margem Bruta (%)", Valor: financeData.grossMarginPercent.toFixed(2) + '%' },
      { Metrica: "Custos Fixos", Valor: FIXED_COSTS },
      { Metrica: "Resultado (EBITDA)", Valor: financeData.ebitda }
    ]);

    // Aba 2: Detalhamento Vendas
    const wsVendas = XLSX.utils.json_to_sheet(
      filteredOrders.map(o => ({
        ID: o.id,
        Data: o.created_at,
        Cliente: o.cliente_nome,
        Total: o.total,
        Pagamento: o.metodo_pagamento,
        Canal: o.tipo_entrega
      }))
    );

    // Aba 3: Curva ABC Produtos
    const wsABC = XLSX.utils.json_to_sheet(financeData.scatterData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo Executivo");
    XLSX.utils.book_append_sheet(wb, wsVendas, "Vendas");
    XLSX.utils.book_append_sheet(wb, wsABC, "Curva ABC Produtos");

    XLSX.writeFile(wb, `Relatorio_Financeiro_Cloudnine_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30">
        <div>
          <h2 className="font-black text-2xl text-[var(--color-on-surface)] flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[var(--color-primary)]" />
            Business Intelligence
          </h2>
          <p className="text-sm text-[var(--color-outline)] mt-1">Análise de rentabilidade, CMV e projeções financeiras.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-4 py-2 bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/30 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="today">Hoje</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="thisMonth">Este Mês</option>
            <option value="lastMonth">Mês Passado</option>
          </select>
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Líquida */}
        <div className="bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs uppercase font-extrabold text-[var(--color-outline)] tracking-wider block mb-1">Receita Líquida (Pós Taxas)</span>
            <span className="text-3xl font-black text-[var(--color-on-surface)]">{formatBRL(financeData.netRevenue)}</span>
            <span className="text-xs font-semibold flex items-center gap-1 text-emerald-500 pt-2">
              <TrendingUp className="w-3.5 h-3.5" /> Faturamento Realizado
            </span>
          </div>
        </div>

        {/* CMV Real */}
        <div className="bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs uppercase font-extrabold text-[var(--color-outline)] tracking-wider block mb-1">CMV (Custo Mercadoria)</span>
            <span className="text-3xl font-black text-rose-500">{formatBRL(financeData.totalCMV)}</span>
            <span className="text-xs font-semibold flex items-center gap-1 text-[var(--color-outline)] pt-2">
              <Calculator className="w-3.5 h-3.5" /> Baseado nas Fichas Técnicas
            </span>
          </div>
        </div>

        {/* Margem Bruta */}
        <div className="bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs uppercase font-extrabold text-[var(--color-outline)] tracking-wider block mb-1">Margem de Contribuição</span>
            <span className="text-3xl font-black text-emerald-500">{financeData.grossMarginPercent.toFixed(1)}%</span>
            <span className="text-xs font-semibold flex items-center gap-1 text-[var(--color-outline)] pt-2">
              Lucro Bruto: {formatBRL(financeData.grossMargin)}
            </span>
          </div>
        </div>

        {/* Ponto de Equilíbrio */}
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-purple-600 p-5 rounded-3xl shadow-lg relative overflow-hidden text-white">
          <div className="relative z-10">
            <span className="text-xs uppercase font-extrabold text-white/80 tracking-wider block mb-1">Ponto de Equilíbrio (Mês)</span>
            <span className="text-3xl font-black">{financeData.breakEvenProgress.toFixed(1)}%</span>
            
            <div className="w-full bg-black/20 rounded-full h-1.5 mt-3 mb-1">
              <div className="bg-white h-1.5 rounded-full" style={{ width: `${financeData.breakEvenProgress}%` }}></div>
            </div>
            
            <span className="text-[10px] font-semibold text-white/80">
              EBITDA: {formatBRL(financeData.ebitda)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curva ABC (Gráfico Bolhas) */}
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm flex flex-col h-[400px]">
          <h3 className="font-bold text-base text-[var(--color-on-surface)] flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-500" />
            Matriz BCG (Volume vs Margem)
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="quantity" name="Unidades" stroke="var(--color-outline)" tick={{fontSize: 12}} />
                <YAxis type="number" dataKey="margin" name="Margem %" unit="%" stroke="var(--color-outline)" tick={{fontSize: 12}} />
                <ZAxis type="number" dataKey="revenue" range={[60, 400]} name="Receita" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <ReferenceLine y={40} stroke="orange" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Margem Ideal (40%)', fill: 'orange', fontSize: 10 }} />
                <Scatter name="Produtos" data={financeData.scatterData}>
                  {financeData.scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.category === 'Campeões de Lucro' ? '#10b981' : entry.category === 'Chama-Cliente' ? '#3b82f6' : '#f43f5e'} 
                      fillOpacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs font-medium text-[var(--color-outline)]">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Campeões</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Chama-Cliente</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Atenção</span>
          </div>
        </div>

        {/* Fluxo de Caixa (Gráfico de Área) */}
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm flex flex-col h-[400px]">
          <h3 className="font-bold text-base text-[var(--color-on-surface)] flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Fluxo de Receita Diário
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeData.chartDataFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--color-outline)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--color-outline)" tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => formatBRL(val)}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DRE Simplificado Dinâmico */}
      <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-sm overflow-hidden">
         <h3 className="font-bold text-base text-[var(--color-on-surface)] flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[var(--color-primary)]" />
            DRE Simplificado (Demonstração do Resultado)
         </h3>
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <tbody className="divide-y divide-[var(--color-outline-variant)]/20">
               <tr className="hover:bg-[var(--color-surface-container-low)] transition-colors">
                 <td className="py-3 px-4 font-bold text-[var(--color-on-surface)]">Faturamento Bruto (Total Pedidos)</td>
                 <td className="py-3 px-4 text-right font-bold text-[var(--color-primary)]">{formatBRL(financeData.rawRevenue)}</td>
               </tr>
               <tr className="hover:bg-[var(--color-surface-container-low)] transition-colors text-rose-500">
                 <td className="py-3 px-4 pl-8">(-) Taxas de Pagamento (PIX, Crédito, Débito)</td>
                 <td className="py-3 px-4 text-right">- {formatBRL(financeData.rawRevenue - financeData.netRevenue)}</td>
               </tr>
               <tr className="hover:bg-[var(--color-surface-container-low)] transition-colors bg-[var(--color-surface-container-high)]/30">
                 <td className="py-3 px-4 font-black text-[var(--color-on-surface)]">Receita Líquida</td>
                 <td className="py-3 px-4 text-right font-black">{formatBRL(financeData.netRevenue)}</td>
               </tr>
               <tr className="hover:bg-[var(--color-surface-container-low)] transition-colors text-rose-500">
                 <td className="py-3 px-4 pl-8">(-) CMV (Custo das Fichas Técnicas dos Insumos)</td>
                 <td className="py-3 px-4 text-right">- {formatBRL(financeData.totalCMV)}</td>
               </tr>
               <tr className="hover:bg-[var(--color-surface-container-low)] transition-colors bg-[var(--color-surface-container-high)]/30">
                 <td className="py-3 px-4 font-black text-[var(--color-on-surface)]">Margem de Contribuição (Lucro Bruto)</td>
                 <td className="py-3 px-4 text-right font-black text-emerald-500">{formatBRL(financeData.grossMargin)} ({financeData.grossMarginPercent.toFixed(1)}%)</td>
               </tr>
               <tr className="hover:bg-[var(--color-surface-container-low)] transition-colors text-rose-500">
                 <td className="py-3 px-4 pl-8">(-) Custos Fixos (Estimado Mês)</td>
                 <td className="py-3 px-4 text-right">- {formatBRL(FIXED_COSTS)}</td>
               </tr>
               <tr className="hover:bg-[var(--color-primary)]/10 transition-colors bg-[var(--color-primary)]/5">
                 <td className="py-4 px-4 font-black text-lg text-[var(--color-on-surface)]">Resultado Operacional (EBITDA)</td>
                 <td className={`py-4 px-4 text-right font-black text-lg ${financeData.ebitda >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {formatBRL(financeData.ebitda)}
                 </td>
               </tr>
             </tbody>
           </table>
         </div>
      </div>

    </div>
  );
};
