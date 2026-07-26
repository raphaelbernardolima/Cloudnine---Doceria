import React, { useState } from 'react';
import { X, Sparkles, Cake, Check, ChevronRight, Gift, MessageSquare } from 'lucide-react';
import { CustomCakeBuilder } from '../types';

interface CustomCakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomCake: (cake: CustomCakeBuilder) => void;
}

export const CustomCakeModal: React.FC<CustomCakeModalProps> = ({
  isOpen,
  onClose,
  onAddCustomCake
}) => {
  const [tamanho, setTamanho] = useState<CustomCakeBuilder['tamanho']>('M (20 fatias)');
  const [massa, setMassa] = useState<CustomCakeBuilder['massa']>('Chocolate Cacau 100%');
  const [recheio1, setRecheio1] = useState<CustomCakeBuilder['recheio1']>('Brigadeiro Belga');
  const [recheio2, setRecheio2] = useState<CustomCakeBuilder['recheio2']>('Ninho Cremoso');
  const [cobertura, setCobertura] = useState<CustomCakeBuilder['cobertura']>('Chantininho Aveludado');
  const [mensagemBolo, setMensagemBolo] = useState('');
  const [observacoes, setObservacoes] = useState('');

  if (!isOpen) return null;

  // Price base logic
  const basePrices: Record<CustomCakeBuilder['tamanho'], number> = {
    'P (10 fatias)': 95.00,
    'M (20 fatias)': 165.00,
    'G (30 fatias)': 230.00,
    '2 Andares (45 fatias)': 360.00,
  };

  const calculateTotalPrice = () => {
    let price = basePrices[tamanho];
    if (massa === 'Nozes com Especiarias' || massa === 'Red Velvet') price += 15.00;
    if (recheio1 === 'Pistache Bronte') price += 25.00;
    if (recheio2 && recheio2 !== 'Sem 2º recheio') price += 20.00;
    return price;
  };

  const handleFinish = () => {
    const finalPrice = calculateTotalPrice();
    onAddCustomCake({
      tamanho,
      massa,
      recheio1,
      recheio2,
      cobertura,
      mensagemBolo,
      observacoes,
      precoCalculado: finalPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[var(--color-surface)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-outline-variant)]/40 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Monte seu Bolo dos Sonhos Cloudnine
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h2>
              <p className="text-xs opacity-85">Personalização sob medida com ingredientes selecionados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-surface-container-lowest)]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* Step 1: Tamanho */}
          <div className="space-y-2">
            <label className="font-bold text-sm text-[var(--color-on-surface)] flex items-center justify-between">
              <span>1. Escolha o Tamanho do Bolo</span>
              <span className="text-xs text-[var(--color-primary)] font-semibold">Tamanho Padrão M3</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['P (10 fatias)', 'M (20 fatias)', 'G (30 fatias)', '2 Andares (45 fatias)'] as CustomCakeBuilder['tamanho'][]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTamanho(t)}
                  className={`p-3 rounded-2xl border font-bold text-left transition-all ${
                    tamanho === t
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-xs'
                      : 'bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container-high)]'
                  }`}
                >
                  <span className="block">{t}</span>
                  <span className="text-[10px] opacity-80 block font-normal mt-0.5">A partir de R$ {basePrices[t].toFixed(2).replace('.', ',')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Massa */}
          <div className="space-y-2">
            <label className="font-bold text-sm text-[var(--color-on-surface)]">
              2. Escolha a Massa
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['Pão de Ló Baunilha', 'Chocolate Cacau 100%', 'Red Velvet', 'Nozes com Especiarias'] as CustomCakeBuilder['massa'][]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMassa(m)}
                  className={`p-3 rounded-2xl border font-bold text-left transition-all ${
                    massa === m
                      ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] border-transparent shadow-xs'
                      : 'bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container-high)]'
                  }`}
                >
                  <span>{m}</span>
                  {(m === 'Nozes com Especiarias' || m === 'Red Velvet') && (
                    <span className="text-[9px] block text-amber-500 font-normal">+R$ 15,00</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Recheio 1 e Recheio 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-bold text-sm text-[var(--color-on-surface)]">
                3. Primeiro Recheio Principal
              </label>
              <select
                value={recheio1}
                onChange={(e) => setRecheio1(e.target.value as CustomCakeBuilder['recheio1'])}
                className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 font-semibold text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="Brigadeiro Belga">Brigadeiro Belga 70%</option>
                <option value="Ninho Cremoso">Leite Ninho Cremoso</option>
                <option value="Pistache Bronte">Pistache Puro Bronte (+R$ 25,00)</option>
                <option value="Doce de Leite com Avelã">Doce de Leite com Avelãs</option>
                <option value="Cream Cheese com Frutas Vermelhas">Cream Cheese & Frutas Vermelhas</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm text-[var(--color-on-surface)]">
                4. Segundo Recheio (Opcional)
              </label>
              <select
                value={recheio2}
                onChange={(e) => setRecheio2(e.target.value as CustomCakeBuilder['recheio2'])}
                className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 font-semibold text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="Sem 2º recheio">Sem 2º recheio (Camada única dupla)</option>
                <option value="Ganache Meio Amargo">Ganache Meio Amargo Belga (+R$ 20,00)</option>
                <option value="Mousse de Maracujá">Mousse de Maracujá Aerado (+R$ 20,00)</option>
                <option value="Geleia Caseira de Morango">Geleia Caseira de Morango (+R$ 20,00)</option>
              </select>
            </div>
          </div>

          {/* Step 4: Cobertura & Finalização */}
          <div className="space-y-2">
            <label className="font-bold text-sm text-[var(--color-on-surface)]">
              5. Estilo de Cobertura
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['Chantininho Aveludado', 'Buttercream Suíço', 'Dressed Cake Chocolate', 'Espatulado Rústico'] as CustomCakeBuilder['cobertura'][]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCobertura(c)}
                  className={`p-3 rounded-2xl border font-bold text-left transition-all ${
                    cobertura === c
                      ? 'bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] border-[var(--color-tertiary)]'
                      : 'bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container-high)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Frase no Bolo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-xs text-[var(--color-on-surface)] block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                Escrita/Frase no Bolo (Glacê)
              </label>
              <input
                type="text"
                value={mensagemBolo}
                onChange={(e) => setMensagemBolo(e.target.value)}
                placeholder="Ex: Parabéns Clara! / Te Amo 3000 / 30 Anos"
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 text-xs text-[var(--color-on-surface)] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-[var(--color-on-surface)] block mb-1 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                Instruções de Decoração ou Velas
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Cores em degradê rosa, incluir topo de papel dourado"
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 text-xs text-[var(--color-on-surface)] focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Footer calculated total */}
        <div className="p-5 bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)]/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--color-outline)] font-bold uppercase block">Valor Total do Bolo Personalizado</span>
            <span className="text-xl font-black text-[var(--color-primary)]">
              R$ {calculateTotalPrice().toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center space-x-2 shadow-md hover:opacity-95 transition-all"
          >
            <span>Adicionar Bolo à Sacola</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
