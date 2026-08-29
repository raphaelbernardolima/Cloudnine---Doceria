import React, { useState } from 'react';
import { Product } from '@/src/core/types/index';
import { Box, Typography, Button, IconButton, TextField, Dialog, DialogContent, DialogTitle, DialogActions, Stack, Chip, Divider, alpha } from '@mui/material';
import { X, Plus, Minus, ShoppingBag, Flame } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, note?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, note);
    onClose();
    setQuantity(1);
    setNote('');
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ /* @ts-ignore */ 
        sx: { 
          borderRadius: 4, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: 'surfaceContainerLow',
        }
      }}
    >
      <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative' }}>
        <Box 
          component="img" 
          src={product.image_url} 
          alt={product.nome}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 300 }}
        />
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
            display: { md: 'none' }
          }}
        >
          <X className="w-5 h-5" />
        </IconButton>
      </Box>

      <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column' }}>
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
              {product.categoria}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ mt: 0.5 }}>
              {product.nome}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} mb={3}>
            {product.is_best_seller && (
              <Chip icon={<Flame className="w-4 h-4" />} label="Bestseller" size="small" color="warning" variant="outlined" />
            )}
            {product.is_gluten_free && (
              <Chip label="Sem Glúten" size="small" color="success" variant="outlined" />
            )}
          </Stack>

          <Typography variant="body1" color="text.secondary" paragraph>
            {product.descricao}
          </Typography>

          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }} mb={4}>
            R$ {product.preco.toFixed(2).replace('.', ',')}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="subtitle2" gutterBottom>
            Observações (Opcional)
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="Ex: Sem granulado, enviar para presente..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'surfaceContainerHighest', borderRadius: '9999px', p: 0.5, width: 'fit-content' }}>
            <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} size="small">
              <Minus className="w-4 h-4" />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 700, px: 3 }}>
              {quantity}
            </Typography>
            <IconButton onClick={() => setQuantity(quantity + 1)} size="small">
              <Plus className="w-4 h-4" />
            </IconButton>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleAdd}
            startIcon={<ShoppingBag className="w-5 h-5" />}
          >
            Adicionar R$ {(product.preco * quantity).toFixed(2).replace('.', ',')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
