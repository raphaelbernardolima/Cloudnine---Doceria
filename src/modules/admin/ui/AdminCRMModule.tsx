import React, { useState } from 'react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { Users, MagnifyingGlass, Faders, ChatCircle, Gift, Clock, TrendUp, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatCurrency } from '@/src/core/utils/formatters';

export const AdminCRMModule: React.FC = () => {
  const { users, orders } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'inactive' | 'vip'>('all');

  const crmUsers = React.useMemo(() => {
    return users.map(u => {
      const userOrders = orders.filter(o => o.cliente_id === u.id && o.status !== 'cancelado');
      const totalGasto = userOrders.reduce((sum, o) => sum + o.total, 0);
      
      // Assume orders are sorted descending by created_at (as fetched in useSupabaseSync)
      const lastOrder = userOrders.length > 0 ? userOrders[0].created_at : '';
      
      return {
        id: u.id,
        nome: `${u.nome || ''} ${u.sobrenome || ''}`.trim() || 'Sem Nome',
        telefone: u.telefone || '',
        lastOrder: lastOrder,
        totalGasto: totalGasto,
        wallet: u.walletBalance || 0
      };
    }).sort((a, b) => b.totalGasto - a.totalGasto); // Sort by totalGasto descending by default
  }, [users, orders]);

  const filteredUsers = crmUsers.filter(u => {
    const matchesSearch = u.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.telefone.includes(searchQuery);
    
    let daysSinceLastOrder = 999;
    if (u.lastOrder) {
      daysSinceLastOrder = (new Date().getTime() - new Date(u.lastOrder).getTime()) / (1000 * 3600 * 24);
    }
    
    if (filter === 'inactive') return matchesSearch && daysSinceLastOrder > 30;
    if (filter === 'vip') return matchesSearch && u.totalGasto > 500;
    return matchesSearch;
  });

  const sendWhatsAppCampaign = (telefone: string, nome: string) => {
    const text = `Olá ${nome}! Saudade de você aqui na Cloudnine Doceria 🥰 Temos um presente especial: 10% de desconto na sua próxima compra com o cupom VOLTA10. Peça agora: ${window.location.origin}`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('Redirecionando para o WhatsApp...');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20">
        <div>
          <h2 className="text-2xl font-black text-[var(--color-on-surface)] flex items-center gap-2">
            <Users className="w-8 h-8 text-[var(--color-primary)]" />
            Clientes & CRM
          </h2>
          <p className="text-[var(--color-on-surface-variant)] mt-1">
            Reengaje clientes sumidos e premie seus melhores compradores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
            <h3 className="font-bold text-[var(--color-on-surface-variant)]">Total de Clientes</h3>
          </div>
          <p className="text-3xl font-black text-[var(--color-on-surface)]">1.245</p>
        </div>
        
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Warning className="w-5 h-5" /></div>
            <h3 className="font-bold text-[var(--color-on-surface-variant)]">Em Risco (30+ dias)</h3>
          </div>
          <p className="text-3xl font-black text-[var(--color-on-surface)]">312</p>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><TrendUp className="w-5 h-5" /></div>
            <h3 className="font-bold text-[var(--color-on-surface-variant)]">Clientes VIP</h3>
          </div>
          <p className="text-3xl font-black text-[var(--color-on-surface)]">89</p>
        </div>
      </div>

      <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20 overflow-hidden">
        <div className="p-4 border-b border-[var(--color-outline-variant)]\/30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[var(--color-surface-container-low)]/50">
          <div className="relative w-full sm:w-96">
            <MagnifyingGlass className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex bg-[var(--color-surface-container)] p-1 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-[var(--color-surface-container-lowest)] shadow-sm text-[var(--color-on-surface)]' : 'text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('inactive')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === 'inactive' ? 'bg-[var(--color-surface-container-lowest)] shadow-sm text-amber-600' : 'text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'}`}
            >
              Inativos
            </button>
            <button 
              onClick={() => setFilter('vip')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === 'vip' ? 'bg-[var(--color-surface-container-lowest)] shadow-sm text-emerald-600' : 'text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'}`}
            >
              VIPs
            </button>
          </div>
        </div>

        <div className="rounded-2xl sm:border border-[var(--color-outline-variant)]\/30">
          <table className="w-full text-left border-collapse block sm:table">
            <thead className="hidden sm:table-header-group">
              <tr className="bg-[var(--color-surface-container-low)] text-[var(--color-outline)] text-sm border-b border-[var(--color-outline-variant)]\/30">
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Último Pedido</th>
                <th className="p-4 font-bold">Total Gasto</th>
                <th className="p-4 font-bold">Carteira</th>
                <th className="p-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="block sm:table-row-group space-y-4 sm:space-y-0 sm:divide-y divide-[var(--color-outline-variant)]\/10 p-4 sm:p-0">
              {filteredUsers.map(user => {
                const daysSince = Math.floor((new Date().getTime() - new Date(user.lastOrder).getTime()) / (1000 * 3600 * 24));
                const isInactive = daysSince > 30;
                
                return (
                  <tr key={user.id} className="block sm:table-row bg-[var(--color-surface-container-lowest)] sm:bg-transparent rounded-2xl border sm:border-0 sm:border-b border-[var(--color-outline-variant)]\/30 shadow-xs sm:shadow-none p-4 sm:p-0 hover:bg-[var(--color-surface-container-low)]/50 transition-colors">
                    <td className="flex sm:table-cell justify-between items-center py-2 sm:p-4 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]\/10 before:content-['Cliente'] before:sm:hidden before:font-bold before:text-[var(--color-outline)]">
                      <div className="text-right sm:text-left">
                        <p className="font-bold text-[var(--color-on-surface)]">{user.nome}</p>
                        <p className="text-xs text-[var(--color-outline)]">{user.telefone}</p>
                      </div>
                    </td>
                    <td className="flex sm:table-cell justify-between items-center py-2 sm:p-4 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]\/10 before:content-['Último_Pedido'] before:sm:hidden before:font-bold before:text-[var(--color-outline)]">
                      <div className="flex items-center justify-end sm:justify-start gap-2">
                        <Clock className={`w-4 h-4 ${isInactive ? 'text-amber-500' : 'text-emerald-500'}`} />
                        <span className={`text-sm font-bold ${isInactive ? 'text-amber-600' : 'text-[var(--color-on-surface-variant)]'}`}>
                          Há {daysSince} dias
                        </span>
                      </div>
                    </td>
                    <td className="flex sm:table-cell justify-between items-center py-2 sm:p-4 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]\/10 before:content-['Total_Gasto'] before:sm:hidden before:font-bold before:text-[var(--color-outline)]">
                      <span className="font-bold text-[var(--color-primary)]">{formatCurrency(user.totalGasto)}</span>
                    </td>
                    <td className="flex sm:table-cell justify-between items-center py-2 sm:p-4 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]\/10 before:content-['Carteira'] before:sm:hidden before:font-bold before:text-[var(--color-outline)]">
                      {user.wallet > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          <Gift className="w-3 h-3" /> {formatCurrency(user.wallet)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">-</span>
                      )}
                    </td>
                    <td className="flex sm:table-cell justify-between items-center py-3 sm:p-4 px-0 sm:px-4 text-center border-t border-[var(--color-outline-variant)]\/10 sm:border-t-0 mt-2 sm:mt-0 pt-3 sm:pt-4 sm:border-b before:content-['Ações'] before:sm:hidden before:font-bold before:text-[var(--color-outline)]">
                      <button 
                        onClick={() => sendWhatsAppCampaign(user.telefone, user.nome)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl text-xs font-bold transition-colors"
                      >
                        <ChatCircle className="w-4 h-4" />
                        {isInactive ? 'Recuperar' : 'Enviar Mimo'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr className="block sm:table-row">
                  <td colSpan={5} className="block sm:table-cell p-8 text-center text-[var(--color-outline)] font-bold italic">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
