import { formatCurrency } from '@/src/core/utils/formatters';
import React from 'react';
import { Medal, Gift, Star, Sparkle, Check, WarningCircle, Users, Copy } from '@phosphor-icons/react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useUIStore } from '@/src/core/store/useUIStore';
import { useCartStore } from '@/src/core/store/useCartStore';
import { useCouponLogic } from '@/src/core/hooks/useCouponLogic';
import { getSupabaseClient } from '@/src/core/services/supabase';

interface LoyaltyViewProps {
  onOpenAuthModal: (msg?: string) => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({ onOpenAuthModal }) => {
  const { currentUser, setCurrentUser, orders } = useDataStore();
  const { setIsCartOpen } = useCartStore();
  const { showToast } = useUIStore();
  const { handleApplyCoupon } = useCouponLogic();

  const onApplyRewardCoupon = async (code: string, amount: number) => {
    if (currentUser && (currentUser.pontosFidelidade || 0) >= amount) {
      const client = getSupabaseClient();
      if (client) {
        const novosPontos = (currentUser.pontosFidelidade || 0) - amount;
        await client.from('historico_fidelidade').insert([{
          cliente_id: currentUser.id,
          tipo: 'resgate',
          pontos: amount,
          descricao: `Resgate do cupom ${code}`
        }]);
        await client.from('Perfis').update({ pontos_fidelidade: novosPontos }).eq('id', currentUser.id);
        setCurrentUser({ ...currentUser, pontosFidelidade: novosPontos });
        
        handleApplyCoupon(code);
        setIsCartOpen(true);
        if (showToast) showToast(`Cupom ${code} resgatado com sucesso!`);
      }
    }
  };

  const userOrders = currentUser
    ? orders.filter(o => (currentUser.email && (o as any).clienteEmail?.toLowerCase() === currentUser.email.toLowerCase()) || (currentUser.telefone && (o as any).telefone === currentUser.telefone))
    : [];

  const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const points = currentUser?.pontosFidelidade !== undefined ? currentUser.pontosFidelidade : Math.floor(totalSpent);

  let level = 'Bronze';
  let nextTierPoints = 100;
  let nextTierName = 'Prata';
  if (points >= 1000) {
    level = 'Diamante';
    nextTierPoints = 0;
    nextTierName = 'Máximo';
  } else if (points >= 400) {
    level = 'Platina';
    nextTierPoints = 1000 - points;
    nextTierName = 'Diamante';
  } else if (points >= 200) {
    level = 'Ouro';
    nextTierPoints = 400 - points;
    nextTierName = 'Platina';
  } else if (points >= 100) {
    level = 'Prata';
    nextTierPoints = 200 - points;
    nextTierName = 'Ouro';
  } else {
    nextTierPoints = 100 - points;
    nextTierName = 'Prata';
  }

  const rewards = [
    {
      pointsCost: 100,
      code: 'DOCE10',
      title: 'Cupom de R$ 10,00 OFF',
      description: 'Válido para qualquer pedido acima de R$ 40,00'
    },
    {
      pointsCost: 200,
      code: 'CAIXAGIFT20',
      title: 'Desconto de R$ 20,00 em Kits & Presentes',
      description: 'Perfeito para celebrar aniversários com a família'
    },
    {
      pointsCost: 400,
      code: 'BRIGADEIROSGRATIS',
      title: 'Caixa de 6 Brigadeiros Gourmet Grátis',
      description: 'Retirada ou adicionado ao seu próximo pedido'
    }
  ];

  const handleCopyReferral = () => {
    const code = currentUser?.codigo_indicacao || (currentUser ? `${currentUser.nome.toUpperCase()}10` : 'CLOUD10');
    navigator.clipboard.writeText(code);
    if (showToast) showToast(`Código ${code} copiado! Compartilhe com seus amigos.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 animate-in fade-in duration-300">
      {!currentUser && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <WarningCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-center sm:text-left">Faça login para acumular pontos reais a cada pedido e resgatar recompensas exclusivas no Cloudnine Club!</p>
          </div>
          <button
            onClick={() => onOpenAuthModal('Faça login para acompanhar seus pontos no Cloudnine Club')}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-all shrink-0 w-full sm:w-auto"
          >
            Entrar / Cadastrar
          </button>
        </div>
      )}

      {/* Banner Points Status */}
      <div className="relative rounded-3xl p-8 bg-linear-gradient-primary-to-secondary text-on-primary shadow-md overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-xs">
            <Sparkle className="w-3.5 h-3.5 fill-current" />
            <span>Programa Cloudnine Club</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Seu Nível Atual: Nível {level} ✨
          </h2>
          <p className="text-xs text-white/90 max-w-md leading-relaxed">
            A cada R$ 1,00 gasto em pedidos concluídos na Cloudnine você ganha 1 Ponto de Doçura! Troque seus pontos por doces grátis e cupons.
          </p>
        </div>
        {/* Counter Card */}
        <div className="z-10 bg-surface-container-lowest text-on-surface p-5 rounded-2xl border border-outline-variant/30 text-center min-w-45 shadow-lg">
          <span className="text-sm uppercase font-bold text-outline block">Saldo de Pontos</span>
          <span className="text-3xl font-black text-primary block my-1">{points} pts</span>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded-full block">
            {nextTierPoints > 0 ? `+${nextTierPoints} pts para o Nível ${nextTierName}` : 'Nível Máximo Alcançado!'}
          </span>
        </div>
      </div>

      {/* User Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-center">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Pedidos Realizados</span>
          <span className="text-2xl font-black text-on-surface mt-1 block">{userOrders.length}</span>
        </div>
        <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-center">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Total Gasto em Pedidos</span>
          <span className="text-2xl font-black text-on-surface mt-1 block">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="p-5 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-center">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Recompensas Resgatadas</span>
          <span className="text-2xl font-black text-on-surface mt-1 block">0</span>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Recompensas Disponíveis para Resgate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((reward, idx) => {
            const canRedeem = points >= reward.pointsCost;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 flex flex-col justify-between shadow-xs hover:border-primary/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container">
                      {reward.pointsCost} pontos
                    </span>
                    {canRedeem && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Pronto p/ resgatar
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-on-surface mb-1">
                    {reward.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {reward.description}
                  </p>
                </div>
                <button
                  disabled={!canRedeem}
                  onClick={() => {
                    onApplyRewardCoupon(reward.code, reward.pointsCost);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${canRedeem
                    ? 'bg-primary text-on-primary shadow-xs hover:opacity-95 cursor-pointer'
                    : 'bg-surface-container-high text-outline cursor-not-allowed'
                    }`}
                >
                  <span>{canRedeem ? 'Resgatar Recompensa' : 'Pontos Insuficientes'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indique e Ganhe (Member get Member) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-300">
            Indique e Ganhe Cashback! 💸
          </h3>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-400/80">
            Compartilhe seu código com um amigo. Ele ganha <strong className="text-emerald-600 dark:text-emerald-300">10% de desconto</strong> na primeira compra, e você ganha <strong className="text-emerald-600 dark:text-emerald-300">R$ 5,00 em cashback</strong> direto na sua carteira para gastar como quiser!
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
          <div className="px-6 py-3 bg-white dark:bg-black/40 border-2 border-emerald-500/30 rounded-2xl flex items-center gap-3">
            <span className="font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
              {currentUser?.codigo_indicacao || (currentUser ? `${currentUser.nome.toUpperCase().split(' ')[0]}10` : 'FAZLOGIN')}
            </span>
            <button 
              onClick={handleCopyReferral}
              disabled={!currentUser}
              className="p-2 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl transition-colors disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-widest">
            Seu código exclusivo
          </span>
        </div>
      </div>

    </div>
  );
};
