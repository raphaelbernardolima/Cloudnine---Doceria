import React, { useState } from 'react';
import { Tote, List as ListIcon, X, User, SignOut, CurrencyDollar, PaperPlaneRight, Heart, Tray, Gauge, Megaphone, Gear, CookingPot, Stack, Moon, Sun, Bell, Cake } from '@phosphor-icons/react';
import { UserProfile, Order } from '@/src/core/types/index';
import { isStaff } from '@/src/core/constants/roles';
import { AppBar, Toolbar, IconButton, Typography, Badge, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, Button, Switch } from '@mui/material';
import { useAppTheme } from '@/src/core/theme/ThemeContext';
import { useCartStore } from '@/src/core/store/useCartStore';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useUIStore } from '@/src/core/store/useUIStore';
import { NotificationDrawer } from '@/src/core/ui/layout/NotificationDrawer';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAuthModal: (msg?: string) => void;
  onLogout: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCustomCakeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAuthModal,
  onLogout,
  currentPath,
  onNavigate,
  onOpenCustomCakeModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const { mode, toggleTheme } = useAppTheme();
  const { currentUser, orders = [] } = useDataStore();
  const { cartItems } = useCartStore();
  const { notifications } = useUIStore();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const unreadCount = notifications.filter(n => !n.lida).length;

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
                <ListIcon />
              </IconButton>
            )}

            <Typography
              variant="h4"
              component="div"
              sx={{
                cursor: 'pointer',
                fontFamily: '"Libre Caslon Text", serif',
                color: 'primary.light',
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

            {/* Desktop Theme Toggle */}
            <IconButton aria-label="Alternar Tema" color="inherit" onClick={toggleTheme} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </IconButton>

            <IconButton aria-label="Notificações" color="inherit" onClick={() => setIsNotifDrawerOpen(true)}>
              <Badge badgeContent={unreadCount} color="primary" sx={{ '& .MuiBadge-badge': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                <Bell className="w-6 h-6" />
              </Badge>
            </IconButton>

            <IconButton aria-label="Carrinho" color="inherit" onClick={onOpenCart}>
              <Badge badgeContent={cartCount} color="primary" sx={{ '& .MuiBadge-badge': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
                <Tote className="w-6 h-6" />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifDrawerOpen} onClose={() => setIsNotifDrawerOpen(false)} />

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
              bgcolor: 'var(--color-surface)',
              color: 'var(--color-on-surface)',
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
                color: 'var(--color-on-surface)',
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
                const active = isTabActive('finance');
                return (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavClick('/admin?tab=finance')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <CurrencyDollar className="w-5 h-5 stroke-[2.2]" />
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
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <PaperPlaneRight className="w-5 h-5 stroke-2" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Pedidos
                      </Typography>
                      <Typography sx={{ color: '#5A4A47', fontSize: '14px', fontWeight: 500 }}>
                        {orders.filter(o => o.status === 'pendente_pix').length}
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
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Heart className="w-5 h-5 stroke-2" />
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
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Tray className="w-5 h-5 stroke-2" />
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
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Gauge className="w-5 h-5 stroke-2" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Entregas
                      </Typography>
                      <Typography sx={{ color: '#5A4A47', fontSize: '14px', fontWeight: 500 }}>

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
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Megaphone className="w-5 h-5 stroke-2" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Marketing
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })()}

              {/* Bolos Personalizados */}
              {(() => {
                const active = isTabActive('custom-cake');
                return (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavClick('/admin?tab=custom-cake')}
                      sx={{
                        borderRadius: '9999px',
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Cake className="w-5 h-5 stroke-2" />
                      </ListItemIcon>
                      <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '15px', color: 'inherit', flexGrow: 1 }}>
                        Bolos Personalizados
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
                        bgcolor: active ? 'var(--color-primary-container)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        py: 1.4,
                        px: 2.5,
                        '&:hover': {
                          bgcolor: active ? 'var(--color-primary-container)' : 'var(--color-surface-container-highest)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <Gear className="w-5 h-5 stroke-2" />
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

        {/* Bottom Area: Theme Toggle & Logout */}
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'text.primary' }}>
                Tema Escuro
              </Typography>
            </Box>
            <Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />
          </Box>

          {currentUser ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SignOut className="w-5 h-5" />}
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
