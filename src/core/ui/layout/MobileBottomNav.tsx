import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ShoppingBag, User, Sparkles, Store } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileBottomNavProps {
  onOpenCustomCakeModal: () => void;
  onOpenAuthModal: (msg?: string) => void;
  isAuthenticated: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCustomCakeModal,
  onOpenAuthModal,
  isAuthenticated
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  let value = 0;
  if (currentPath === '/') value = 0;
  else if (currentPath === '/profile') value = 2;
  else if (currentPath === '/sobre') value = 3;
  else value = -1; // No matching tab, e.g. /admin

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, display: { md: 'none' } }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          if (newValue === 0) {
            navigate('/');
          } else if (newValue === 1) {
            onOpenCustomCakeModal();
          } else if (newValue === 2) {
            if (isAuthenticated) {
              navigate('/profile');
            } else {
              onOpenAuthModal('Acesse sua conta para ver seus pedidos e pontos.');
            }
          } else if (newValue === 3) {
            navigate('/sobre');
          }
        }}
        sx={{
          bgcolor: 'surfaceContainerLow',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            }
          }
        }}
      >
        <BottomNavigationAction label="Cardápio" icon={<ShoppingBag className="w-5 h-5" />} />
        <BottomNavigationAction label="Montar Bolo" icon={<Sparkles className="w-5 h-5" />} />
        <BottomNavigationAction label="Meu Perfil" icon={<User className="w-5 h-5" />} />
        <BottomNavigationAction label="Sobre Nós" icon={<Store className="w-5 h-5" />} />
      </BottomNavigation>
    </Paper>
  );
};
