import { formatCurrency } from '@/src/core/utils/formatters';
import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkle, Cake, Check, CaretRight, Gift, ChatCircle, Image as ImageIcon, ArrowLeft, Warning, Plus } from '@phosphor-icons/react';
import { CustomCakeBuilder, CustomCakeConfig, CustomCakeOption } from '@/src/core/types/index';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';
import { useUIStore } from '@/src/core/store/useUIStore';

interface CustomCakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomCake: (cake: CustomCakeBuilder) => void;
  config?: CustomCakeConfig;
}

export const CustomCakeModal: React.FC<CustomCakeModalProps> = ({
  isOpen,
  onClose,
  onAddCustomCake,
  config = { tamanhos: [], massas: [], recheios: [], coberturas: [], extras: [] }
}) => {
  const { showToast } = useUIStore();
  const [step, setStep] = useState(1);
  
  // State for selections
  const [tamanho, setTamanho] = useState<string>('');
  const [massa, setMassa] = useState<string>('');
  const [recheios, setRecheios] = useState<string[]>([]);
  const [cobertura, setCobertura] = useState<string>('');
  const [corCobertura, setCorCobertura] = useState<string>('');
  const [extras, setExtras] = useState<string[]>([]);
  const [mensagemBolo, setMensagemBolo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [fotoReferenciaUrl, setFotoReferenciaUrl] = useState<string>('');

  // Selected Option Objects
  const selectedSizeOpt = config.tamanhos?.find(t => t.label === tamanho);
  const selectedMassaOpt = config.massas?.find(m => m.label === massa);
  
  const maxRecheios = selectedSizeOpt?.max_recheios || 1;
  const priceMultiplier = selectedSizeOpt?.multiplicador_preco || 1;
  const charLimit = selectedSizeOpt?.limite_caracteres || 20;

  // Total steps: 1(Size) + 1(Batter) + 1(Fillings) + 1(Frosting/Color) + 1(Extras) + 1(Final)
  const totalSteps = 6;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (config?.tamanhos?.length) setTamanho(config.tamanhos[0].label);
      if (config?.massas?.length) setMassa(config.massas[0].label);
      setRecheios([]);
      if (config?.coberturas?.length) setCobertura(config.coberturas[0].label);
      setCorCobertura('');
      setExtras([]);
      setMensagemBolo('');
      setObservacoes('');
      setFotoReferenciaUrl('');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const isConfigEmpty = !config || (!config.tamanhos?.length && !config.massas?.length && !config.recheios?.length && !config.coberturas?.length);

  if (isConfigEmpty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-(--color-surface) w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-(--color-outline-variant)/30 relative p-8 text-center items-center">
          <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
            <Cake className="w-12 h-12 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-(--color-on-surface) mb-3">Ops! Sem opções disponíveis</h3>
          <p className="text-sm text-(--color-on-surface-variant) mb-8">
            No momento, não temos nenhuma opção de bolo personalizado disponível para encomenda. 
          </p>
          <button onClick={onClose} className="w-full py-4 rounded-2xl bg-(--color-primary) text-white font-black text-lg flex items-center justify-center shadow-lg transition-all hover:bg-(--color-primary)/90">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const checkAllergenConflicts = () => {
    const selectedOptions = [
      selectedMassaOpt,
      ...recheios.map(r => config.recheios?.find(x => x.label === r)),
      config.coberturas?.find(c => c.label === cobertura)
    ].filter(Boolean) as CustomCakeOption[];

    const hasGluten = selectedOptions.some(o => o.tags_alergenicos?.includes('Contém Glúten'));
    const isGlutenFree = selectedOptions.some(o => o.tags_alergenicos?.includes('Zero Glúten') || o.label.toLowerCase().includes('sem glúten'));
    
    if (hasGluten && isGlutenFree) {
      showToast('Atenção: Você misturou uma opção Zero Glúten com outra que Contém Glúten. Há risco de contaminação cruzada!');
    }
  };

  const calculateTotalPrice = () => {
    let base = selectedSizeOpt?.preco_base || 0;
    let multiplier = selectedSizeOpt?.multiplicador_preco || 1;

    let additives = 0;
    additives += (selectedMassaOpt?.preco_adicional || 0);
    
    recheios.forEach(r => {
      const opt = config.recheios?.find(x => x.label === r);
      if (opt) additives += (opt.preco_adicional || 0);
    });

    const cobOpt = config.coberturas?.find(c => c.label === cobertura);
    if (cobOpt) additives += (cobOpt.preco_adicional || 0);

    // Extras don't usually scale with multiplier, they are fixed per unit.
    let extrasTotal = 0;
    extras.forEach(ex => {
      const opt = config.extras?.find(x => x.label === ex);
      if (opt) extrasTotal += (opt.preco_adicional || 0);
    });

    return base + (additives * multiplier) + extrasTotal;
  };

  const handleFinish = () => {
    onAddCustomCake({
      tamanho,
      massa,
      recheio1: recheios[0] || 'Sem recheio',
      recheio2: recheios[1],
      recheio3: recheios[2],
      cobertura,
      corCobertura,
      extras,
      mensagemBolo,
      observacoes,
      precoCalculado: calculateTotalPrice(),
      fotoReferenciaUrl: fotoReferenciaUrl || undefined
    });
    onClose();
  };

  const currentPrice = calculateTotalPrice();
  const maxDaysNotice = Math.max(
    selectedSizeOpt?.dias_antecedencia || 0,
    selectedMassaOpt?.dias_antecedencia || 0,
    ...recheios.map(r => config.recheios?.find(x => x.label === r)?.dias_antecedencia || 0)
  );

  const handleNext = () => {
    if (step === 3 && recheios.length === 0 && maxRecheios > 0) {
      showToast('Selecione pelo menos um recheio!');
      return;
    }
    if (step === 3) checkAllergenConflicts();
    setStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));
  const progressPercentage = (step / totalSteps) * 100;

  const toggleRecheio = (label: string) => {
    if (recheios.includes(label)) {
      setRecheios(recheios.filter(r => r !== label));
    } else {
      if (recheios.length < maxRecheios) {
        setRecheios([...recheios, label]);
      } else {
        showToast(`Este tamanho permite no máximo ${maxRecheios} recheios.`);
      }
    }
  };

  const toggleExtra = (label: string) => {
    if (extras.includes(label)) {
      setExtras(extras.filter(e => e !== label));
    } else {
      setExtras([...extras, label]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--color-surface) w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-(--color-outline-variant)/30 relative">
        
        <div className="bg-(--color-surface-container-lowest) z-10 shrink-0">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-(--color-primary) text-(--color-on-primary) flex items-center justify-center shadow-md">
                <Sparkle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-(--color-on-surface)">Montar Bolo</h2>
                <p className="text-xs text-(--color-on-surface-variant)">Passo {step} de {totalSteps}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) hover:text-(--color-on-surface) transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full h-1.5 bg-(--color-surface-container-high)">
            <div className="h-full bg-(--color-primary) transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-(--color-on-surface) custom-scrollbar bg-(--color-surface)">
          
          {/* STEP 1: SIZE */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Estrutura e Tamanho</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Isso define o rendimento e o limite de recheios do bolo.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.tamanhos?.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTamanho(t.label); setTimeout(handleNext, 300); }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${tamanho === t.label ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs transform scale-[1.02]' : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-black text-(--color-on-surface)">{t.label}</span>
                      {tamanho === t.label && <Check className="w-5 h-5 text-(--color-primary)" />}
                    </div>
                    <div className="text-xs font-bold mb-2">
                      {formatCurrency(t.preco_base || 0)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.fatias && <span className="bg-(--color-surface-variant) text-(--color-on-surface) px-2 py-0.5 rounded text-[10px] font-bold">~{t.fatias} Fatias</span>}
                      {t.max_recheios && <span className="bg-(--color-primary)/20 text-(--color-primary) px-2 py-0.5 rounded text-[10px] font-bold">Até {t.max_recheios} Recheios</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: BATTER */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Massa</h3>
                <p className="text-sm text-(--color-on-surface-variant)">A base do sabor. Ingredientes Premium adicionam ao valor base.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.massas?.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMassa(m.label); setTimeout(handleNext, 300); }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${massa === m.label ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs transform scale-[1.02]' : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'}`}
                  >
                    {m.is_premium && <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-bl-lg">PREMIUM</div>}
                    <div className="flex justify-between items-center mb-1 mt-1">
                      <span className="text-base font-bold text-(--color-on-surface)">{m.label}</span>
                      {massa === m.label && <Check className="w-5 h-5 text-(--color-primary)" />}
                    </div>
                    {(m.preco_adicional || 0) > 0 && (
                      <span className="block text-xs font-bold opacity-80">+ {formatCurrency((m.preco_adicional || 0) * priceMultiplier)}</span>
                    )}
                    {m.tags_alergenicos && m.tags_alergenicos.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {m.tags_alergenicos.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 text-red-600 bg-red-500/10">{tag}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: FILLINGS */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-2xl font-black">Recheios</h3>
                <p className="text-sm text-(--color-on-surface-variant)">
                  Seu bolo {tamanho} suporta <strong>até {maxRecheios} {maxRecheios === 1 ? 'recheio' : 'recheios'}</strong>.
                </p>
                <div className="inline-flex bg-(--color-surface-variant) px-3 py-1 rounded-full text-xs font-bold text-(--color-on-surface)">
                  Selecionados: {recheios.length} / {maxRecheios}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.recheios?.map((r) => {
                  const isSelected = recheios.includes(r.label);
                  const isDisabled = !isSelected && recheios.length >= maxRecheios;
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggleRecheio(r.label)}
                      disabled={isDisabled}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative ${isDisabled ? 'opacity-50 cursor-not-allowed border-(--color-outline-variant)/10' : isSelected ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs' : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 bg-(--color-surface-container-low)'}`}
                    >
                      {r.is_premium && <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-bl-lg">PREMIUM</div>}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-base font-bold ${isSelected ? 'text-(--color-primary)' : 'text-(--color-on-surface)'}`}>{r.label}</span>
                        {isSelected && <Check className="w-5 h-5 text-(--color-primary)" />}
                      </div>
                      {(r.preco_adicional || 0) > 0 && (
                        <span className="block text-xs font-bold opacity-80">+ {formatCurrency((r.preco_adicional || 0) * priceMultiplier)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: FROSTING & COLORS */}
          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Cobertura & Cor</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Finalize a estética externa.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.coberturas?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCobertura(c.label); setCorCobertura(c.color_hex || ''); }}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${cobertura === c.label ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs transform scale-[1.02]' : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 bg-(--color-surface-container-low)'}`}
                  >
                    <div className="flex justify-between items-center w-full mb-2">
                      <span className="text-base font-bold text-(--color-on-surface)">{c.label}</span>
                      {cobertura === c.label && <Check className="w-5 h-5 text-(--color-primary)" />}
                    </div>
                    <div className="flex items-center gap-3">
                      {c.color_hex && (
                         <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c.color_hex }}></div>
                      )}
                      {(c.preco_adicional || 0) > 0 && (
                        <span className="text-xs font-bold opacity-80">+ {formatCurrency((c.preco_adicional || 0) * priceMultiplier)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: EXTRAS (Upsell) */}
          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Adicionais Extras</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Eleve a experiência (Opcional).</p>
              </div>
              
              <div className="flex flex-col gap-3">
                {config.extras?.length === 0 && (
                   <div className="text-center text-(--color-on-surface-variant) p-6">Nenhum adicional extra configurado no momento.</div>
                )}
                {config.extras?.map((ex) => {
                  const isSelected = extras.includes(ex.label);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => toggleExtra(ex.label)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${isSelected ? 'border-(--color-primary) bg-(--color-primary)/10' : 'border-(--color-outline-variant)/30 bg-(--color-surface-container-low)'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-(--color-primary) border-(--color-primary)' : 'border-(--color-outline-variant)'}`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-base font-bold text-(--color-on-surface)">{ex.label}</span>
                      </div>
                      {(ex.preco_adicional || 0) > 0 && (
                        <span className="text-sm font-black text-(--color-primary)">+ {formatCurrency(ex.preco_adicional || 0)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: FINAL TOUCHES */}
          {step === 6 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pb-10">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-2xl font-black">Toques Finais</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Personalize seu pedido.</p>
              </div>

              {maxDaysNotice > 0 && (
                 <div className="bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 p-3 rounded-xl text-xs font-bold flex gap-2 items-center mb-4">
                   <span>ℹ️</span> Este bolo requer no mínimo {maxDaysNotice} {maxDaysNotice === 1 ? 'dia' : 'dias'} de antecedência para produção devido às suas escolhas.
                 </div>
              )}

              <div className="p-4 rounded-2xl bg-(--color-primary)/5 border border-(--color-primary)/20 text-xs text-(--color-on-surface) flex flex-col gap-1">
                <span className="font-extrabold text-(--color-primary) uppercase mb-2">Engenharia do Bolo</span>
                <p className="flex justify-between"><strong>Tamanho:</strong> <span>{tamanho}</span></p>
                <p className="flex justify-between"><strong>Massa:</strong> <span>{massa}</span></p>
                <p className="flex flex-col">
                  <strong>Recheios ({recheios.length}):</strong> 
                  <span className="text-(--color-on-surface-variant)">{recheios.join(' + ') || 'Nenhum'}</span>
                </p>
                <p className="flex justify-between mt-1"><strong>Cobertura:</strong> <span>{cobertura}</span></p>
                {extras.length > 0 && (
                  <p className="flex flex-col mt-1">
                    <strong>Extras:</strong> 
                    <span className="text-(--color-primary) font-bold">{extras.join(', ')}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-sm flex items-center justify-between text-(--color-on-surface)">
                  <span className="flex items-center gap-2"><Gift className="w-4 h-4 text-(--color-primary)" /> Mensagem Escrita no Bolo</span>
                  <span className="text-[10px] bg-(--color-surface-variant) px-2 py-0.5 rounded-full">{mensagemBolo.length}/{charLimit}</span>
                </label>
                <input
                  type="text"
                  value={mensagemBolo}
                  onChange={(e) => setMensagemBolo(e.target.value)}
                  placeholder="Ex: Feliz Aniversário!"
                  maxLength={charLimit}
                  className="w-full p-4 rounded-2xl border border-(--color-outline-variant)/40 bg-(--color-surface-container-lowest) text-sm focus:outline-none focus:border-(--color-primary) transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-sm flex items-center gap-2 text-(--color-on-surface)">
                  <ImageIcon className="w-4 h-4 text-(--color-primary)" />
                  <span>Foto de Inspiração (Referência)</span>
                </label>
                <CloudinaryUploader
                  onImageUploaded={(url) => setFotoReferenciaUrl(url)}
                  currentImageUrl={fotoReferenciaUrl}
                  label="Anexar foto"
                />
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <ChatCircle className="w-4 h-4 text-(--color-primary)" />
                  <span>Observações para o confeiteiro</span>
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value.slice(0, 200))}
                  placeholder="Detalhes visuais, restrições..."
                  rows={2}
                  maxLength={200}
                  className="w-full p-4 rounded-2xl border border-(--color-outline-variant)/40 bg-(--color-surface-container-lowest) text-sm focus:outline-none focus:border-(--color-primary) transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-(--color-outline-variant)/20 bg-(--color-surface-container-lowest) shrink-0 shadow-lg relative z-20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-(--color-on-surface-variant)">Total Estimado:</span>
            <span className="text-2xl font-black text-(--color-primary)">{formatCurrency(currentPrice)}</span>
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={handlePrev} className="px-4 py-4 rounded-2xl bg-(--color-surface-container-high) hover:bg-(--color-surface-container-highest) text-(--color-on-surface) font-extrabold transition-all shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {step < totalSteps ? (
              <button onClick={handleNext} className="flex-1 py-4 rounded-2xl bg-(--color-primary) hover:bg-(--color-primary)/90 text-white font-black text-lg flex items-center justify-center space-x-2 shadow-lg transition-all">
                <span>Próximo Passo</span>
                <CaretRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handleFinish} className="flex-1 py-4 rounded-2xl bg-(--color-primary) hover:bg-(--color-primary)/90 text-white font-black text-lg flex items-center justify-center space-x-2 shadow-lg transition-all">
                <Check className="w-5 h-5" />
                <span>Adicionar ao Carrinho</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
