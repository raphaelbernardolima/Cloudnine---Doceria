import React, { useState, useEffect } from 'react';
import { X, Sparkles, Cake, Check, ChevronRight, Gift, MessageSquare, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { CustomCakeBuilder, CustomCakeConfig, CustomCakeOption } from '@/src/core/types/index';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';

const DEFAULT_CONFIG: CustomCakeConfig = {
  tamanhos: [
    { id: 't1', label: 'P (10 fatias)', preco_base: 95.00 },
    { id: 't2', label: 'M (20 fatias)', preco_base: 165.00 },
    { id: 't3', label: 'G (30 fatias)', preco_base: 230.00 },
    { id: 't4', label: '2 Andares (45 fatias)', preco_base: 360.00 },
  ],
  massas: [
    { id: 'm1', label: 'Pão de Ló Baunilha', preco_adicional: 0 },
    { id: 'm2', label: 'Chocolate Cacau 100%', preco_adicional: 0 },
    { id: 'm3', label: 'Red Velvet', preco_adicional: 15.00 },
    { id: 'm4', label: 'Nozes com Especiarias', preco_adicional: 15.00 },
  ],
  recheios: [
    { id: 'r1', label: 'Brigadeiro Belga', preco_adicional: 0 },
    { id: 'r2', label: 'Ninho Cremoso', preco_adicional: 0 },
    { id: 'r3', label: 'Doce de Leite com Avelã', preco_adicional: 0 },
    { id: 'r4', label: 'Cream Cheese com Frutas Vermelhas', preco_adicional: 0 },
    { id: 'r5', label: 'Pistache Bronte', preco_adicional: 25.00 },
    { id: 'r6', label: 'Mousse de Maracujá', preco_adicional: 0 },
    { id: 'r7', label: 'Geleia Caseira de Morango', preco_adicional: 0 },
    { id: 'r8', label: 'Ganache Meio Amargo', preco_adicional: 0 },
  ],
  coberturas: [
    { id: 'c1', label: 'Chantininho Aveludado', preco_adicional: 0 },
    { id: 'c2', label: 'Buttercream Suíço', preco_adicional: 0 },
    { id: 'c3', label: 'Dressed Cake Chocolate', preco_adicional: 0 },
    { id: 'c4', label: 'Espatulado Rústico', preco_adicional: 0 },
  ]
};

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
  config = DEFAULT_CONFIG
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [tamanho, setTamanho] = useState<string>(config.tamanhos[0]?.label || '');
  const [massa, setMassa] = useState<string>(config.massas[0]?.label || '');
  const [recheio1, setRecheio1] = useState<string>(config.recheios[0]?.label || '');
  const [recheio2, setRecheio2] = useState<string>('Sem 2º recheio');
  const [cobertura, setCobertura] = useState<string>(config.coberturas[0]?.label || '');
  const [mensagemBolo, setMensagemBolo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [fotoReferenciaUrl, setFotoReferenciaUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateTotalPrice = () => {
    let price = 0;
    const findPrice = (arr: CustomCakeOption[], label: string) => {
      const opt = arr.find(o => o.label === label);
      return opt ? (opt.preco_base || 0) + (opt.preco_adicional || 0) : 0;
    };

    price += findPrice(config.tamanhos, tamanho);
    price += findPrice(config.massas, massa);
    price += findPrice(config.recheios, recheio1);

    if (recheio2 && recheio2 !== 'Sem 2º recheio') {
      price += findPrice(config.recheios, recheio2);
    }

    price += findPrice(config.coberturas, cobertura);
    return price;
  };

  const handleFinish = () => {
    const finalPrice = calculateTotalPrice();
    onAddCustomCake({
      tamanho,
      massa,
      recheio1,
      recheio2: recheio2 === 'Sem 2º recheio' ? undefined : recheio2,
      cobertura,
      mensagemBolo,
      observacoes,
      precoCalculado: finalPrice,
      fotoReferenciaUrl: fotoReferenciaUrl || undefined
    });
    onClose();
  };

  const currentPrice = calculateTotalPrice();

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--color-surface) w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-(--color-outline-variant)/30 relative">
        
        {/* Header with Progress Bar */}
        <div className="bg-(--color-surface-container-lowest) z-10 shrink-0">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-(--color-primary) text-(--color-on-primary) flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-(--color-on-surface)">Montar Bolo</h2>
                <p className="text-xs text-(--color-on-surface-variant)">Passo {step} de {totalSteps}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) hover:text-(--color-on-surface) transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full h-1.5 bg-(--color-surface-container-high)">
            <div 
              className="h-full bg-(--color-primary) transition-all duration-300 ease-out" 
              style={{ width: `${progressPercentage}%` }} 
            />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 text-(--color-on-surface) custom-scrollbar bg-(--color-surface)">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Qual o tamanho ideal?</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Escolha o tamanho que melhor atende sua comemoração.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.tamanhos.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTamanho(t.label); setTimeout(handleNext, 300); }}
                    className={`p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all ${tamanho === t.label
                        ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs transform scale-[1.02]'
                        : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-base text-(--color-on-surface)">{t.label}</span>
                      {tamanho === t.label && <Check className="w-5 h-5 text-(--color-primary)" />}
                    </div>
                    <div className="text-xs opacity-80">
                      R$ {(t.preco_base || t.preco_adicional || 0).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Escolha a Massa</h3>
                <p className="text-sm text-(--color-on-surface-variant)">A base perfeita para o seu bolo.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.massas.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMassa(m.label); setTimeout(handleNext, 300); }}
                    className={`p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all ${massa === m.label
                        ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs transform scale-[1.02]'
                        : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-base text-(--color-on-surface)">{m.label}</span>
                      {massa === m.label && <Check className="w-5 h-5 text-(--color-primary)" />}
                    </div>
                    {(m.preco_adicional || 0) > 0 && (
                      <span className="block text-xs opacity-80">+ R$ {(m.preco_adicional || 0).toFixed(2)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Recheios Deliciosos</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Selecione 1 ou 2 recheios para combinar.</p>
              </div>
              
              <div className="space-y-4">
                <label className="font-extrabold text-sm text-(--color-on-surface) block bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg px-4 border border-rose-100 dark:border-rose-900/50">1º Recheio</label>
                <div className="grid grid-cols-2 gap-3">
                  {config.recheios.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRecheio1(r.label)}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${recheio1 === r.label
                          ? 'border-(--color-primary) bg-(--color-primary) text-(--color-on-primary) shadow-md'
                          : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'
                        }`}
                    >
                      <span className="block">{r.label}</span>
                      {(r.preco_adicional || 0) > 0 && <span className="block text-[10px] opacity-80 mt-1">+ R$ {(r.preco_adicional || 0).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="font-extrabold text-sm text-(--color-on-surface) block bg-orange-50 dark:bg-orange-950/30 p-2 rounded-lg px-4 border border-orange-100 dark:border-orange-900/50">2º Recheio (Opcional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRecheio2('Sem 2º recheio')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${recheio2 === 'Sem 2º recheio'
                        ? 'border-(--color-outline) bg-(--color-surface-variant) text-(--color-on-surface-variant) shadow-inner'
                        : 'border-(--color-outline-variant)/30 hover:border-(--color-outline)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-lowest)'
                      }`}
                  >
                    Sem 2º recheio
                  </button>
                  {config.recheios.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRecheio2(r.label)}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${recheio2 === r.label
                          ? 'border-(--color-primary) bg-(--color-primary) text-(--color-on-primary) shadow-md'
                          : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'
                        }`}
                    >
                      <span className="block">{r.label}</span>
                      {(r.preco_adicional || 0) > 0 && <span className="block text-[10px] opacity-80 mt-1">+ R$ {(r.preco_adicional || 0).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black">Cobertura & Acabamento</h3>
                <p className="text-sm text-(--color-on-surface-variant)">O visual exterior do seu bolo.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.coberturas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCobertura(c.label); setTimeout(handleNext, 300); }}
                    className={`p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all ${cobertura === c.label
                        ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs transform scale-[1.02]'
                        : 'border-(--color-outline-variant)/30 hover:border-(--color-primary)/50 text-(--color-on-surface-variant) bg-(--color-surface-container-low)'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-base text-(--color-on-surface)">{c.label}</span>
                      {cobertura === c.label && <Check className="w-5 h-5 text-(--color-primary)" />}
                    </div>
                    {(c.preco_adicional || 0) > 0 && (
                      <span className="block text-xs opacity-80">+ R$ {(c.preco_adicional || 0).toFixed(2)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-2xl font-black">Toques Finais</h3>
                <p className="text-sm text-(--color-on-surface-variant)">Personalize seu pedido (Opcional).</p>
              </div>

              <div className="p-4 rounded-2xl bg-(--color-primary)/5 border border-(--color-primary)/20 text-xs text-(--color-on-surface) font-medium flex flex-col gap-1">
                <span className="font-extrabold text-(--color-primary) uppercase mb-1">Resumo das Escolhas</span>
                <p><strong>Tamanho:</strong> {tamanho}</p>
                <p><strong>Massa:</strong> {massa}</p>
                <p><strong>Recheios:</strong> {recheio1} {recheio2 !== 'Sem 2º recheio' && `+ ${recheio2}`}</p>
                <p><strong>Cobertura:</strong> {cobertura}</p>
              </div>

              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <Gift className="w-4 h-4 text-(--color-primary)" />
                  <span>Mensagem Escrita no Bolo</span>
                </label>
                <input
                  type="text"
                  value={mensagemBolo}
                  onChange={(e) => setMensagemBolo(e.target.value)}
                  placeholder="Ex: Feliz Aniversário, Ana!"
                  maxLength={40}
                  className="w-full p-4 rounded-2xl border border-(--color-outline-variant)/40 bg-(--color-surface-container-lowest) text-sm focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all"
                />
                <span className="text-[10px] text-(--color-outline) text-right block">{mensagemBolo.length}/40</span>
              </div>

              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <MessageSquare className="w-4 h-4 text-(--color-primary)" />
                  <span>Observações Adicionais</span>
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Cores, tema ou detalhes específicos..."
                  rows={3}
                  className="w-full p-4 rounded-2xl border border-(--color-outline-variant)/40 bg-(--color-surface-container-lowest) text-sm focus:outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <ImageIcon className="w-4 h-4 text-(--color-primary)" />
                  <span>Foto de Inspiração</span>
                </label>
                <CloudinaryUploader
                  onImageUploaded={(url) => setFotoReferenciaUrl(url)}
                  currentImageUrl={fotoReferenciaUrl}
                  label="Anexar foto de referência"
                />
              </div>
            </div>
          )}

        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 border-t border-(--color-outline-variant)/20 bg-(--color-surface-container-lowest) shrink-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-(--color-on-surface-variant)">Total:</span>
            <span className="text-2xl font-black text-(--color-primary)">R$ {currentPrice.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="px-4 py-4 rounded-2xl bg-(--color-surface-container-high) hover:bg-(--color-surface-container-highest) text-(--color-on-surface) font-extrabold transition-all shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex-1 py-4 rounded-2xl bg-(--color-primary) hover:bg-(--color-primary)/90 text-white font-black text-lg flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <span>Próximo Passo</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-1 py-4 rounded-2xl bg-(--color-primary) hover:bg-(--color-primary)/90 text-white font-black text-lg flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <Check className="w-5 h-5" />
                <span>Finalizar Pedido</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
