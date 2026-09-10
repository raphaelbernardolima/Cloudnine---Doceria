import React, { useState } from 'react';
import { MagnifyingGlass, ShieldWarning, UserCheck, UserMinus, CookingPot, Bicycle, Headphones, Shield, DotsThreeVertical } from '@phosphor-icons/react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { UserProfile } from '@/src/core/types';
import { Box, Typography, TextField, InputAdornment, IconButton, Menu, MenuItem, Chip } from '@mui/material';

export const AdminTeamModule: React.FC = () => {
  const { users, setUsers } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.sobrenome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleChangeRole = (newRole: string) => {
    if (!selectedUserId) return;
    const updated = users.map(u => u.id === selectedUserId ? { ...u, role: newRole as any } : u);
    setUsers(updated);
    handleCloseMenu();
  };

  const handleChangeStatus = (newStatus: 'ativo' | 'suspenso') => {
    if (!selectedUserId) return;
    const updated = users.map(u => u.id === selectedUserId ? { ...u, Status: newStatus } : u);
    setUsers(updated);
    handleCloseMenu();
  };

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    if (r === 'ADMIN') return <Chip icon={<Shield size={14} />} label="Dono / Admin" size="small" color="primary" />;
    if (r === 'COZINHA') return <Chip icon={<CookingPot size={14} />} label="Cozinha" size="small" color="warning" />;
    if (r === 'ENTREGADOR') return <Chip icon={<Bicycle size={14} />} label="Entregador" size="small" color="info" />;
    if (r === 'ATENDIMENTO' || r === 'CAIXA') return <Chip icon={<Headphones size={14} />} label="Atendimento" size="small" color="secondary" />;
    return <Chip label="Cliente Padrão" size="small" variant="outlined" />;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--color-on-background)] flex items-center gap-2">
            <ShieldWarning className="w-6 h-6 text-[var(--color-primary)]" />
            Equipe & Permissões
          </h2>
          <p className="text-sm text-[var(--color-outline)] mt-1">
            Gerencie os acessos dos seus funcionários e clientes.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Buscar por nome ou e-mail..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            bgcolor: 'var(--color-surface-container-low)',
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass className="text-[var(--color-outline)] w-5 h-5" />
              </InputAdornment>
            ),
          }
        }}
      />

      {/* Users List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredUsers.map(user => (
          <div 
            key={user.id} 
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              user.Status === 'suspenso' ? 'bg-red-50/50 border-red-200 opacity-70' : 'bg-[var(--color-surface-container-lowest)] border-[var(--color-outline-variant)]/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-lg">
                {user.nome.charAt(0)}{user.sobrenome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-on-surface)] text-sm sm:text-base">
                  {user.nome} {user.sobrenome}
                  {user.Status === 'suspenso' && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Suspenso</span>
                  )}
                </h3>
                <p className="text-xs text-[var(--color-outline)] truncate">{user.email} • {user.telefone}</p>
                <div className="mt-1.5">
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            <IconButton onClick={(e) => handleOpenMenu(e, user.id)}>
              <DotsThreeVertical className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
            </IconButton>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-[var(--color-outline)]">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: { sx: { borderRadius: 3, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }
        }}
      >
        <MenuItem disabled className="opacity-100! font-bold text-xs uppercase tracking-wider text-gray-500 bg-gray-50 pb-2">
          Alterar Cargo
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole('ADMIN')} sx={{ fontSize: '14px', py: 1.5 }}>
          <Shield className="w-4 h-4 mr-3 text-primary-500" /> Dono / Admin
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole('COZINHA')} sx={{ fontSize: '14px', py: 1.5 }}>
          <CookingPot className="w-4 h-4 mr-3 text-warning-500" /> Cozinha
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole('ENTREGADOR')} sx={{ fontSize: '14px', py: 1.5 }}>
          <Bicycle className="w-4 h-4 mr-3 text-info-500" /> Entregador
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole('ATENDIMENTO')} sx={{ fontSize: '14px', py: 1.5 }}>
          <Headphones className="w-4 h-4 mr-3 text-secondary-500" /> Atendimento / Caixa
        </MenuItem>
        <MenuItem onClick={() => handleChangeRole('USUARIO_PADRAO')} sx={{ fontSize: '14px', py: 1.5 }}>
          <UserCheck className="w-4 h-4 mr-3 text-gray-500" /> Cliente Padrão
        </MenuItem>
        
        <div className="h-px bg-gray-200 my-1 mx-2" />
        
        <MenuItem disabled className="opacity-100! font-bold text-xs uppercase tracking-wider text-gray-500 bg-gray-50 pb-2 pt-3">
          Status da Conta
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('ativo')} sx={{ fontSize: '14px', py: 1.5, color: 'success.main' }}>
          <UserCheck className="w-4 h-4 mr-3" /> Ativar Conta
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('suspenso')} sx={{ fontSize: '14px', py: 1.5, color: 'error.main' }}>
          <UserMinus className="w-4 h-4 mr-3" /> Suspender Conta
        </MenuItem>
      </Menu>
    </div>
  );
};
