import React from 'react';
import { SEO } from '@/src/core/ui/shared/SEO';
import { Store, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import { useStore } from '@/src/core/store/useStore';

export function AboutUsView() {
  const { storeInfo, storePhone } = useStore();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, pb: 8, animation: 'fadeIn 0.5s ease-out' }}>
      <SEO 
        title="Sobre a Doceria" 
        description="Conheça a história e o espaço físico da Cloudnine Doceria." 
      />
      {/* Hero Image */}
      {storeInfo.fotos_loja.length > 0 && (
        <Box 
          sx={{ 
            height: { xs: 200, sm: 300, md: 400 }, 
            mx: -2, 
            mt: -3, 
            position: 'relative' 
          }}
        >
          <img 
            src={storeInfo.fotos_loja[0]} 
            alt="Cloudnine Doceria" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <Box 
            sx={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              display: 'flex',
              alignItems: 'flex-end',
              p: 4
            }}
          >
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 900 }}>
              Cloudnine Doceria
            </Typography>
          </Box>
        </Box>
      )}

      {/* Nossa História */}
      <Box sx={{ px: { xs: 1, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store className="w-6 h-6 text-[var(--color-primary)]" />
          Nossa História
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.8 }}>
          {storeInfo.historia_loja}
        </Typography>
      </Box>

      {/* Grid de Fotos (Se houver mais de uma) */}
      {storeInfo.fotos_loja.length > 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, px: { xs: 1, sm: 0 } }}>
          {storeInfo.fotos_loja.slice(1).map((foto, idx) => (
            <Box key={idx} sx={{ height: 150, borderRadius: 4, overflow: 'hidden', boxShadow: 1 }}>
              <img src={foto} alt={`Foto ${idx+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}
        </Box>
      )}

      {/* Informações de Contato e Horários */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, px: { xs: 1, sm: 0 } }}>
        <Box sx={{ p: 4, borderRadius: 4, bgcolor: 'surfaceContainerLow', border: '1px solid', borderColor: 'outlineVariant', boxShadow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
            Localização & Contato
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
              <Phone className="w-4 h-4 text-[var(--color-outline)]" />
              {storePhone}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
              <Mail className="w-4 h-4 text-[var(--color-outline)]" />
              contato@cloudninedoceria.com.br
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4, borderRadius: 4, bgcolor: 'surfaceContainerLow', border: '1px solid', borderColor: 'outlineVariant', boxShadow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
            Horários de Atendimento
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
              <strong>Segunda a Sexta:</strong> 09:00 - 19:00
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
              <strong>Sábados:</strong> 09:00 - 20:00
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
              <strong>Domingos:</strong> 10:00 - 16:00
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}
