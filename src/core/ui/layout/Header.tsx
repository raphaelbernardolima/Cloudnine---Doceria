import React, { useState } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Settings2, Sparkles, ChevronRight } from 'lucide-react';
import { UserProfile, ThemeMode } from '@/src/core/types/index';
import { AppBar, Toolbar, IconButton, Typography, Badge, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Button, Chip } from '@mui/material';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (msg?: string) => void;
  onLogout: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCustomCakeModal: () => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuthModal,
  onLogout,
  currentPath,
  onNavigate,
  onOpenCustomCakeModal,
  themeMode,
  toggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    onNavigate('/admin');
    setIsMobileMenuOpen(false);
  };

  const isAdmin = currentUser && ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'].includes(currentUser.role);

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'surfaceContainerLow', color: 'text.primary' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAdmin && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setIsMobileMenuOpen(true)}
                sx={{ display: { md: 'none' } }}
              >
                <Menu />
              </IconButton>
            )}
            
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                cursor: 'pointer', 
                fontFamily: '"Libre Caslon Text", serif',
                color: 'primary.dark',
                fontStyle: 'italic',
                fontWeight: 400
              }}
              onClick={() => onNavigate('/')}
            >
              Cloud Nine
            </Typography>
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button color="inherit" onClick={() => onNavigate('/')} sx={{ fontWeight: currentPath === '/' ? 700 : 500 }}>
              Cardápio
            </Button>
            <Button color="inherit" onClick={onOpenCustomCakeModal}>
              Bolo Personalizado
            </Button>
            {isAdmin && (
              <Button color="secondary" onClick={() => onNavigate('/admin')} sx={{ fontWeight: 700 }}>
                Painel Admin
              </Button>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Desktop User Logic */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {currentUser ? (
                <Button 
                  color="inherit" 
                  onClick={() => onNavigate('/profile')}
                  startIcon={<Avatar src={currentUser.avatar_url || ''} sx={{ width: 24, height: 24 }}>{currentUser.nome.charAt(0)}</Avatar>}
                >
                  {currentUser.nome}
                </Button>
              ) : (
                <Button color="inherit" onClick={() => onOpenAuthModal()}>
                  Entrar
                </Button>
              )}
            </Box>
            <IconButton color="inherit" onClick={onOpenCart}>
              <Badge badgeContent={cartCount} color="primary" sx={{ '& .MuiBadge-badge': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                <ShoppingBag />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        PaperProps={{/* @ts-ignore */ sx: { width: 300, p: 2, display: 'flex', flexDirection: 'column', gap: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic', color: 'primary.dark' }}>
            Cloud Nine
          </Typography>
          <IconButton onClick={() => setIsMobileMenuOpen(false)}>
            <X />
          </IconButton>
        </Box>

        <Divider />

        {currentUser ? (
          <Box sx={{ p: 2, bgcolor: 'surfaceContainerHigh', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={currentUser.avatar_url || ''} sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
              {currentUser.nome.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {currentUser.nome}
              </Typography>
              <Typography variant="caption" noWrap color="text.secondary">
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Button variant="outlined" fullWidth startIcon={<User />} onClick={() => { onOpenAuthModal(); setIsMobileMenuOpen(false); }}>
            Entrar / Cadastrar
          </Button>
        )}

        <List sx={{ flexGrow: 1 }}>
          {isAdmin && (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=dashboard')}>
                  <ListItemText primary="Financeiro & Dashboard" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=orders')}>
                  <ListItemText primary="Pedidos" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=calendar')}>
                  <ListItemText primary="Calendário de Encomendas" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=products')}>
                  <ListItemText primary="Estoque & Catálogo" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=kitchen')}>
                  <ListItemText primary="Comanda Cozinha" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=delivery')}>
                  <ListItemText primary="Despacho & Logística" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=marketing')}>
                  <ListItemText primary="Marketing & Fidelidade" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=staff')}>
                  <ListItemText primary="Equipe & Permissões" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=ai')}>
                  <ListItemText primary="Marketing IA" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=store-config')}>
                  <ListItemText primary="Configurações da Loja" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=payment-config')}>
                  <ListItemText primary="Configurações de Pagamento" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>

        <Divider />
        
        {currentUser && (
          <Button color="error" fullWidth startIcon={<LogOut className="w-4 h-4" />} onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}>
            Sair da Conta
          </Button>
        )}
      </Drawer>
    </>
  );
};
