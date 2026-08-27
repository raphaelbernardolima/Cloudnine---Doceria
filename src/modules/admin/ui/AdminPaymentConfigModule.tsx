import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Shield, Save, Loader2, CheckCircle2, Key, Lock, Zap } from 'lucide-react';
import { getStoreConfig, updateStoreConfig } from '@/src/core/services/supabase';

interface AdminPaymentConfigModuleProps {
  showToast: (msg: string) => void;
}

export const AdminPaymentConfigModule: React.FC<AdminPaymentConfigModuleProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pixTipo, setPixTipo] = useState('cnpj');
  const [pixChave, setPixChave] = useState('51.234.567/0001-89');
  const [pixBeneficiario, setPixBeneficiario] = useState('Cloudnine Confeitaria Artesanal Ltda');
  const [pixCidade, setPixCidade] = useState('Santos - SP');

  const [mpAtivo, setMpAtivo] = useState(true);
  const [mpAccessToken, setMpAccessToken] = useState('APP_USR-0000000000000000-000000-000000000000000000000-000000');
  const [mpPublicKey, setMpPublicKey] = useState('TEST-00000000-0000-0000-0000-000000000000');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getStoreConfig();
      if (data) {
        if (data.pix_tipo) setPixTipo(data.pix_tipo);
        if (data.pix_chave) setPixChave(data.pix_chave);
        if (data.pix_beneficiario) setPixBeneficiario(data.pix_beneficiario);
        if (data.pix_cidade) setPixCidade(data.pix_cidade);
        if (typeof data.mercadopago_ativo === 'boolean') setMpAtivo(data.mercadopago_ativo);
        if (data.mercadopago_access_token) setMpAccessToken(data.mercadopago_access_token);
        if (data.mercadopago_public_key) setMpPublicKey(data.mercadopago_public_key);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      pix_tipo: pixTipo,
      pix_chave: pixChave,
      pix_beneficiario: pixBeneficiario,
      pix_cidade: pixCidade,
      mercadopago_ativo: mpAtivo,
      mercadopago_access_token: mpAccessToken,
      mercadopago_public_key: mpPublicKey
    };

    const res = await updateStoreConfig(payload);
    setSaving(false);

    if (res.success) {
      showToast('Configurações de pagamento salvas com sucesso!');
    } else {
      showToast('Erro ao salvar pagamentos: ' + (res.error || 'Erro desconhecido'));
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
            Módulo Financeiro & Gateways
          </span>
          <h3 className="text-2xl font-black text-[var(--color-on-surface)] mt-1 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[var(--color-primary)]" />
            Configurações de Pagamento & Pix
          </h3>
          <p className="text-xs text-[var(--color-outline)] mt-0.5">
            Configure sua chave Pix para transferências diretas e credenciais de integração com o Mercado Pago.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PIX SETTINGS */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-outline-variant)]/20">
            <h4 className="font-extrabold text-base text-[var(--color-on-surface)] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Chave Pix Principal da Loja
            </h4>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
              Instantâneo & Sem Taxas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Tipo de Chave Pix</label>
              <select
                value={pixTipo}
                onChange={(e) => setPixTipo(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold cursor-pointer"
              >
                <option value="cnpj">CNPJ</option>
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Chave Pix</label>
              <input
                type="text"
                value={pixChave}
                onChange={(e) => setPixChave(e.target.value)}
                required
                placeholder="Ex: 51.234.567/0001-89"
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Nome do Beneficiário (Titular)</label>
              <input
                type="text"
                value={pixBeneficiario}
                onChange={(e) => setPixBeneficiario(e.target.value)}
                required
                placeholder="Ex: Cloudnine Confeitaria"
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">Cidade da Instituição</label>
              <input
                type="text"
                value={pixCidade}
                onChange={(e) => setPixCidade(e.target.value)}
                required
                placeholder="Ex: Santos - SP"
                className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* MERCADO PAGO SETTINGS */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-outline-variant)]/20">
            <h4 className="font-extrabold text-base text-[var(--color-on-surface)] flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-600" />
              Credenciais Mercado Pago (Cartão & Pix Automático)
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mpAtivo}
                onChange={(e) => setMpAtivo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
              <span className="ml-3 text-xs font-extrabold text-[var(--color-on-surface)]">
                {mpAtivo ? 'Ativo' : 'Inativo'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">
                Access Token do Mercado Pago (Produção / Testes)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
                <input
                  type="password"
                  value={mpAccessToken}
                  onChange={(e) => setMpAccessToken(e.target.value)}
                  placeholder="APP_USR-..."
                  className="w-full pl-10 pr-3.5 py-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-mono"
                />
              </div>
              <p className="text-[11px] text-[var(--color-outline)] mt-1">
                Utilizado para gerar cobranças Pix via API, processar pagamentos de cartão e Webhooks.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] mb-1">
                Public Key (Chave Pública)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
                <input
                  type="text"
                  value={mpPublicKey}
                  onChange={(e) => setMpPublicKey(e.target.value)}
                  placeholder="TEST-... ou APP_USR-..."
                  className="w-full pl-10 pr-3.5 py-3.5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-mono"
                />
              </div>
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
            <span>Salvar Configurações de Pagamento</span>
          </button>
        </div>
      </form>
    </div>
  );
};
