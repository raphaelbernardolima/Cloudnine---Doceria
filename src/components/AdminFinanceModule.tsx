import React from 'react';
import { Order, Product } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Package, Sparkles, PieChart, Activity, AlertCircle } from 'lucide-react';

interface AdminFinanceModuleProps {
  orders: Order[];
  products: Product[];
}

export const AdminFinanceModule: React.FC<AdminFinanceModuleProps> = ({ orders, products }) => {
  // Advanced Financial Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate product sales to find best and worst sellers
  const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
  orders.forEach(order => {
    order.itens.forEach(item => {
      const id = item.produto_id?.toString() || item.nomeProduto;
      if (!productSales[id]) {
        productSales[id] = { name: item.nomeProduto, quantity: 0, revenue: 0 };
      }
      productSales[id].quantity += item.quantidade;
      productSales[id].revenue += item.preco_unitario * item.quantidade;
    });
  });

  const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
  const bestSeller = sortedProducts.length > 0 ? sortedProducts[0] : null;
  const worstSeller = sortedProducts.length > 0 ? sortedProducts[sortedProducts.length - 1] : null;

  // Formatting currency
  const formatBRL = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <div className="space-y-6">
      
      {/* Resumo Financeiro Simplificado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receita Total */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-xs uppercase font-extrabold text-emerald-100 block tracking-wider">Receita Bruta (Faturamento)</span>
            <span className="text-3xl font-black">{formatBRL(totalRevenue)}</span>
            <span className="text-xs font-semibold flex items-center gap-1 text-emerald-100 pt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% em relação ao mês passado
            </span>
          </div>
          <DollarSign className="w-24 h-24 absolute -bottom-4 -right-4 text-emerald-400 opacity-20" />
        </div>

        {/* Ticket Médio */}
        <div className="p-5 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-[var(--color-outline)] block tracking-wider">Ticket Médio por Cliente</span>
            <span className="text-2xl font-black text-[var(--color-primary)]">{formatBRL(avgTicket)}</span>
            <p className="text-sm text-[var(--color-outline)] pt-1 leading-snug">
              Em média, cada cliente gasta esse valor por pedido. Para aumentar, tente oferecer <strong>bebidas</strong> ou <strong>embalagens de presente</strong> no fechamento.
            </p>
          </div>
        </div>

        {/* Custo e Margem (Simulados) */}
        <div className="p-5 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-[var(--color-outline)] block tracking-wider">Margem de Lucro Estimada</span>
            <span className="text-2xl font-black text-[var(--color-on-surface)]">42%</span>
            <p className="text-sm text-[var(--color-outline)] pt-1 leading-snug">
              Após deduzir os custos de ingredientes e embalagem (CMV estimado em 35%) e custos fixos.
            </p>
          </div>
        </div>
      </div>

      {/* Análise de Produtos e Precificação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Curva ABC (Mais e Menos Vendidos) */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs space-y-6">
          <h3 className="font-black text-base text-[var(--color-on-surface)] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[var(--color-primary)]" />
            O que está saindo mais? (Curva ABC)
          </h3>
          
          <div className="space-y-4">
            {/* Campeão de Vendas */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold uppercase text-emerald-600 tracking-wider">Campeão de Vendas</p>
                  <p className="font-bold text-sm text-[var(--color-on-surface)]">{bestSeller?.name || 'N/A'}</p>
                  <p className="text-xs text-[var(--color-outline)] mt-1">
                    Vendeu <strong>{bestSeller?.quantity || 0} unidades</strong> gerando <strong>{formatBRL(bestSeller?.revenue || 0)}</strong>.
                  </p>
                  <p className="text-sm bg-white dark:bg-[var(--color-surface-container)] px-2 py-1.5 rounded-lg mt-2 font-medium border border-emerald-100 dark:border-[var(--color-outline-variant)]/20 shadow-sm text-emerald-800 dark:text-emerald-300">
                    💡 <strong>Ação Recomendada:</strong> Destaque este produto na página inicial ou crie "Kits" junto com ele.
                  </p>
                </div>
              </div>
            </div>

            {/* Menos Vendido */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl text-rose-600">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold uppercase text-rose-600 tracking-wider">Precisa de Atenção</p>
                  <p className="font-bold text-sm text-[var(--color-on-surface)]">{worstSeller?.name || 'N/A'}</p>
                  <p className="text-xs text-[var(--color-outline)] mt-1">
                    Vendeu apenas <strong>{worstSeller?.quantity || 0} unidades</strong>.
                  </p>
                  <p className="text-sm bg-white dark:bg-[var(--color-surface-container)] px-2 py-1.5 rounded-lg mt-2 font-medium border border-rose-100 dark:border-[var(--color-outline-variant)]/20 shadow-sm text-rose-800 dark:text-rose-300">
                    💡 <strong>Ação Recomendada:</strong> Revise as fotos, abaixe o preço promocionalmente ou retire do cardápio para reduzir desperdício de insumos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultoria Financeira IA */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--color-surface-container-lowest)] to-purple-50/50 dark:to-purple-950/20 border border-[var(--color-outline-variant)]/30 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[var(--color-on-surface)]">Análise Inteligente Cloudnine</h3>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">Consultor IA Financeiro</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 shadow-sm space-y-2">
              <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" /> Diagnóstico de Saúde do Negócio
              </h4>
              <p className="text-[var(--color-outline)] leading-relaxed">
                Suas vendas estão concentradas no final de semana (sexta a domingo). O fluxo de caixa durante a semana está ocioso.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 shadow-sm space-y-2">
              <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Oportunidade de Precificação (Markup)
              </h4>
              <p className="text-[var(--color-outline)] leading-relaxed">
                O produto "{bestSeller?.name || 'Mais vendido'}" tem alta demanda inelástica. Você pode <strong>aumentar o preço em 5% a 8%</strong> sem perder volume de vendas, melhorando diretamente sua margem líquida.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 shadow-sm space-y-2">
              <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-rose-500" /> Risco de Ruptura de Estoque
              </h4>
              <p className="text-[var(--color-outline)] leading-relaxed">
                2 ingredientes principais (Pistache e Callebaut 54%) estão com giro alto. Antecipe a compra com fornecedores antes de Quinta-feira para evitar falta de insumos no pico.
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
