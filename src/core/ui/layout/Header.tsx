import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  LogOut, 
  DollarSign, 
  Send, 
  Heart, 
  Inbox, 
  Gauge, 
  Megaphone, 
  Settings, 
  ChefHat, 
  Layers 
} from 'lucide-react';
import { UserProfile, ThemeMode } from '@/src/core/types/index';
import { isStaff } from '@/src/core/constants/roles';
import { AppBar, Toolbar, IconButton, Typography, Badge, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Button } from '@mui/material';

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

  const isAdmin = isStaff(currentUser);

  const isTabActive = (tabKey: string) => {
    if (currentPath.includes(`tab=${tabKey}`)) return true;
    if (tabKey === 'dashboard' && (currentPath === '/admin' || currentPath === '/admin/')) return true;
    return false;
  };

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
        slotProps={{
          paper: {
            sx: { 
              width: { xs: '84vw', sm: 340 }, 
              maxWidth: 360,
              bgcolor: '#FDF2F0', 
              color: '#3D3331',
              p: { xs: 2.5, sm: 3 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              borderTopRightRadius: { xs: 24, sm: 28 },
              borderBottomRightRadius: { xs: 24, sm: 28 },
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {/* Header Title */}
          <Box sx={{ mb: 3, pt: 1, px: 1.5 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#4A3E3D', 
                fontWeight: 500, 
                fontSize: '16px',
                letterSpacing: '-0.01em',
                fontFamily: 'inherit'
              }}
            >
              Painel administrativo - Cloudnine
            </Typography>
          </Box>

          {/* Admin Navigation List */}
          {isAdmin ? (
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 0, flexGrow: 1 }}>
              {/* Financeiro */}
              {(() => {
                const active = isTabActive('dashboard');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=dashboard')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <DollarSign className="w-5 h-5 stroke-[2.2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Financeiro
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Pedidos */}
              {(() => {
                const active = isTabActive('orders');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=orders')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Send className="w-5 h-5 stroke-[2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Pedidos
                      </Typography>
                      <Typography sx={{ color: '#5A4A47', fontSize: '14px', fontWeight: 500 }}>
                        100+
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Encomendas */}
              {(() => {
                const active = isTabActive('calendar');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=calendar')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Heart className="w-5 h-5 stroke-[2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Encomendas
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Estoque */}
              {(() => {
                const active = isTabActive('products');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=products')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Inbox className="w-5 h-5 stroke-[2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Estoque
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Divider */}
              <Divider sx={{ my: 1.5, borderColor: 'rgba(82, 67, 65, 0.12)' }} />

              {/* Entregas */}
              {(() => {
                const active = isTabActive('delivery');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=delivery')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Gauge className="w-5 h-5 stroke-[2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Entregas
                      </Typography>
                      <Typography sx={{ color: '#5A4A47', fontSize: '14px', fontWeight: 500 }}>
                        100+
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Marketing */}
              {(() => {
                const active = isTabActive('marketing') || isTabActive('ai');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=marketing')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Megaphone className="w-5 h-5 stroke-[2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Marketing
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Configurações */}
              {(() => {
                const active = isTabActive('store-config') || isTabActive('payment-config') || isTabActive('staff');
                return (
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavClick('/admin?tab=store-config')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? '#FCDDD4' : 'transparent',
                        color: active ? '#3C2218' : '#3D3534',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? '#FCDDD4' : 'rgba(252, 221, 212, 0.45)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Settings className="w-5 h-5 stroke-[2]" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Configurações
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}
            </List>
          ) : (
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 0, flexGrow: 1 }}>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleNavClick('/')}
                  sx={{ borderRadius: '9999px', py: 1.4, px: 2.5 }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
                    Cardápio
                  </Typography>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => { onOpenCustomCakeModal(); setIsMobileMenuOpen(false); }}
                  sx={{ borderRadius: '9999px', py: 1.4, px: 2.5 }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
                    Montar Bolo Personalizado
                  </Typography>
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>

        {/* Bottom Button */}
        <Box sx={{ pt: 2 }}>
          {currentUser ? (
            <Button 
              fullWidth
              variant="outlined" 
              startIcon={<LogOut className="w-5 h-5" />} 
              onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
              sx={{
                borderRadius: '9999px',
                borderColor: '#9E2A2B',
                color: '#9E2A2B',
                py: 1.4,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '15px',
                '&:hover': {
                  borderColor: '#7A1F20',
                  bgcolor: 'rgba(158, 42, 43, 0.05)',
                }
              }}
            >
              Sair da conta
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<User className="w-5 h-5" />} 
              onClick={() => { onOpenAuthModal(); setIsMobileMenuOpen(false); }}
              sx={{
                borderRadius: '9999px',
                borderColor: '#9E2A2B',
                color: '#9E2A2B',
                py: 1.4,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '15px'
              }}
            >
              Entrar / Cadastrar
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};
