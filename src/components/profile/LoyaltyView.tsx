import React from 'react';
import { Award, Gift, Star, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

interface LoyaltyViewProps {
  onApplyRewardCoupon: (code: string, amount: number) => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({ onApplyRewardCoupon }) => {
  const points = 340;
  const level = 'Ouro';

  const rewards = [
    {
      pointsCost: 150,
      code: 'DOCE10',
      title: 'Cupom de R$ 10,00 OFF',
      description: 'Válido para qualquer pedido acima de R$ 40,00'
    },
    {
      pointsCost: 250,
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Banner Points Status */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-on-primary)] shadow-md overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Programa Cloudnine Club</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Seu Nível Atual: Nível {level} ✨
          </h2>
          <p className="text-xs text-white/90 max-w-md leading-relaxed">
            A cada R$ 1,00 gasto na Cloudnine você ganha 1 Ponto de Doçura! Troque seus pontos por doces grátis, cupons e frete grátis.
          </p>
        </div>

        {/* Counter Card */}
        <div className="z-10 bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)]/30 text-center min-w-[180px] shadow-lg">
          <span className="text-sm uppercase font-bold text-[var(--color-outline)] block">Saldo de Pontos</span>
          <span className="text-3xl font-black text-[var(--color-primary)] block my-1">{points} pts</span>
          <span className="text-sm text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            +50 pts para o Nível Diamante
          </span>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[var(--color-on-surface)] flex items-center gap-2">
          <Gift className="w-5 h-5 text-[var(--color-primary)]" />
          Recompensas Disponíveis para Resgate
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((reward, idx) => {
            const canRedeem = points >= reward.pointsCost;
            return (
              <div 
                key={idx}
                className="p-5 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-3 flex flex-col justify-between shadow-xs hover:border-[var(--color-primary)]/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
                      {reward.pointsCost} pontos
                    </span>
                    {canRedeem && (
                      <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircleIcon /> Pronto p/ resgatar
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-on-surface)] mb-1">
                    {reward.title}
                  </h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <button
                  disabled={!canRedeem}
                  onClick={() => {
                    onApplyRewardCoupon(reward.code, reward.pointsCost);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    canRedeem
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs hover:opacity-95'
                      : 'bg-[var(--color-surface-container-high)] text-[var(--color-outline)] cursor-not-allowed'
                  }`}
                >
                  <span>{canRedeem ? 'Resgatar Recompensa' : 'Pontos Insuficientes'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function CheckCircleIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
