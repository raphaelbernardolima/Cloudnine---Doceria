import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Heart, ShoppingBag, Award, Camera, 
  Save, CheckCircle, Clock, ChevronRight, Phone, Mail, Shield, AlertCircle,
  Copy, RefreshCw, Bell, Sparkles, Star, Gift, Truck, FileText, Settings2
} from 'lucide-react';
import { UserProfile, Order } from '../types';
import { CloudinaryUploader } from './CloudinaryUploader';
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
  const [rua, setRua] = useState('Alameda Gabriel Monteiro da Silva, 450');
  const [bairro, setBairro] = useState('Jardins');
  const [cidade, setCidade] = useState('São Paulo');
  const [cep, setCep] = useState('01442-000');
  const [complemento, setComplemento] = useState('Apto 42');
  const [pontoReferencia, setPontoReferencia] = useState('Próximo à Alameda Santos');

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
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

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
      avatar_url: avatarUrl
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
      <div className="relative rounded-3xl bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] p-6 sm:p-8 text-[var(--color-on-primary)] shadow-md overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            
            {/* Avatar Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/60 overflow-hidden shrink-0 flex items-center justify-center shadow-lg relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{nome || currentUser.nome} {sobrenome || currentUser.sobrenome}</h1>
                <span className="px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider border border-white/30">
                  Membro VIP Cloudnine
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-white/90 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
                {telefone && (
                  <>
                    <span className="opacity-50">•</span>
                    <Phone className="w-3.5 h-3.5" />
                    <span>{telefone}</span>
                  </>
                )}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 bg-amber-400/20 px-3 py-1 rounded-xl text-amber-200 border border-amber-300/30">
                  <Award className="w-4 h-4 text-amber-300" />
                  480 Pontos Fidelidade
                </span>
                <span className="flex items-center gap-1 bg-emerald-400/20 px-3 py-1 rounded-xl text-emerald-200 border border-emerald-300/30">
                  <ShoppingBag className="w-4 h-4 text-emerald-300" />
                  {userOrders.length} {userOrders.length === 1 ? 'Pedido Feito' : 'Pedidos Feitos'}
                </span>
              </div>
            </div>

          </div>

          <button
            onClick={onNavigateToShop}
            className="self-center md:self-auto px-5 py-2.5 rounded-2xl bg-white text-[var(--color-primary)] font-extrabold text-xs hover:bg-opacity-90 transition-all shadow-md flex items-center space-x-2"
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
          <div className="p-3 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-1 shadow-xs sticky top-20">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-outline)]">
              Portal do Cliente
            </p>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeSubTab === 'profile'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
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
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeSubTab === 'orders'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
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
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeSubTab === 'addresses'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
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
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeSubTab === 'loyalty'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
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
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeSubTab === 'preferences'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
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
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                activeSubTab === 'security'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4" />
                <span>Segurança e Avisos</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
            
            {(currentUser.role === 'admin' || currentUser.role === 'confeiteiro' || currentUser.role === 'atendente') && (
              <div className="pt-4 mt-2 border-t border-[var(--color-outline-variant)]/20">
                <button
                  onClick={onNavigateToAdmin}
                  className="w-full p-3 rounded-2xl text-xs font-black flex items-center justify-between transition-all bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 shadow-sm"
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
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 shadow-xs animate-pulse space-y-6">
              <div className="border-b border-[var(--color-outline-variant)]/10 pb-4 space-y-2">
                <div className="h-6 w-1/3 bg-[var(--color-surface-container-high)] rounded-md"></div>
                <div className="h-4 w-1/2 bg-[var(--color-surface-container)] rounded-md"></div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-[var(--color-surface-container-high)]"></div>
                  <div className="h-10 w-32 bg-[var(--color-surface-container-high)] rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-12 w-full bg-[var(--color-surface-container-highest)] rounded-xl"></div>
                  <div className="h-12 w-full bg-[var(--color-surface-container-highest)] rounded-xl"></div>
                  <div className="h-12 w-full bg-[var(--color-surface-container-highest)] rounded-xl"></div>
                </div>
                <div className="pt-4 flex justify-end">
                  <div className="h-10 w-32 bg-[var(--color-surface-container-highest)] rounded-xl"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* SUBTAB 1: DADOS DO PERFIL & FOTO */}
              {activeSubTab === 'profile' && (
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-6 shadow-xs">
              <div className="border-b border-[var(--color-outline-variant)]/20 pb-4">
                <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--color-primary)]" />
                  <span>Informações Pessoais e Foto</span>
                </h3>
                <p className="text-xs text-[var(--color-outline)]">
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
                    <label className="font-bold text-[var(--color-on-surface)] block mb-1.5">Nome</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[var(--color-on-surface)] block mb-1.5">Sobrenome</label>
                    <input
                      type="text"
                      value={sobrenome}
                      onChange={(e) => setSobrenome(e.target.value)}
                      required
                      className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[var(--color-on-surface)] block mb-1.5">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[var(--color-on-surface)] block mb-1.5">E-mail Cadastrado</label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-high)] opacity-70 border border-[var(--color-outline-variant)]/40 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between">
                  {isSaved ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Alterações salvas com sucesso!</span>
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--color-outline)]">Clique ao lado para gravar suas alterações.</span>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-xs flex items-center space-x-2 shadow-md hover:opacity-95 transition-all min-h-[44px]"
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
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-6 shadow-xs">
              <div className="border-b border-[var(--color-outline-variant)]/20 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>Histórico de Pedidos ({userOrders.length})</span>
                  </h3>
                  <p className="text-xs text-[var(--color-outline)]">
                    Acompanhe o status e os detalhes das suas encomendas na Cloudnine.
                  </p>
                </div>
              </div>

              {userOrders.length === 0 ? (
                <div className="p-10 text-center space-y-3 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30">
                  <ShoppingBag className="w-12 h-12 text-[var(--color-outline)] mx-auto opacity-40" />
                  <p className="font-extrabold text-base">Sua conta ainda não possui pedidos.</p>
                  <p className="text-xs text-[var(--color-outline)] max-w-md mx-auto">
                    Nossos chefs e confeiteiros estão prontos para preparar bolos de luxo e doces gourmets excepcionais para você!
                  </p>
                  <button
                    onClick={onNavigateToShop}
                    className="mt-2 px-5 py-2.5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-xs inline-flex items-center space-x-2 shadow-xs"
                  >
                    <span>Explorar Cardápio</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((o) => (
                    <div 
                      key={o.id}
                      className="p-5 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-3 transition-all hover:border-[var(--color-primary)]/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-outline-variant)]/20 pb-3">
                        <div>
                          <span className="font-black text-base text-[var(--color-primary)]">
                            PEDIDO #{o.id}
                          </span>
                          <p className="text-xs text-[var(--color-outline)]">
                            Agendado para: <strong>{o.data_agendada} às {o.horario_agendado}</strong> ({o.tipo_entrega.toUpperCase()})
                          </p>
                        </div>

                        <span className="self-start sm:self-center font-extrabold text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          {o.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Item list */}
                      <div className="p-3.5 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 text-xs space-y-1.5 font-mono">
                        {o.itens.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>{item.quantidade}x {item.nomeProduto}</span>
                            <span className="font-bold">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-[var(--color-outline)]">
                          Total Pago: <strong className="text-sm text-[var(--color-on-surface)]">R$ {o.total.toFixed(2)}</strong>
                        </span>

                        <button
                          onClick={onNavigateToShop}
                          className="px-4 py-2 rounded-xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] font-extrabold text-xs text-[var(--color-on-surface)] flex items-center space-x-1.5 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[var(--color-primary)]" />
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
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-6 shadow-xs">
              <div className="border-b border-[var(--color-outline-variant)]/20 pb-4">
                <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                  <span>Meus Endereços Salvos</span>
                </h3>
                <p className="text-xs text-[var(--color-outline)]">
                  Cadastre seus locais frequentes para agilizar o cálculo de frete e entrega rápida.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-3xl bg-[var(--color-surface-container-low)] border-2 border-[var(--color-primary)]/40 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                      Endereço Principal (Casa)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Ativo para Entregas
                    </span>
                  </div>

                  <div className="pt-2">
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
                      className="px-5 py-2.5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs shadow-xs"
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
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-6 shadow-xs">
              <div className="border-b border-[var(--color-outline-variant)]/20 pb-4">
                <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Clube Cloudnine VIP & Recompensas</span>
                </h3>
                <p className="text-xs text-[var(--color-outline)]">
                  Acumule pontos em todas as compras e troque por delícias artesanais exclusivas.
                </p>
              </div>

              {/* Loyalty Card Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Cartão de Fidelidade Digital
                    </span>
                    <h4 className="text-xl font-black text-[var(--color-on-surface)]">Saldo Atual: 480 Pontos</h4>
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
                <h4 className="font-extrabold text-xs text-[var(--color-on-surface)]">Seus Cupons de Desconto Disponíveis</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-primary)]/50 flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-[var(--color-primary)] block">CLOUDNINE10</span>
                      <p className="text-[11px] text-[var(--color-outline)]">10% OFF em qualquer pedido</p>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon('CLOUDNINE10')}
                      className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      {copiedCoupon === 'CLOUDNINE10' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCoupon === 'CLOUDNINE10' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-dashed border-amber-500/50 flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-amber-600 block">DOCEAGORA</span>
                      <p className="text-[11px] text-[var(--color-outline)]">Frete Grátis acima de R$ 80,00</p>
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
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-6 shadow-xs">
              <div className="border-b border-[var(--color-outline-variant)]/20 pb-4">
                <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span>Restrições Alimentares e Alergias</span>
                </h3>
                <p className="text-xs text-[var(--color-outline)]">
                  Marque suas restrições para alertar nossa cozinha na confecção das suas encomendas.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                  <input
                    type="checkbox"
                    checked={zeroLactose}
                    onChange={(e) => setZeroLactose(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-extrabold text-sm block">Intolerância a Lactose (Linha Zero Lactose)</span>
                    <p className="text-[11px] text-[var(--color-outline)]">Destacar opções preparadas com leite vegetal e ingredientes sem derivados de leite.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                  <input
                    type="checkbox"
                    checked={semGluten}
                    onChange={(e) => setSemGluten(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-extrabold text-sm block">Dieta Sem Glúten</span>
                    <p className="text-[11px] text-[var(--color-outline)]">Filtrar produtos preparados com farinhas especiais sem glúten.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                  <input
                    type="checkbox"
                    checked={zeroAcucar}
                    onChange={(e) => setZeroAcucar(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-extrabold text-sm block">Linha Zero Açúcar / Fit</span>
                    <p className="text-[11px] text-[var(--color-outline)]">Priorizar doces adoçados naturalmente com eritritol, xilitol ou stevia.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-3.5 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] transition-colors">
                  <input
                    type="checkbox"
                    checked={alergiaNozes}
                    onChange={(e) => setAlergiaNozes(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-extrabold text-sm block">Alergia Severa a Oleaginosas (Nozes, Castanhas, Amendoim)</span>
                    <p className="text-[11px] text-[var(--color-outline)]">Emitir alerta especial de manipulação e contaminação cruzada para a equipe de produção.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* SUBTAB 6: SEGURANÇA E NOTIFICAÇÕES */}
          {activeSubTab === 'security' && (
            <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-6 shadow-xs">
              <div className="border-b border-[var(--color-outline-variant)]/20 pb-4">
                <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sky-500" />
                  <span>Segurança e Canais de Aviso</span>
                </h3>
                <p className="text-xs text-[var(--color-outline)]">
                  Gerencie como você recebe atualizações dos seus pedidos.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] space-y-3">
                  <h4 className="font-extrabold text-xs text-[var(--color-on-surface)]">Canais de Notificação</h4>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold">Receber atualizações de pedidos via WhatsApp</span>
                    <input
                      type="checkbox"
                      checked={notifWhatsapp}
                      onChange={(e) => setNotifWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-primary)]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold">Receber novidades e cupons por E-mail</span>
                    <input
                      type="checkbox"
                      checked={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-primary)]"
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
