import React, { useState, useEffect } from 'react';
import {
  User, MapPin, Heart, ShoppingBag, Award, Camera,
  Save, CheckCircle, Clock, ChevronRight, Phone, Mail, Shield, AlertCircle,
  Copy, RefreshCw, Bell, Sparkles, Star, Gift, Truck, FileText, Settings2
} from 'lucide-react';
import { UserProfile, Order } from '@/src/core/types/index';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';
import { AddressLookupForm } from './AddressLookupForm';

interface CustomerProfileViewProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  orders: Order[];
  onNavigateToShop: () => void;
  onNavigateToAdmin?: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  orders,
  onNavigateToShop,
  onNavigateToAdmin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'orders' | 'addresses' | 'loyalty' | 'preferences' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeSubTab]); // Refetch/simulate on tab change

  // Form State
  const [nome, setNome] = useState(currentUser.nome || '');
  const [sobrenome, setSobrenome] = useState(currentUser.sobrenome || '');
  const [telefone, setTelefone] = useState(currentUser.telefone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');

  // Address
  const [rua, setRua] = useState(currentUser.endereco_rua || '');
  const [numero, setNumero] = useState(currentUser.endereco_numero || '');
  const [bairro, setBairro] = useState(currentUser.endereco_bairro || '');
  const [cidade, setCidade] = useState(currentUser.endereco_cidade || '');
  const [cep, setCep] = useState(currentUser.endereco_cep || '');
  const [complemento, setComplemento] = useState(currentUser.endereco_complemento || '');
  const [pontoReferencia, setPontoReferencia] = useState(currentUser.endereco_referencia || '');

  // Dietary Preferences
  const [zeroLactose, setZeroLactose] = useState(false);
  const [semGluten, setSemGluten] = useState(false);
  const [zeroAcucar, setZeroAcucar] = useState(false);
  const [alergiaNozes, setAlergiaNozes] = useState(true);

  // Notification Preferences
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  // Status feedback
  const [isSaved, setIsSaved] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    if (
      nome === currentUser.nome &&
      sobrenome === currentUser.sobrenome &&
      telefone === currentUser.telefone &&
      avatarUrl === currentUser.avatar_url &&
      rua === currentUser.endereco_rua &&
      numero === currentUser.endereco_numero &&
      bairro === currentUser.endereco_bairro &&
      cidade === currentUser.endereco_cidade &&
      cep === currentUser.endereco_cep &&
      complemento === currentUser.endereco_complemento &&
      pontoReferencia === currentUser.endereco_referencia
    ) {
      return;
    }

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      const updated: UserProfile = {
        ...currentUser,
        nome,
        sobrenome,
        telefone,
        avatar_url: avatarUrl,
        endereco_rua: rua,
        endereco_numero: numero,
        endereco_bairro: bairro,
        endereco_cidade: cidade,
        endereco_cep: cep,
        endereco_complemento: complemento,
        endereco_referencia: pontoReferencia
      };
      onUpdateUser(updated);
      setIsAutoSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }, 700);

    return () => clearTimeout(timer);
  }, [nome, sobrenome, telefone, avatarUrl, rua, numero, bairro, cidade, cep, complemento, pontoReferencia]);

  const userOrders = orders.filter(
    o => o.cliente_nome.toLowerCase().includes(currentUser.nome.toLowerCase()) || currentUser.role === 'admin'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      nome,
      sobrenome,
      telefone,
      avatar_url: avatarUrl,
      endereco_rua: rua,
      endereco_numero: numero,
      endereco_bairro: bairro,
      endereco_cidade: cidade,
      endereco_cep: cep,
      endereco_complemento: complemento,
      endereco_referencia: pontoReferencia
    };
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">

      {/* Page Title & Hero Header */}
      <div className="relative rounded-[32px] bg-white border border-[#FCDDD4]/50 p-8 shadow-sm" style={{ boxShadow: '0 12px 40px rgba(220, 160, 145, 0.12)' }}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

            {/* Avatar Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFF0EC] border border-[#FCDDD4] overflow-hidden shrink-0 flex items-center justify-center relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#D9A89B]" />
              )}
            </div>

            <div className="text-center sm:text-left space-y-2 mt-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: '"Libre Caslon Text", serif', color: '#3C2218', fontStyle: 'italic' }}>
                  {(nome || currentUser.nome)?.replace(/["']/g, '') || 'Usuário'} {(sobrenome || currentUser.sobrenome)?.replace(/["']/g, '') || ''}
                </h1>
                <span className="px-3 py-1 rounded-full bg-[#FCDDD4]/50 text-[#8C6B63] font-bold text-[10px] uppercase tracking-wider border border-[#D9A89B]/30">
                  Membro VIP Cloudnine
                </span>
              </div>

              <div className="text-sm text-[#5A4A47] font-medium flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D9A89B]" />
                  <span>{currentUser.email}</span>
                </div>
                {telefone && (
                  <>
                    <span className="hidden sm:inline opacity-30">•</span>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D9A89B]" />
                      <span>{telefone}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 bg-[#FFF9E6] px-3 py-1.5 rounded-full text-[#D4A017] border border-[#F2D780]/50">
                  <Award className="w-4 h-4" />
                  480 Pontos Fidelidade
                </span>
                <span className="flex items-center gap-1.5 bg-[#F0FDF4] px-3 py-1.5 rounded-full text-[#166534] border border-[#BBF7D0]/50">
                  <ShoppingBag className="w-4 h-4" />
                  {userOrders.length} {userOrders.length === 1 ? 'Pedido Feito' : 'Pedidos Feitos'}
                </span>
              </div>
            </div>

          </div>

          <button
            onClick={onNavigateToShop}
            className="self-center md:self-auto px-6 py-3 rounded-full bg-[#3C2218] text-[#FCDDD4] font-bold text-sm hover:opacity-90 transition-all shadow-sm flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ir para o Cardápio</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <div className="p-4 rounded-[32px] bg-white border border-[#FCDDD4]/50 space-y-1 sticky top-20" style={{ boxShadow: '0 12px 40px rgba(220, 160, 145, 0.08)' }}>
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8C6B63] mb-2">
              Portal do Cliente
            </p>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${activeSubTab === 'profile'
                ? 'bg-[#FFF0EC] text-[#3C2218] border border-[#FCDDD4]'
                : 'text-[#5A4A47] hover:bg-[#FFF0EC]/50 hover:text-[#3C2218] border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4" />
                <span>Dados do Perfil</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveSubTab('orders')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${activeSubTab === 'orders'
                ? 'bg-[#FFF0EC] text-[#3C2218] border border-[#FCDDD4]'
                : 'text-[#5A4A47] hover:bg-[#FFF0EC]/50 hover:text-[#3C2218] border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Meus Pedidos ({userOrders.length})</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveSubTab('addresses')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${activeSubTab === 'addresses'
                ? 'bg-[#FFF0EC] text-[#3C2218] border border-[#FCDDD4]'
                : 'text-[#5A4A47] hover:bg-[#FFF0EC]/50 hover:text-[#3C2218] border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4" />
                <span>Endereços de Entrega</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveSubTab('loyalty')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${activeSubTab === 'loyalty'
                ? 'bg-[#FFF0EC] text-[#3C2218] border border-[#FCDDD4]'
                : 'text-[#5A4A47] hover:bg-[#FFF0EC]/50 hover:text-[#3C2218] border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4" />
                <span>Clube de Fidelidade</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveSubTab('preferences')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${activeSubTab === 'preferences'
                ? 'bg-[#FFF0EC] text-[#3C2218] border border-[#FCDDD4]'
                : 'text-[#5A4A47] hover:bg-[#FFF0EC]/50 hover:text-[#3C2218] border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <Heart className="w-4 h-4" />
                <span>Preferências Dietéticas</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveSubTab('security')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${activeSubTab === 'security'
                ? 'bg-[#FFF0EC] text-[#3C2218] border border-[#FCDDD4]'
                : 'text-[#5A4A47] hover:bg-[#FFF0EC]/50 hover:text-[#3C2218] border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4" />
                <span>Segurança e Avisos</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            {(currentUser.role === 'admin' || currentUser.role === 'confeiteiro' || currentUser.role === 'atendente') && (
              <div className="pt-4 mt-2 border-t border-(--color-outline-variant)/20">
                <button
                  onClick={onNavigateToAdmin}
                  className="w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all bg-[#FFF0EC] text-[#8C6B63] hover:bg-[#FCDDD4]/50 border border-[#D9A89B]/30"
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings2 className="w-4 h-4" />
                    <span>Acessar Painel de Gestão</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Panel Content */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/20 shadow-xs animate-pulse space-y-6">
              <div className="border-b border-(--color-outline-variant)/10 pb-4 space-y-2">
                <div className="h-6 w-1/3 bg-(--color-surface-container-high) rounded-md"></div>
                <div className="h-4 w-1/2 bg-(--color-surface-container) rounded-md"></div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-(--color-surface-container-high)"></div>
                  <div className="h-10 w-32 bg-(--color-surface-container-high) rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-12 w-full bg-(--color-surface-container-highest) rounded-xl"></div>
                  <div className="h-12 w-full bg-(--color-surface-container-highest) rounded-xl"></div>
                  <div className="h-12 w-full bg-(--color-surface-container-highest) rounded-xl"></div>
                </div>
                <div className="pt-4 flex justify-end">
                  <div className="h-10 w-32 bg-(--color-surface-container-highest) rounded-xl"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* SUBTAB 1: DADOS DO PERFIL & FOTO */}
              {activeSubTab === 'profile' && (
                <div className="p-8 rounded-[32px] bg-white border border-[#FCDDD4]/50 space-y-6" style={{ boxShadow: '0 12px 40px rgba(220, 160, 145, 0.08)' }}>
                  <div className="border-b border-[#FCDDD4]/50 pb-4">
                    <h3 className="text-2xl flex items-center gap-2" style={{ fontFamily: '"Libre Caslon Text", serif', color: '#3C2218', fontStyle: 'italic' }}>
                      <User className="w-6 h-6 text-[#D9A89B]" />
                      <span>Informações Pessoais e Foto</span>
                    </h3>
                    <p className="text-sm text-[#8C6B63] mt-1">
                      Atualize sua foto de perfil e dados de contato para facilitar o atendimento das suas encomendas.
                    </p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {/* Uploader */}
                    <CloudinaryUploader
                      onImageUploaded={(url) => setAvatarUrl(url)}
                      currentImageUrl={avatarUrl}
                      label="Foto de Perfil do Cliente"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-(--color-on-surface) block mb-1.5">Nome</label>
                        <input
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                          className="w-full p-3 rounded-2xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/40 font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-(--color-on-surface) block mb-1.5">Sobrenome</label>
                        <input
                          type="text"
                          value={sobrenome}
                          onChange={(e) => setSobrenome(e.target.value)}
                          required
                          className="w-full p-3 rounded-2xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/40 font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-[#5A4A47] block mb-1.5">Telefone / WhatsApp</label>
                        <input
                          type="tel"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full p-3 rounded-2xl bg-[#FFF0EC]/50 border border-[#FCDDD4] text-[#3C2218] font-medium focus:outline-none focus:ring-2 focus:ring-[#D9A89B]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#5A4A47] block mb-1.5">E-mail Cadastrado</label>
                        <input
                          type="email"
                          value={currentUser.email}
                          disabled
                          className="w-full p-3 rounded-2xl bg-[#FCDDD4]/30 opacity-70 border border-[#D9A89B]/20 text-[#8C6B63] font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-(--color-outline-variant)/20 flex items-center justify-between">
                      {isAutoSaving ? (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-pulse">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Salvando automaticamente...</span>
                        </span>
                      ) : isSaved ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Alterações salvas com sucesso!</span>
                        </span>
                      ) : (
                        <span className="text-xs text-(--color-outline)">Dados salvos automaticamente enquanto você digita.</span>
                      )}

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl bg-[#3C2218] text-[#FCDDD4] font-bold text-sm flex items-center space-x-2 shadow-sm hover:opacity-95 transition-all min-h-11"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar Dados</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SUBTAB 2: MEUS PEDIDOS & HISTÓRICO */}
              {activeSubTab === 'orders' && (
                <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 space-y-6 shadow-xs">
                  <div className="border-b border-(--color-outline-variant)/20 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-(--color-on-surface) flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-(--color-primary)" />
                        <span>Histórico de Pedidos ({userOrders.length})</span>
                      </h3>
                      <p className="text-xs text-(--color-outline)">
                        Acompanhe o status e os detalhes das suas encomendas na Cloudnine.
                      </p>
                    </div>
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="p-10 text-center space-y-3 rounded-3xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/30">
                      <ShoppingBag className="w-12 h-12 text-(--color-outline) mx-auto opacity-40" />
                      <p className="font-extrabold text-base">Sua conta ainda não possui pedidos.</p>
                      <p className="text-xs text-(--color-outline) max-w-md mx-auto">
                        Nossos chefs e confeiteiros estão prontos para preparar bolos de luxo e doces gourmets excepcionais para você!
                      </p>
                      <button
                        onClick={onNavigateToShop}
                        className="mt-2 px-5 py-2.5 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-extrabold text-xs inline-flex items-center space-x-2 shadow-xs"
                      >
                        <span>Explorar Cardápio</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((o) => (
                        <div
                          key={o.id}
                          className="p-5 rounded-3xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/30 space-y-3 transition-all hover:border-(--color-primary)/40"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-(--color-outline-variant)/20 pb-3">
                            <div>
                              <span className="font-black text-base text-(--color-primary)">
                                PEDIDO #{o.id}
                              </span>
                              <p className="text-xs text-(--color-outline)">
                                Agendado para: <strong>{o.data_agendada} às {o.horario_agendado}</strong> ({o.tipo_entrega.toUpperCase()})
                              </p>
                            </div>

                            <span className="self-start sm:self-center font-extrabold text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                              {o.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Item list */}
                          <div className="p-3.5 rounded-2xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/20 text-xs space-y-1.5 font-mono">
                            {o.itens.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span>{item.quantidade}x {item.nomeProduto}</span>
                                <span className="font-bold">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-(--color-outline)">
                              Total Pago: <strong className="text-sm text-(--color-on-surface)">R$ {o.total.toFixed(2)}</strong>
                            </span>

                            <button
                              onClick={onNavigateToShop}
                              className="px-4 py-2 rounded-xl bg-(--color-surface-container-high) hover:bg-(--color-surface-container-highest) font-extrabold text-xs text-(--color-on-surface) flex items-center space-x-1.5 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-(--color-primary)" />
                              <span>Repetir Pedido</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: ENDEREÇOS DE ENTREGA */}
              {activeSubTab === 'addresses' && (
                <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 space-y-6 shadow-xs">
                  <div className="border-b border-(--color-outline-variant)/20 pb-4">
                    <h3 className="text-lg font-extrabold text-(--color-on-surface) flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-(--color-primary)" />
                      <span>Meus Endereços Salvos</span>
                    </h3>
                    <p className="text-xs text-(--color-outline)">
                      Cadastre seus locais frequentes para agilizar o cálculo de frete e entrega rápida.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-5 rounded-3xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/40 hover:border-(--color-primary)/40 space-y-3 relative transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-(--color-surface-container-high) text-(--color-on-surface) border border-(--color-outline-variant)/30">
                          Endereço Principal
                        </span>

                        {!cep ? (
                          <span className="text-xs font-bold text-(--color-outline) flex items-center gap-1">
                            Pendente
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-(--color-primary) flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Ativo para Entregas
                          </span>
                        )}
                      </div>

                      <div className="pt-2">
                        {!cep && (
                          <div className="py-8 mb-4 flex flex-col items-center justify-center text-center space-y-4 bg-(--color-surface) rounded-2xl border border-(--color-outline-variant)/20">
                            <div className="w-12 h-12 rounded-full bg-(--color-surface-container-high) text-(--color-on-surface-variant) flex items-center justify-center">
                              <MapPin className="w-6 h-6 opacity-50" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-(--color-on-surface)">Nenhum endereço salvo</p>
                              <p className="text-[10px] text-(--color-on-surface-variant) max-w-xs mt-1 px-4">Busque seu CEP abaixo para adicionar seu primeiro endereço de entrega e facilitar seus pedidos.</p>
                            </div>
                          </div>
                        )}
                        <AddressLookupForm
                          compact={true}
                          initialCep={cep}
                          initialLogradouro={rua}
                          initialBairro={bairro}
                          initialCidade={cidade}
                          initialComplemento={complemento}
                          initialPontoReferencia={pontoReferencia}
                          onAddressChange={(addr) => {
                            setCep(addr.cep);
                            setRua(addr.logradouro);
                            if (addr.bairro) setBairro(addr.bairro);
                            if (addr.cidade) setCidade(addr.cidade);
                            if (addr.complemento) setComplemento(addr.complemento);
                            if (addr.pontoReferencia) setPontoReferencia(addr.pontoReferencia);
                          }}
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSaved(true);
                            setTimeout(() => setIsSaved(false), 2500);
                          }}
                          className="px-5 py-2.5 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-bold text-xs shadow-xs"
                        >
                          {isSaved ? '✓ Endereço Salvo!' : 'Salvar Endereço Principal'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: CLUBE DE FIDELIDADE & CUPONS */}
              {activeSubTab === 'loyalty' && (
                <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 space-y-6 shadow-xs">
                  <div className="border-b border-(--color-outline-variant)/20 pb-4">
                    <h3 className="text-lg font-extrabold text-(--color-on-surface) flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>Clube Cloudnine VIP & Recompensas</span>
                    </h3>
                    <p className="text-xs text-(--color-outline)">
                      Acumule pontos em todas as compras e troque por delícias artesanais exclusivas.
                    </p>
                  </div>

                  {/* Loyalty Card Banner */}
                  <div className="p-6 rounded-3xl bg-linear-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Cartão de Fidelidade Digital
                        </span>
                        <h4 className="text-xl font-black text-(--color-on-surface)">Saldo Atual: 480 Pontos</h4>
                      </div>
                      <span className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-amber-500 text-white font-black text-xs shadow-xs">
                        NÍVEL VIP
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-extrabold">
                        <span>Próxima Recompensa: Fatia de Bolo Red Velvet (500 pts)</span>
                        <span className="text-amber-600 dark:text-amber-400">480 / 500 (96%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-amber-500/20 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[96%] transition-all"></div>
                      </div>
                    </div>
                  </div>

                  {/* Coupons List */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-(--color-on-surface)">Seus Cupons de Desconto Disponíveis</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-2xl bg-(--color-surface-container-low) border border-dashed border-(--color-primary)/50 flex items-center justify-between">
                        <div>
                          <span className="font-black text-sm text-(--color-primary) block">CLOUDNINE10</span>
                          <p className="text-sm text-(--color-outline)">10% OFF em qualquer pedido</p>
                        </div>
                        <button
                          onClick={() => handleCopyCoupon('CLOUDNINE10')}
                          className="px-3 py-1.5 rounded-xl bg-(--color-primary) text-(--color-on-primary) font-bold text-xs flex items-center gap-1 shrink-0"
                        >
                          {copiedCoupon === 'CLOUDNINE10' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCoupon === 'CLOUDNINE10' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-(--color-surface-container-low) border border-dashed border-amber-500/50 flex items-center justify-between">
                        <div>
                          <span className="font-black text-sm text-amber-600 block">DOCEAGORA</span>
                          <p className="text-sm text-(--color-outline)">Frete Grátis acima de R$ 80,00</p>
                        </div>
                        <button
                          onClick={() => handleCopyCoupon('DOCEAGORA')}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                        >
                          {copiedCoupon === 'DOCEAGORA' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCoupon === 'DOCEAGORA' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* SUBTAB 5: PREFERÊNCIAS DIETÉTICAS */}
              {activeSubTab === 'preferences' && (
                <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 space-y-6 shadow-xs">
                  <div className="border-b border-(--color-outline-variant)/20 pb-4">
                    <h3 className="text-lg font-extrabold text-(--color-on-surface) flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <span>Restrições Alimentares e Alergias</span>
                    </h3>
                    <p className="text-xs text-(--color-outline)">
                      Marque suas restrições para alertar nossa cozinha na confecção das suas encomendas.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-(--color-surface-container-low) hover:bg-(--color-surface-container-high) transition-colors">
                      <input
                        type="checkbox"
                        checked={zeroLactose}
                        onChange={(e) => setZeroLactose(e.target.checked)}
                        className="w-4 h-4 rounded text-(--color-primary) focus:ring-(--color-primary)"
                      />
                      <div>
                        <span className="font-extrabold text-sm block">Intolerância a Lactose (Linha Zero Lactose)</span>
                        <p className="text-sm text-(--color-outline)">Destacar opções preparadas com leite vegetal e ingredientes sem derivados de leite.</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-(--color-surface-container-low) hover:bg-(--color-surface-container-high) transition-colors">
                      <input
                        type="checkbox"
                        checked={semGluten}
                        onChange={(e) => setSemGluten(e.target.checked)}
                        className="w-4 h-4 rounded text-(--color-primary) focus:ring-(--color-primary)"
                      />
                      <div>
                        <span className="font-extrabold text-sm block">Dieta Sem Glúten</span>
                        <p className="text-sm text-(--color-outline)">Filtrar produtos preparados com farinhas especiais sem glúten.</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-(--color-surface-container-low) hover:bg-(--color-surface-container-high) transition-colors">
                      <input
                        type="checkbox"
                        checked={zeroAcucar}
                        onChange={(e) => setZeroAcucar(e.target.checked)}
                        className="w-4 h-4 rounded text-(--color-primary) focus:ring-(--color-primary)"
                      />
                      <div>
                        <span className="font-extrabold text-sm block">Linha Zero Açúcar / Fit</span>
                        <p className="text-sm text-(--color-outline)">Priorizar doces adoçados naturalmente com eritritol, xilitol ou stevia.</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-(--color-surface-container-low) hover:bg-(--color-surface-container-high) transition-colors">
                      <input
                        type="checkbox"
                        checked={alergiaNozes}
                        onChange={(e) => setAlergiaNozes(e.target.checked)}
                        className="w-4 h-4 rounded text-(--color-primary) focus:ring-(--color-primary)"
                      />
                      <div>
                        <span className="font-extrabold text-sm block">Alergia Severa a Oleaginosas (Nozes, Castanhas, Amendoim)</span>
                        <p className="text-sm text-(--color-outline)">Emitir alerta especial de manipulação e contaminação cruzada para a equipe de produção.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* SUBTAB 6: SEGURANÇA E NOTIFICAÇÕES */}
              {activeSubTab === 'security' && (
                <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 space-y-6 shadow-xs">
                  <div className="border-b border-(--color-outline-variant)/20 pb-4">
                    <h3 className="text-lg font-extrabold text-(--color-on-surface) flex items-center gap-2">
                      <Shield className="w-5 h-5 text-sky-500" />
                      <span>Segurança e Canais de Aviso</span>
                    </h3>
                    <p className="text-xs text-(--color-outline)">
                      Gerencie como você recebe atualizações dos seus pedidos.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-(--color-surface-container-low) space-y-3">
                      <h4 className="font-extrabold text-xs text-(--color-on-surface)">Canais de Notificação</h4>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-bold">Receber atualizações de pedidos via WhatsApp</span>
                        <input
                          type="checkbox"
                          checked={notifWhatsapp}
                          onChange={(e) => setNotifWhatsapp(e.target.checked)}
                          className="w-4 h-4 rounded text-(--color-primary)"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-bold">Receber novidades e cupons por E-mail</span>
                        <input
                          type="checkbox"
                          checked={notifEmail}
                          onChange={(e) => setNotifEmail(e.target.checked)}
                          className="w-4 h-4 rounded text-(--color-primary)"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
