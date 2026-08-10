import React, { useState } from 'react';
import { CustomCakeConfig, CustomCakeOption } from '../../types/index';
import { Plus, Trash2, Save, Cake, Sparkles } from 'lucide-react';

interface AdminCustomCakeModuleProps {
  config: CustomCakeConfig;
  onUpdateConfig: (newConfig: CustomCakeConfig) => void;
}

export function AdminCustomCakeModule({ config, onUpdateConfig }: AdminCustomCakeModuleProps) {
  const [localConfig, setLocalConfig] = useState<CustomCakeConfig>(config);

  const handleUpdateItem = (category: keyof CustomCakeConfig, index: number, field: 'nome' | 'precoAdicional', value: string | number) => {
    const updated = { ...localConfig };
    updated[category] = [...updated[category]];
    updated[category][index] = {
      ...updated[category][index],
      [field]: field === 'precoAdicional' ? Number(value) : value
    };
    setLocalConfig(updated);
  };

  const handleAddItem = (category: keyof CustomCakeConfig) => {
    const updated = { ...localConfig };
    updated[category] = [...updated[category], { nome: 'Novo Item', precoAdicional: 0 }];
    setLocalConfig(updated);
  };

  const handleRemoveItem = (category: keyof CustomCakeConfig, index: number) => {
    const updated = { ...localConfig };
    updated[category] = updated[category].filter((_, i) => i !== index);
    setLocalConfig(updated);
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
  };

  const renderSection = (title: string, category: keyof CustomCakeConfig) => (
    <div className="bg-[var(--color-surface-container-low)] rounded-3xl p-6 border border-[var(--color-outline-variant)]/30 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/30 pb-4 mb-4">
        <h3 className="text-sm font-black text-[var(--color-on-surface)] flex items-center gap-2">
          <Cake className="w-4 h-4 text-[var(--color-primary)]" />
          {title}
        </h3>
        <button
          onClick={() => handleAddItem(category)}
          className="p-2 rounded-xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-all flex items-center justify-center"
          title="Adicionar Opção"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {localConfig[category].map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-[var(--color-surface-container-lowest)] p-3 rounded-2xl border border-[var(--color-outline-variant)]/20">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1 block">Nome da Opção</label>
              <input
                type="text"
                value={item.nome}
                onChange={(e) => handleUpdateItem(category, index, 'nome', e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-[var(--color-on-surface)] focus:outline-none"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1 block">Preço Adicional (R$)</label>
              <input
                type="number"
                value={item.precoAdicional}
                onChange={(e) => handleUpdateItem(category, index, 'precoAdicional', e.target.value)}
                min="0"
                step="0.5"
                className="w-full bg-transparent text-sm font-mono text-[var(--color-on-surface)] focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleRemoveItem(category, index)}
              className="p-2 w-full sm:w-auto mt-2 sm:mt-0 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--color-on-surface)] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
            Configurador de Bolos
          </h2>
          <p className="text-xs text-[var(--color-outline)] mt-1 max-w-xl">
            Gerencie as opções de tamanho, massas, recheios e coberturas oferecidas no construtor de bolos customizados para os clientes.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection('Tamanhos e Porções', 'tamanhos')}
        {renderSection('Opções de Massa', 'massas')}
        {renderSection('Recheios Disponíveis', 'recheios')}
        {renderSection('Coberturas e Acabamentos', 'coberturas')}
      </div>
    </div>
  );
}
