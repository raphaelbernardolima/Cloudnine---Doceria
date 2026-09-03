import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { Cake } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, durationMs = 2500 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs]);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFF0EC 0%, #FCDDD4 100%)',
            padding: '40px 20px',
          }}
        >
          {/* Top Text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <Box sx={{ width: '30px', height: '1px', bgcolor: '#D9A89B' }} />
            <Typography sx={{ 
              color: '#8C6B63', 
              letterSpacing: '0.2em', 
              fontSize: '12px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: 'sans-serif'
            }}>
              Confeitaria Artesanal
            </Typography>
            <Box sx={{ width: '30px', height: '1px', bgcolor: '#D9A89B' }} />
          </motion.div>

          {/* Center Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -10, 0] // Floating effect
              }}
              transition={{ 
                scale: { duration: 1, ease: "easeOut" },
                opacity: { duration: 1 },
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
              }}
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 40px rgba(220, 160, 145, 0.3), inset 0 0 0 4px #FCDDD4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}
            >
              <img 
                src="/LogoCloudnine.svg" 
                alt="Cloud Nine Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: 1 }}>
                <Box sx={{ width: '20px', height: '1px', bgcolor: '#D9A89B' }} />
                <Cake size={16} color="#D9A89B" />
                <Box sx={{ width: '20px', height: '1px', bgcolor: '#D9A89B' }} />
              </Box>
              <Typography sx={{ 
                color: '#8C6B63', 
                fontSize: '14px', 
                fontWeight: 500,
                textAlign: 'center',
                maxWidth: '250px'
              }}>
                Onde cada detalhe é uma doçura nas nuvens
              </Typography>
            </motion.div>
          </Box>

          {/* Bottom Loading Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
          >
            <Box sx={{ width: '120px', height: '2px', bgcolor: 'rgba(217, 168, 155, 0.3)', borderRadius: '2px', overflow: 'hidden' }}>
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                 style={{ width: '100%', height: '100%', backgroundColor: '#D9A89B', borderRadius: '2px' }}
               />
            </Box>
            <Typography sx={{ 
              color: '#A68A83', 
              letterSpacing: '0.1em', 
              fontSize: '11px', 
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Carregando os melhores doces...
            </Typography>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
