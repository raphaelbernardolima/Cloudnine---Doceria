import React from 'react';
import { Drawer, Box, Typography, IconButton, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { X, Bell, CheckCircle2, Circle } from 'lucide-react';
import { useStore } from '@/src/core/store/useStore';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead } = useStore();

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          bgcolor: 'surface',
          borderLeft: '1px solid',
          borderColor: 'outlineVariant',
        }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'outlineVariant' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Bell className="w-5 h-5 text-[var(--color-primary)]" />
          Notificações
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <X className="w-5 h-5" />
        </IconButton>
      </Box>

      <List sx={{ p: 0 }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <Typography variant="body2">Nenhuma notificação no momento.</Typography>
          </Box>
        ) : (
          notifications.map((notif) => (
            <React.Fragment key={notif.id}>
              <ListItem
                alignItems="flex-start"
                sx={{ 
                  py: 2, 
                  px: 3,
                  bgcolor: notif.lida ? 'transparent' : 'primaryContainer',
                  transition: 'background-color 0.3s ease',
                  '&:hover': { bgcolor: notif.lida ? 'surfaceContainerLow' : 'primaryContainer' }
                }}
                secondaryAction={
                  !notif.lida && (
                    <IconButton edge="end" size="small" onClick={() => markNotificationAsRead(notif.id)} title="Marcar como lida">
                      <Circle className="w-4 h-4 text-[var(--color-primary)] fill-current" />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {notif.lida ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-outline)]" />
                  ) : (
                    <Bell className="w-5 h-5 text-[var(--color-primary)]" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notif.lida ? 500 : 800, color: 'onSurface' }}>
                      {notif.titulo}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {notif.mensagem}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'outline', mt: 1, display: 'block' }}>
                        {new Date(notif.created_at).toLocaleString('pt-BR')}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Drawer>
  );
};
