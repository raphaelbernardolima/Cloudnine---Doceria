import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Search, Edit, User, Shield, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AdminStaffModuleProps {
  staffList: UserProfile[];
  onUpdateRole: (userId: string, newRole: UserProfile['role']) => void;
}

export const AdminStaffModule: React.FC<AdminStaffModuleProps> = ({ staffList, onUpdateRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('USUARIO_PADRAO');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredStaff = staffList.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  const handleSaveRole = () => {
    if (editingUser) {
      onUpdateRole(editingUser.id, selectedRole);
      setToastMessage(`Permissão de ${editingUser.nome} atualizada para ${selectedRole.toUpperCase()}`);
      setEditingUser(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const roleLabels: Record<string, { label: string, color: string }> = {
    'ADMIN': { label: 'Administrador', color: 'bg-rose-500 text-white' },
    'admin': { label: 'Administrador', color: 'bg-rose-500 text-white' },
    'CAIXA': { label: 'Caixa', color: 'bg-emerald-500 text-white' },
    'COZINHA': { label: 'Cozinha', color: 'bg-amber-500 text-white' },
    'confeiteiro': { label: 'Cozinha', color: 'bg-amber-500 text-white' },
    'LIMPEZA': { label: 'Limpeza', color: 'bg-sky-500 text-white' },
    'ATENDIMENTO': { label: 'Atendimento', color: 'bg-indigo-500 text-white' },
    'atendente': { label: 'Atendimento', color: 'bg-indigo-500 text-white' },
    'USUARIO_PADRAO': { label: 'Usuário Padrão', color: 'bg-gray-500 text-white' },
    'cliente': { label: 'Cliente', color: 'bg-gray-500 text-white' }
  };

  const renderRoleBadge = (role: string) => {
    const config = roleLabels[role] || { label: role, color: 'bg-gray-500 text-white' };
    return (
      <span className={`px-2 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-[var(--color-on-surface)] flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Gestão de Equipe e Permissões (RBAC)
            </h3>
            <p className="text-xs text-[var(--color-outline)] mt-1">
              Controle o acesso dos funcionários aos módulos do sistema.
            </p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/30 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--color-outline-variant)]/20">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface-container-low)]">
              <tr className="text-[var(--color-outline)] uppercase font-bold text-sm">
                <th className="py-3 px-4 rounded-tl-2xl">Funcionário</th>
                <th className="py-3 px-4">Função (Role)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-tr-2xl">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
              {filteredStaff.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--color-surface-container-low)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-on-surface)]">{user.nome} {user.sobrenome}</p>
                        <p className="text-sm text-[var(--color-outline)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {renderRoleBadge(user.role)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 text-sm font-bold ${user.Status === 'ativo' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {user.Status === 'ativo' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {user.Status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 font-bold flex items-center space-x-1.5 ml-auto transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[var(--color-outline)]">
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--color-surface)] p-6 rounded-3xl space-y-6 shadow-2xl border border-[var(--color-outline-variant)]/40 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg text-[var(--color-on-surface)]">Editar Permissões</h3>
                <p className="text-xs text-[var(--color-outline)] mt-1">Alterando acesso para {editingUser.nome}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-full hover:bg-[var(--color-surface-container-high)] text-[var(--color-outline)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[var(--color-on-surface)]">
                Selecione o Nível de Acesso:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'ADMIN', label: 'Administrador', desc: 'Acesso total ao sistema' },
                  { id: 'CAIXA', label: 'Caixa', desc: 'Operações financeiras e frente de caixa' },
                  { id: 'COZINHA', label: 'Cozinha', desc: 'Visualização e status de pedidos/PCP' },
                  { id: 'LIMPEZA', label: 'Limpeza', desc: 'Gestão de manutenção/turnos' },
                  { id: 'ATENDIMENTO', label: 'Atendimento', desc: 'Garçom/Balcão' },
                  { id: 'USUARIO_PADRAO', label: 'Usuário Padrão', desc: 'Sem acesso interno' }
                ].map(role => (
                  <label key={role.id} className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedRole === role.id || selectedRole.toUpperCase() === role.id ? 'bg-indigo-50/50 border-indigo-500/50 dark:bg-indigo-900/10 dark:border-indigo-500/30' : 'border-[var(--color-outline-variant)]/30 hover:bg-[var(--color-surface-container-low)]'}`}>
                    <div className="pt-0.5 flex shrink-0">
                      <input 
                        type="radio" 
                        name="role" 
                        checked={selectedRole === role.id || selectedRole.toUpperCase() === role.id} 
                        onChange={() => setSelectedRole(role.id as any)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-on-surface)]">{role.label}</p>
                      <p className="text-sm text-[var(--color-outline)]">{role.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold text-xs hover:bg-[var(--color-surface-container-highest)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition-colors"
              >
                Salvar Acesso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};
