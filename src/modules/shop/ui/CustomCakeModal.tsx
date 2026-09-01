import React, { useState, useEffect } from 'react';
import { X, Sparkles, Cake, Check, ChevronRight, Gift, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { CustomCakeBuilder, CustomCakeConfig, CustomCakeOption } from '@/src/core/types/index';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';

// Provide some fallback default configuration just in case
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--color-surface) w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-(--color-outline-variant)/30 relative">

        {/* Header */}
        <div className="px-6 py-5 border-b border-(--color-outline-variant)/20 flex items-center justify-between bg-(--color-surface-container-lowest) z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-(--color-primary) text-(--color-on-primary) flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-(--color-on-surface)">Bolo Sob Medida</h2>
              <p className="text-xs text-(--color-on-surface-variant)">Etapa {step} de 2 • R$ {currentPrice.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) hover:text-(--color-on-surface) transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-(--color-on-surface) custom-scrollbar bg-(--color-surface)">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in">
              {/* Tamanho */}
              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <Cake className="w-4 h-4 text-(--color-primary)" />
                  <span>Selecione o Tamanho</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {config.tamanhos.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTamanho(t.label)}
                      className={`p-3 rounded-2xl border-2 text-xs font-bold text-left transition-all ${tamanho === t.label
                          ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary) shadow-xs'
                          : 'border-(--color-outline-variant)/30 hover:border-(--color-outline) text-(--color-on-surface-variant) bg-(--color-surface-container-low)'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{t.label}</span>
                        {tamanho === t.label && <Check className="w-4 h-4 shrink-0" />}
                      </div>
                      <div className="text-[10px] mt-1 opacity-80">
                        Base: R$ {(t.preco_base || t.preco_adicional || 0).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Massa */}
              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                  <span>Massa do Bolo</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {config.massas.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMassa(m.label)}
                      className={`p-3 rounded-2xl border border-(--color-outline-variant)/30 text-xs font-bold text-left transition-all ${massa === m.label
                          ? 'bg-(--color-primary) text-(--color-on-primary) shadow-md border-transparent'
                          : 'hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) bg-(--color-surface-container-lowest)'
                        }`}
                    >
                      <span>{m.label}</span>
                      {(m.preco_adicional || 0) > 0 && <span className="block text-[10px] opacity-80 mt-0.5">+ R$ {(m.preco_adicional || 0).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recheios */}
              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>1º Recheio</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {config.recheios.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRecheio1(r.label)}
                      className={`p-3 rounded-2xl border border-(--color-outline-variant)/30 text-xs font-bold text-left transition-all ${recheio1 === r.label
                          ? 'bg-(--color-primary) text-(--color-on-primary) shadow-md border-transparent'
                          : 'hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) bg-(--color-surface-container-lowest)'
                        }`}
                    >
                      <span>{r.label}</span>
                      {(r.preco_adicional || 0) > 0 && <span className="block text-[10px] opacity-80 mt-0.5">+ R$ {(r.preco_adicional || 0).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2º Recheio (Opcional) */}
              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center justify-between text-(--color-on-surface)">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span>2º Recheio (Opcional)</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRecheio2('Sem 2º recheio')}
                    className={`p-3 rounded-2xl border border-(--color-outline-variant)/30 text-xs font-bold text-left transition-all ${recheio2 === 'Sem 2º recheio'
                        ? 'bg-(--color-surface-variant) text-(--color-on-surface-variant) shadow-inner'
                        : 'hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) bg-(--color-surface-container-lowest)'
                      }`}
                  >
                    Nenhum
                  </button>
                  {config.recheios.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRecheio2(r.label)}
                      className={`p-3 rounded-2xl border border-(--color-outline-variant)/30 text-xs font-bold text-left transition-all ${recheio2 === r.label
                          ? 'bg-(--color-primary) text-(--color-on-primary) shadow-md border-transparent'
                          : 'hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) bg-(--color-surface-container-lowest)'
                        }`}
                    >
                      <span>{r.label}</span>
                      {(r.preco_adicional || 0) > 0 && <span className="block text-[10px] opacity-80 mt-0.5">+ R$ {(r.preco_adicional || 0).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cobertura */}
              <div className="space-y-3">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <span className="w-2 h-2 rounded-full bg-white border border-gray-300"></span>
                  <span>Cobertura / Acabamento Externo</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {config.coberturas.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCobertura(c.label)}
                      className={`p-3 rounded-2xl border border-(--color-outline-variant)/30 text-xs font-bold text-left transition-all ${cobertura === c.label
                          ? 'bg-(--color-primary) text-(--color-on-primary) shadow-md border-transparent'
                          : 'hover:bg-(--color-surface-container-high) text-(--color-on-surface-variant) bg-(--color-surface-container-lowest)'
                        }`}
                    >
                      <span>{c.label}</span>
                      {(c.preco_adicional || 0) > 0 && <span className="block text-[10px] opacity-80 mt-0.5">+ R$ {(c.preco_adicional || 0).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in">
              <div className="p-4 rounded-2xl bg-(--color-surface-container-high) text-xs text-(--color-on-surface) font-medium space-y-1">
                <p><strong>Tamanho:</strong> {tamanho}</p>
                <p><strong>Massa:</strong> {massa}</p>
                <p><strong>1º Recheio:</strong> {recheio1}</p>
                {recheio2 && recheio2 !== 'Sem 2º recheio' && <p><strong>2º Recheio:</strong> {recheio2}</p>}
                <p><strong>Cobertura:</strong> {cobertura}</p>
              </div>

              <div className="space-y-4">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <ImageIcon className="w-4 h-4 text-(--color-primary)" />
                  <span>Foto de Referência (Opcional)</span>
                </label>
                <CloudinaryUploader
                  onImageUploaded={(url) => setFotoReferenciaUrl(url)}
                  currentImageUrl={fotoReferenciaUrl}
                  label="Inspiração de Decoração"
                />
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <Gift className="w-4 h-4 text-(--color-primary)" />
                  <span>Mensagem no Bolo (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={mensagemBolo}
                  onChange={(e) => setMensagemBolo(e.target.value)}
                  placeholder="Ex: Feliz Aniversário João!"
                  maxLength={40}
                  className="w-full p-3 rounded-2xl border border-(--color-outline-variant)/40 bg-(--color-surface-container-lowest) text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) transition-all"
                />
                <span className="text-[10px] text-(--color-outline) text-right block">{mensagemBolo.length}/40</span>
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-sm flex items-center space-x-2 text-(--color-on-surface)">
                  <MessageSquare className="w-4 h-4 text-(--color-primary)" />
                  <span>Detalhes de Decoração (Opcional)</span>
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva cores, tema ou detalhes específicos para a decoração..."
                  rows={3}
                  className="w-full p-3 rounded-2xl border border-(--color-outline-variant)/40 bg-(--color-surface-container-lowest) text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary) transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-(--color-outline-variant)/20 bg-(--color-surface-container-lowest) flex justify-between items-center shrink-0">
          {step === 1 ? (
            <>
              <div className="text-(--color-on-surface)">
                <span className="text-xs font-bold text-(--color-on-surface-variant) block">Total Estimado</span>
                <span className="text-xl font-black text-(--color-primary)">R$ {currentPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-extrabold text-sm flex items-center space-x-2 shadow-md hover:opacity-95 transition-all"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-2xl text-(--color-on-surface-variant) font-bold text-xs sm:text-sm hover:bg-(--color-surface-container-high) transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-3 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-extrabold text-sm flex items-center space-x-2 shadow-md hover:opacity-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Adicionar ao Carrinho</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
