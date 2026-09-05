import React, { useState, useEffect } from 'react';
import { Store, Save, Phone, Mail, Globe, MapPin, DollarSign, Clock, CheckCircle2, AlertCircle, Loader2, Power, BookOpen, Image as ImageIcon } from 'lucide-react';
import { getStoreConfig, updateStoreConfig } from '@/src/core/services/supabase';
import { useStore } from '@/src/core/store/useStore';

interface AdminStoreConfigModuleProps {
  showToast: (msg: string) => void;
  onStoreConfigUpdated?: (config: any) => void;
}

export const AdminStoreConfigModule: React.FC<AdminStoreConfigModuleProps> = ({ showToast, onStoreConfigUpdated }) => {
  const { storeInfo, setStoreInfo } = useStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nomeLoja, setNomeLoja] = useState('Cloudnine Doceria');
  const [historiaLoja, setHistoriaLoja] = useState(storeInfo.historia_loja);
  const [fotosLoja, setFotosLoja] = useState(storeInfo.fotos_loja.join(', '));
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200');
  const [telefone, setTelefone] = useState('(13) 98874-7014');
  const [email, setEmail] = useState('contato@cloudninedoceria.com.br');
  const [lojaAberta, setLojaAberta] = useState(true);
  const [pedidoMinimo, setPedidoMinimo] = useState(30);
  const [raioEntregaKm, setRaioEntregaKm] = useState(15);
  const [horarios, setHorarios] = useState({
    segunda: '09:00 - 19:00',
    terca: '09:00 - 19:00',
    quarta: '09:00 - 19:00',
    quinta: '09:00 - 19:00',
    sexta: '09:00 - 20:00',
    sabado: '09:00 - 20:00',
    domingo: '10:00 - 16:00'
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getStoreConfig();
      if (data) {
        if (data.nome_loja) setNomeLoja(data.nome_loja);
        if (data.logo_url) setLogoUrl(data.logo_url);
        if (data.telefone) setTelefone(data.telefone);
        if (data.email) setEmail(data.email);
        if (typeof data.loja_aberta === 'boolean') setLojaAberta(data.loja_aberta);
        if (data.pedido_minimo !== undefined) setPedidoMinimo(Number(data.pedido_minimo));
        if (data.raio_entrega_km !== undefined) setRaioEntregaKm(Number(data.raio_entrega_km));
        if (data.horarios_funcionamento) setHorarios(data.horarios_funcionamento);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      nome_loja: nomeLoja,
      logo_url: logoUrl,
      telefone: telefone,
      email: email,
      loja_aberta: lojaAberta,
      pedido_minimo: Number(pedidoMinimo),
      raio_entrega_km: Number(raioEntregaKm),
      horarios_funcionamento: horarios
    };

    const res = await updateStoreConfig(payload);
    
    // Also update Zustand store info
    setStoreInfo({
      historia_loja: historiaLoja,
      fotos_loja: fotosLoja.split(',').map(s => s.trim()).filter(Boolean)
    });

    setSaving(false);

    if (res.success) {
      showToast('Configurações da loja salvas com sucesso!');
      if (onStoreConfigUpdated) onStoreConfigUpdated(payload);
    } else {
      showToast('Erro ao salvar: ' + (res.error || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-container)] px-2.5 py-1 rounded-md">
            Painel de Configuração
          </span>
          <h3 className="text-2xl font-black text-[var(--color-on-surface)] mt-1 flex items-center gap-2">
            <Store className="w-6 h-6 text-[var(--color-primary)]" />
            Configurações da Loja
          </h3>
          <p className="text-xs text-[var(--color-outline)] mt-0.5">
            Gerencie o nome, status de funcionamento, WhatsApp, raio de entrega e horários da sua confeitaria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLojaAberta(!lojaAberta)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
              lojaAberta 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            <Power className="w-4 h-4" />
            {lojaAberta ? 'Loja Aberta para Pedidos' : 'Loja Fechada no Momento'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Info Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5 shadow-xs">
          <h4 className="font-extrabold text-base text-[var(--color-on-surface)] pb-2 border-b border-[var(--color-outline-variant)]/20 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--color-primary)]" />
            Informações Gerais & Contato
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Nome da Loja</label>
              <input
                type="text"
                value={nomeLoja}
                onChange={(e) => setNomeLoja(e.target.value)}
                required
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">WhatsApp / Telefone de Atendimento</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                  placeholder="(13) 98874-7014"
                  className="w-full pl-10 pr-3.5 py-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">E-mail Comercial</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">URL da Logo da Loja</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                required
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Rules Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5 shadow-xs">
          <h4 className="font-extrabold text-base text-[var(--color-on-surface)] pb-2 border-b border-[var(--color-outline-variant)]/20 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
            Regras de Pedidos & Entrega
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Pedido Mínimo (R$)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pedidoMinimo}
                  onChange={(e) => setPedidoMinimo(Number(e.target.value))}
                  required
                  className="w-full pl-10 pr-3.5 py-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Raio Máximo de Entrega (km)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={raioEntregaKm}
                onChange={(e) => setRaioEntregaKm(Number(e.target.value))}
                required
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Working Hours Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5 shadow-xs">
          <h4 className="font-extrabold text-base text-[var(--color-on-surface)] pb-2 border-b border-[var(--color-outline-variant)]/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
            Horários de Funcionamento da Confeitaria
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(horarios).map(([dia, horario]) => (
              <div key={dia} className="p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30">
                <label className="block text-xs font-extrabold capitalize text-[var(--color-on-surface)] mb-1">{dia}</label>
                <input
                  type="text"
                  value={horario as string}
                  onChange={(e) => setHorarios({ ...horarios, [dia]: e.target.value })}
                  placeholder="Ex: 09:00 - 19:00 ou Fechado"
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/40 text-xs font-bold"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nossa Historia Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5 shadow-xs">
          <h4 className="font-extrabold text-base text-[var(--color-on-surface)] pb-2 border-b border-[var(--color-outline-variant)]/20 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
            Nossa História e Imagens
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">A História da Doceria</label>
              <textarea
                rows={4}
                value={historiaLoja}
                onChange={(e) => setHistoriaLoja(e.target.value)}
                placeholder="Conte sobre como a loja começou, a missão, etc..."
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Imagens da Loja (URLs separadas por vírgula)
              </label>
              <textarea
                rows={3}
                value={fotosLoja}
                onChange={(e) => setFotosLoja(e.target.value)}
                placeholder="https://imagem1.jpg, https://imagem2.jpg"
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black text-sm shadow-md hover:opacity-90 flex items-center gap-2.5 min-h-[52px] cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Salvar Configurações da Loja</span>
          </button>
        </div>
      </form>
    </div>
  );
};
