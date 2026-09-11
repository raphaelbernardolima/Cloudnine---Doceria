import { formatCurrency } from '@/src/core/utils/formatters';
import React, { useState, useRef } from 'react';
import { Gift, Ticket, FloppyDisk, WarningCircle, Image as ImageIcon, Link as LinkIcon, Trash, Upload, CaretRight } from '@phosphor-icons/react';
import { updateStoreConfig } from '@/src/core/services/supabase';
import { Coupon, LoyaltySettings, Banner } from '@/src/core/types/index';
import { useDataStore } from '@/src/core/store/useDataStore';

interface AdminMarketingModuleProps {
  coupons: Coupon[];
  loyaltySettings: LoyaltySettings;
  onUpdateLoyalty: (settings: LoyaltySettings) => void;
  onAddCoupon: (c: Omit<Coupon, 'id'>) => void;
  onToggleCoupon: (id: string, ativo: boolean) => void;
}

export const AdminMarketingModule: React.FC<AdminMarketingModuleProps> = ({ coupons, loyaltySettings, onUpdateLoyalty, onAddCoupon, onToggleCoupon }) => {
  const { banners, setBanners, products } = useDataStore();
  const [pontosReal, setPontosReal] = useState(loyaltySettings.pontosPorReal.toString());
  const [valorResgate, setValorResgate] = useState(loyaltySettings.valorResgatePorPonto.toString());
  const [isSaving, setIsSaving] = useState(false);

  // New Banner form
  const [bImage, setBImage] = useState('');
  const [bLink, setBLink] = useState('');
  const [bCtaText, setBCtaText] = useState('');
  const [bLayout, setBLayout] = useState<'classic' | 'glassmorphism' | 'clean'>('classic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande! Escolha uma imagem de até 2MB para não pesar o site.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // New Coupon form
  const [cCodigo, setCCodigo] = useState('');
  const [cTipo, setCTipo] = useState<'porcentagem'|'fixo'|'frete_gratis'>('porcentagem');
  const [cValor, setCValor] = useState('');
  const [cMinimo, setCMinimo] = useState('');

  const handleSaveLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const pr = parseInt(pontosReal) || 1;
    const vr = parseFloat(valorResgate) || 0.05;

    await updateStoreConfig({
      pontos_por_real: pr,
      valor_resgate_por_ponto: vr
    });

    onUpdateLoyalty({
      pontosPorReal: pr,
      valorResgatePorPonto: vr
    });
    
    setIsSaving(false);
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bImage) return;
    const newBanner: Banner = {
      id: Math.random().toString(36).substr(2, 9),
      image_url: bImage,
      link: bLink,
      cta_text: bCtaText,
      ativo: true,
      layout_type: bLayout
    };
    const updated = [newBanner, ...banners];
    setBanners(updated);
    setBImage('');
    setBLink('');
    setBCtaText('');
    setBLayout('classic');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Save to DB
    updateStoreConfig({ banners: updated }).catch(console.error);
  };

  const handleToggleBanner = (id: string, ativo: boolean) => {
    const updated = banners.map(b => b.id === id ? { ...b, ativo } : b);
    setBanners(updated);
    updateStoreConfig({ banners: updated }).catch(console.error);
  };

  const handleDeleteBanner = (id: string) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    updateStoreConfig({ banners: updated }).catch(console.error);
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
              <FloppyDisk className="w-4 h-4" /> {isSaving ? 'Salvando...' : 'Salvar Regras'}
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
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
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
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
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
                    {c.tipoDesconto === 'frete_gratis' ? 'Frete Grátis' : c.tipoDesconto === 'porcentagem' ? `${c.valor}% OFF` : `${formatCurrency(c.valor)} OFF`} 
                    {c.minimoCompra > 0 && ` (Min: R$ ${c.minimoCompra})`}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={c.ativo} onChange={() => onToggleCoupon(c.id, !c.ativo)} />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface-container-lowest)] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Banners Manager */}
      <div className="p-6 bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
          Banners Promocionais (Loja)
        </h3>
        
        <form onSubmit={handleAddBanner} className="space-y-4 pb-6 border-b border-[var(--color-outline-variant)]/20">
          
          {/* Layout Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-2 block">Layout do Banner</label>
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => setBLayout('classic')}
                className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${bLayout === 'classic' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'}`}
              >
                Clássico (Botão no Canto)
              </button>
              <button 
                type="button"
                onClick={() => setBLayout('glassmorphism')}
                className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${bLayout === 'glassmorphism' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'}`}
              >
                Glass (Vidro Centralizado)
              </button>
              <button 
                type="button"
                onClick={() => setBLayout('clean')}
                className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${bLayout === 'clean' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'}`}
              >
                Limpo (Apenas Imagem)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Image Upload Area */}
            <div className="lg:col-span-2">
              <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Imagem do Banner</label>
              <div className="flex flex-col space-y-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  ref={fileInputRef}
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-[var(--color-primary)]/50 rounded-xl bg-[var(--color-primary)]/5 text-[var(--color-primary)] flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-primary)]/10 transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-bold">Fazer Upload da Imagem</span>
                  <span className="text-[10px] opacity-70">Recomendado: Proporção Larga (ex: 1200x400). Max: 2MB.</span>
                </button>
                <input 
                  value={bImage} 
                  onChange={e=>setBImage(e.target.value)} 
                  placeholder="Ou cole uma URL (https://...)" 
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs font-medium" 
                />
              </div>
            </div>

            {bLayout !== 'clean' && (
              <div>
                <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Botão de Ação (CTA)</label>
                <input required value={bCtaText} onChange={e=>setBCtaText(e.target.value)} placeholder="Ex: Comprar Agora" className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs font-medium" />
                <p className="text-[10px] text-[var(--color-outline)] mt-1">O que vai estar escrito no botão.</p>
              </div>
            )}
            
            <div className={bLayout === 'clean' ? 'lg:col-span-2' : ''}>
              <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-1 block">Ação ao Clicar (Para onde o cliente vai?)</label>
              <select 
                value={bLink} 
                onChange={e=>setBLink(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs font-medium cursor-pointer"
              >
                <option value="">Apenas Visual (Nenhuma ação)</option>
                <optgroup label="Ações Especiais">
                  <option value="/?action=custom-cake">🎂 Abrir Montador de Bolo Personalizado</option>
                  <option value="/?action=loyalty">⭐ Abrir Programa de Fidelidade</option>
                </optgroup>
                <optgroup label="Filtrar por Categoria">
                  <option value="/?category=Brigadeiros">🍫 Categoria: Brigadeiros</option>
                  <option value="/?category=Bolos de Pote">🧁 Categoria: Bolos de Pote</option>
                  <option value="/?category=Macarons">🍬 Categoria: Macarons</option>
                  <option value="/?category=Tortas & Mousse">🥧 Categoria: Tortas & Mousse</option>
                  <option value="/?category=Kits & Presentes">🎁 Categoria: Kits & Presentes</option>
                </optgroup>
                <optgroup label="Abrir Produto Específico">
                  {products.filter(p => p.ativo).map(p => (
                    <option key={p.id} value={`/?product=${p.id}`}>📦 Produto: {p.nome}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Live Preview Section */}
          {bImage && (
            <div className="mt-4 p-4 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-2xl">
              <label className="text-xs font-bold uppercase text-[var(--color-outline)] mb-2 block">Live Preview (Como ficará na loja):</label>
              
              <div className="relative aspect-[21/9] sm:aspect-[3/1] bg-black/5 rounded-[24px] overflow-hidden shadow-sm group">
                <img src={bImage} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                
                {/* Classic Layout Preview */}
                {bLayout === 'classic' && bCtaText && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                      <button className="px-4 py-1.5 bg-[var(--color-primary)] text-white font-bold rounded-xl text-xs shadow-md">
                        {bCtaText}
                      </button>
                    </div>
                  </>
                )}

                {/* Glassmorphism Layout Preview */}
                {bLayout === 'glassmorphism' && bCtaText && (
                  <>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="bg-[var(--color-surface-container-lowest)]/20 backdrop-blur-md border border-white/30 p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full max-w-[200px]">
                        <h4 className="text-white font-black text-sm mb-2 drop-shadow-md">Oferta</h4>
                        <button className="w-full px-2 py-1 bg-[var(--color-surface-container-lowest)] text-black font-bold rounded-lg text-[10px]">
                          {bCtaText}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={!bImage || (bLayout !== 'clean' && !bCtaText)} className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            Salvar e Publicar Banner
          </button>
        </form>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {banners.map(b => (
            <div key={b.id} className={`relative rounded-2xl overflow-hidden border ${b.ativo ? 'border-[var(--color-primary)]' : 'border-[var(--color-outline-variant)]/20'} bg-[var(--color-surface-container-high)]`}>
              <div className="h-32 w-full">
                <img src={b.image_url} alt="Banner" className={`w-full h-full object-cover ${!b.ativo && 'opacity-50 grayscale'}`} />
              </div>
              <div className="p-3 flex items-center justify-between">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={b.ativo} onChange={() => handleToggleBanner(b.id, !b.ativo)} />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface-container-lowest)] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
                <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-[var(--color-outline)]">
              Nenhum banner cadastrado. Adicione banners para exibir na página inicial.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
