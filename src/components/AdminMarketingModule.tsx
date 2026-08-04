import React, { useState } from 'react';
import { Gift, Ticket, Save, AlertCircle } from 'lucide-react';
import { Coupon, LoyaltySettings } from '../types';

interface AdminMarketingModuleProps {
  coupons: Coupon[];
  loyaltySettings: LoyaltySettings;
  onUpdateLoyalty: (settings: LoyaltySettings) => void;
  onAddCoupon: (c: Omit<Coupon, 'id'>) => void;
  onToggleCoupon: (id: string, ativo: boolean) => void;
}

export const AdminMarketingModule: React.FC<AdminMarketingModuleProps> = ({ coupons, loyaltySettings, onUpdateLoyalty, onAddCoupon, onToggleCoupon }) => {
  const [pontosReal, setPontosReal] = useState(loyaltySettings.pontosPorReal.toString());
  const [valorResgate, setValorResgate] = useState(loyaltySettings.valorResgatePorPonto.toString());
  const [isSaving, setIsSaving] = useState(false);

  // New Coupon form
  const [cCodigo, setCCodigo] = useState('');
  const [cTipo, setCTipo] = useState<'porcentagem'|'fixo'|'frete_gratis'>('porcentagem');
  const [cValor, setCValor] = useState('');
  const [cMinimo, setCMinimo] = useState('');

  const handleSaveLoyalty = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateLoyalty({
        pontosPorReal: parseInt(pontosReal) || 1,
        valorResgatePorPonto: parseFloat(valorResgate) || 0.05
      });
      setIsSaving(false);
    }, 600);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCoupon({
      codigo: cCodigo.toUpperCase(),
      tipoDesconto: cTipo,
      valor: parseFloat(cValor) || 0,
      minimoCompra: parseFloat(cMinimo) || 0,
      ativo: true
    });
    setCCodigo(''); setCValor(''); setCMinimo('');
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Loyalty Program Settings */}
        <div className="p-6 bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs space-y-4">
          <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
            <Gift className="w-5 h-5 text-[var(--color-primary)]" />
            Cloudnine Club (Pontos)
          </h3>
          <form onSubmit={handleSaveLoyalty} className="space-y-4">
            <div>
              <label className="text-sm font-bold uppercase text-[var(--color-outline)] mb-1 block">R$ 1,00 gasto equivale a quantos pontos?</label>
              <input type="number" required value={pontosReal} onChange={e=>setPontosReal(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--color-surface-container-high)] text-sm font-black" />
            </div>
            <div>
              <label className="text-sm font-bold uppercase text-[var(--color-outline)] mb-1 block">Valor em R$ por Ponto (Resgate)</label>
              <input type="number" step="0.01" required value={valorResgate} onChange={e=>setValorResgate(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--color-surface-container-high)] text-sm font-black" />
              <p className="text-xs text-[var(--color-outline)] mt-1">Ex: 0.05 significa que 100 pontos = R$ 5,00 de desconto.</p>
            </div>
            <button disabled={isSaving} type="submit" className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center gap-2 transition-colors hover:opacity-90">
              <Save className="w-4 h-4" /> {isSaving ? 'Salvando...' : 'Salvar Regras'}
            </button>
          </form>
        </div>

        {/* Coupons Manager */}
        <div className="p-6 bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs space-y-4">
          <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[var(--color-primary)]" />
            Cupons de Desconto
          </h3>
          <form onSubmit={handleAddCoupon} className="space-y-3 pb-4 border-b border-[var(--color-outline-variant)]/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Código</label>
                <input required value={cCodigo} onChange={e=>setCCodigo(e.target.value)} placeholder="Ex: BEMVINDO10" className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs uppercase font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Tipo</label>
                <select value={cTipo} onChange={e=>setCTipo(e.target.value as any)} className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs font-bold">
                  <option value="porcentagem">% de Desconto</option>
                  <option value="fixo">Valor Fixo (R$)</option>
                  <option value="frete_gratis">Frete Grátis</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Valor {cTipo === 'porcentagem' ? '(%)' : cTipo === 'fixo' ? '(R$)' : ''}</label>
                <input type="number" step="0.01" required={cTipo !== 'frete_gratis'} disabled={cTipo === 'frete_gratis'} value={cValor} onChange={e=>setCValor(e.target.value)} placeholder="Ex: 10" className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Mín. Compra (R$)</label>
                <input type="number" step="0.01" value={cMinimo} onChange={e=>setCMinimo(e.target.value)} placeholder="Opcional" className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[var(--color-secondary)] text-[var(--color-on-secondary)] font-bold text-xs flex items-center justify-center gap-2 transition-colors hover:opacity-90">
              Criar Cupom
            </button>
          </form>
          
          <div className="space-y-2 pt-2 max-h-[300px] overflow-y-auto">
            {coupons.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/20">
                <div>
                  <span className="font-black text-xs text-[var(--color-primary)]">{c.codigo}</span>
                  <p className="text-sm text-[var(--color-outline)] mt-0.5">
                    {c.tipoDesconto === 'frete_gratis' ? 'Frete Grátis' : c.tipoDesconto === 'porcentagem' ? `${c.valor}% OFF` : `R$ ${c.valor.toFixed(2)} OFF`} 
                    {c.minimoCompra > 0 && ` (Min: R$ ${c.minimoCompra})`}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={c.ativo} onChange={() => onToggleCoupon(c.id, !c.ativo)} />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
