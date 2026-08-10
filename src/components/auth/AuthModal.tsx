import React, { useState } from 'react';
import { X, Mail, Shield, Key, CheckCircle, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { signInWithSupabase, signUpWithSupabase, getSupabaseConfig } from '../../services/supabase';
import { UserProfile } from '../../types/index';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  requiredRoleMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  requiredRoleMessage
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isConfigured } = getSupabaseConfig();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isConfigured) {
      const { user, error } = await signInWithSupabase(email, password);
      setLoading(false);

      if (error) {
        setErrorMessage(`Não foi possível autenticar. Verifique seu e-mail e senha.`);
      } else if (user) {
        setSuccessMessage(`Acesso realizado com sucesso! Bem-vindo(a), ${user.nome}.`);
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 600);
      }
    } else {
      // Fallback local mode (determines role from email address if pre-registered)
      setLoading(false);
      let detectedRole: UserProfile['role'] = 'cliente';
      if (email.startsWith('admin')) detectedRole = 'admin';
      else if (email.startsWith('confeiteiro') || email.startsWith('cozinha')) detectedRole = 'confeiteiro';
      else if (email.startsWith('atendente')) detectedRole = 'atendente';

      const demoUser: UserProfile = {
        id: `usr-session-${Date.now()}`,
        email: email,
        nome: nome || (email.split('@')[0] || 'Usuário'),
        sobrenome: sobrenome || '',
        telefone: '(11) 99999-0000',
        role: detectedRole,
        Status: 'ativo',
        pontosFidelidade: 150
      };

      setSuccessMessage(`Login efetuado com sucesso! Bem-vindo(a), ${demoUser.nome}.`);
      setTimeout(() => {
        onLoginSuccess(demoUser);
        onClose();
      }, 500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isConfigured) {
      // Always register as 'cliente'
      const { user, error } = await signUpWithSupabase(email, password, nome, sobrenome);
      setLoading(false);

      if (error) {
        setErrorMessage(`Falha no cadastro: ${error}`);
      } else if (user) {
        setSuccessMessage('Sua conta foi criada com sucesso! Bem-vindo(a) à Cloudnine.');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 700);
      }
    } else {
      setLoading(false);
      // Local registration always creates 'cliente' account
      const newUser: UserProfile = {
        id: `usr-reg-${Date.now()}`,
        email: email,
        nome: nome,
        sobrenome: sobrenome,
        telefone: '(11) 98888-7777',
        role: 'cliente',
        Status: 'ativo',
        pontosFidelidade: 100
      };

      setSuccessMessage(`Cadastro concluído com sucesso!`);
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-outline-variant)]/40 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
                Área do Cliente Cloudnine
              </h2>
              <p className="text-sm opacity-85">Acesse sua conta para acompanhar pedidos e pontos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-surface-container-lowest)]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Required Role Warning Notice if redirected */}
        {requiredRoleMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{requiredRoleMessage}</span>
          </div>
        )}

        {/* Tabs: Login / Register */}
        <div className="flex border-b border-[var(--color-outline-variant)]/20 px-6 pt-4 space-x-6 text-xs font-bold">
          <button
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`pb-2.5 border-b-2 transition-all ${
              tab === 'login'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            Acessar Conta
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`pb-2.5 border-b-2 transition-all ${
              tab === 'register'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-outline)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Senha</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-outline)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:opacity-95 transition-all mt-2 min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Acessando...' : 'Entrar na Conta'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--color-on-surface)] block mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--color-on-surface)] block mb-1">Sobrenome</label>
                  <input
                    type="text"
                    required
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    placeholder="Seu sobrenome"
                    className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha segura (mínimo 6 caracteres)"
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:opacity-95 transition-all mt-2 min-h-[44px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Cadastrando...' : 'Criar Minha Conta'}</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
