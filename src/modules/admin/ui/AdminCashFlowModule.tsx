import React, { useState } from 'react';
import { TrendUp, TrendDown, CurrencyDollar, Plus, Trash, CheckCircle, Clock } from '@phosphor-icons/react';
import { Order, Expense } from '@/src/core/types/index';

interface AdminCashFlowModuleProps {
  orders: Order[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

export const AdminCashFlowModule: React.FC<AdminCashFlowModuleProps> = ({
  orders,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<Expense['categoria']>('insumo');
  const [dataVencimento, setDataVencimento] = useState('');
  const [pago, setPago] = useState(false);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;
    
    onAddExpense({
      descricao,
      valor: parseFloat(valor),
      categoria,
      data_vencimento: dataVencimento || undefined,
      data: new Date().toISOString(),
      pago
    });
    
    setDescricao('');
    setValor('');
    setPago(false);
    setDataVencimento('');
  };

  // Calcula Receitas Reais (Pedidos pagos/entregues)
  // Assumimos que pedidos não-cancelados e não-pendentes já geraram receita
  const receitasRealizadas = orders
    .filter(o => o.status !== 'cancelado' && o.status !== 'pendente_pix')
    .reduce((acc, order) => acc + order.total, 0);

  // Calcula Receitas Futuras (Ainda não pagas)
  const receitasPendentes = orders
    .filter(o => o.status === 'pendente_pix')
    .reduce((acc, order) => acc + order.total, 0);

  const despesasPagas = expenses
    .filter(e => e.pago)
    .reduce((acc, e) => acc + e.valor, 0);

  const despesasPendentes = expenses
    .filter(e => !e.pago)
    .reduce((acc, e) => acc + e.valor, 0);

  const lucroLiquidoRealizado = receitasRealizadas - despesasPagas;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
          <CurrencyDollar className="w-5 h-5 text-emerald-600" />
          Fluxo de Caixa & DRE
        </h3>
      </div>

      {/* BI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[100px] -mr-4 -mt-4"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
              <TrendUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-sm text-[var(--color-on-surface-variant)]">Receitas (Pagas)</span>
          </div>
          <p className="text-2xl font-black text-[var(--color-on-surface)]">{formatCurrency(receitasRealizadas)}</p>
          {receitasPendentes > 0 && (
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              + {formatCurrency(receitasPendentes)} pendentes
            </p>
          )}
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-[100px] -mr-4 -mt-4"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
              <TrendDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="font-bold text-sm text-[var(--color-on-surface-variant)]">Despesas (Pagas)</span>
          </div>
          <p className="text-2xl font-black text-[var(--color-on-surface)]">{formatCurrency(despesasPagas)}</p>
          {despesasPendentes > 0 && (
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              + {formatCurrency(despesasPendentes)} a pagar
            </p>
          )}
        </div>

        <div className={`bg-[var(--color-surface-container-lowest)] p-5 rounded-3xl border ${lucroLiquidoRealizado >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'} shadow-xs relative overflow-hidden lg:col-span-2`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${lucroLiquidoRealizado >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <CurrencyDollar className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-[var(--color-on-surface-variant)]">Lucro Líquido (DRE Simplificado)</span>
          </div>
          <p className={`text-3xl font-black ${lucroLiquidoRealizado >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(lucroLiquidoRealizado)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Despesas */}
        <div className="lg:col-span-1 bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs">
          <h4 className="font-bold text-[var(--color-on-surface)] mb-4">Lançar Nova Despesa</h4>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="font-bold text-xs block mb-1">Descrição</label>
              <input
                type="text"
                required
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Conta de Luz, Embalagens..."
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 text-sm"
              />
            </div>
            
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-xs block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 text-sm"
                />
              </div>
              <div>
                <label className="font-bold text-xs block mb-1">Categoria</label>
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 text-sm"
                >
                  <option value="insumo">Insumo/Ingrediente</option>
                  <option value="fixo">Custo Fixo (Luz/Água)</option>
                  <option value="variavel">Custo Variável</option>
                  <option value="entregador">Entregadores</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-xs block mb-1">Data de Vencimento</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={e => setDataVencimento(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container-low)]">
              <input
                type="checkbox"
                checked={pago}
                onChange={e => setPago(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold">Despesa já foi paga?</span>
            </label>

            <button type="submit" className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Registrar Saída
            </button>
          </form>
        </div>

        {/* Lista de Despesas */}
        <div className="lg:col-span-2 bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs">
          <h4 className="font-bold text-[var(--color-on-surface)] mb-4">Contas a Pagar / Pagas</h4>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {expenses.length === 0 ? (
              <div className="text-center py-10 text-[var(--color-on-surface-variant)]">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold">Nenhuma despesa registrada.</p>
              </div>
            ) : (
              expenses.map(e => (
                <div key={e.id} className={`flex items-center justify-between p-4 rounded-2xl border ${e.pago ? 'border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${e.pago ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {e.pago ? 'Pago' : 'Pendente'}
                      </span>
                      <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase">{e.categoria}</span>
                    </div>
                    <p className="font-bold text-[var(--color-on-surface)]">{e.descricao}</p>
                    {e.data_vencimento && (
                      <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Vence: {new Date(e.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-black ${e.pago ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      - {formatCurrency(e.valor)}
                    </p>
                    <div className="flex flex-col gap-1 border-l border-[var(--color-outline-variant)]/20 pl-4">
                      {!e.pago && (
                        <button 
                          onClick={() => onUpdateExpense(e.id, { pago: true })}
                          className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded"
                        >
                          Pagar
                        </button>
                      )}
                      <button 
                        onClick={() => { if(window.confirm('Excluir este lançamento financeiro?')) onDeleteExpense(e.id) }}
                        className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-2 py-1 rounded"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
