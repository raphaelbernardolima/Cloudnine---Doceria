import React, { useState } from 'react';
import { formatCurrency } from '@/src/core/utils/formatters';
import { Product } from '@/src/core/types/index';
import { Box, Typography, Button, IconButton, TextField, Dialog, DialogContent, DialogTitle, DialogActions, Stack, Chip, Divider, alpha, Rating, Avatar } from '@mui/material';
import { X, Plus, Minus, Tote, Fire, Star, User } from '@phosphor-icons/react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useUIStore } from '@/src/core/store/useUIStore';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, note?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const { currentUser, products, setProducts } = useDataStore();
  const { setIsAuthModalOpen, showToast } = useUIStore();
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  
  const handleSubmitReview = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true, "Faça login para avaliar este produto.");
      return;
    }
    if (!newReviewComment.trim()) {
      showToast("Escreva um comentário.");
      return;
    }
    
    const newReview = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: `${currentUser.nome} ${currentUser.sobrenome}`,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString()
    };
    
    const updatedProducts = products.map(p => {
      if (p.id === product.id) {
        const avaliacoes = p.avaliacoes || [];
        return {
          ...p,
          avaliacoes: [newReview, ...avaliacoes]
        };
      }
      return p;
    });
    setProducts(updatedProducts);
    setNewReviewComment('');
    showToast("Avaliação enviada com sucesso!");
  };
  
  const currentProduct = products.find(p => p.id === product.id) || product;

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
      slotProps={{
        paper: {
          sx: { 
            borderRadius: 4, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            bgcolor: 'surfaceContainerLow',
          }
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
          <IconButton aria-label="Fechar modal" onClick={onClose} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {product.is_best_seller && (
              <Chip icon={<Fire className="w-4 h-4" />} label="Bestseller" size="small" color="warning" variant="outlined" />
            )}
            {product.is_gluten_free && (
              <Chip label="Sem Glúten" size="small" color="success" variant="outlined" />
            )}
          </Stack>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {product.descricao}
          </Typography>

          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, mb: 4 }}>
            {formatCurrency(product.preco)}
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
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            variant="outlined"
            slotProps={{ htmlInput: { maxLength: 200 } }}
            helperText={`${note.length}/200 caracteres`}
            sx={{ mb: 4 }}
          />

          <Divider sx={{ mb: 4 }} />

          {/* Reviews Section */}
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Avaliações</Typography>
          
          <Box sx={{ mb: 4, p: 3, bgcolor: 'surfaceContainerHighest', borderRadius: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Deixe sua avaliação</Typography>
            <Rating 
              value={newReviewRating} 
              onChange={(_, newValue) => setNewReviewRating(newValue || 5)} 
              size="large"
              sx={{ mb: 2, color: 'amber.500' }}
            />
            <TextField
              multiline
              rows={2}
              fullWidth
              placeholder="O que achou deste doce?"
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}
            />
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleSubmitReview}
              disableElevation
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Enviar Avaliação
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {currentProduct.avaliacoes && currentProduct.avaliacoes.length > 0 ? (
              currentProduct.avaliacoes.map(review => (
                <Box key={review.id} sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.dark' }}>
                    <User className="w-5 h-5" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{review.userName}</Typography>
                    <Rating value={review.rating} readOnly size="small" sx={{ color: 'amber.500', my: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                      {new Date(review.date).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Nenhuma avaliação ainda. Seja o primeiro a avaliar!
              </Typography>
            )}
          </Box>

        </DialogContent>

        <DialogActions sx={{ 
          p: { xs: 2, md: 3 }, 
          pt: { xs: 2, md: 3 },
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          gap: 2,
          position: 'sticky',
          bottom: 0,
          zIndex: 10
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'surfaceContainerHighest', 
            borderRadius: '9999px', 
            p: 0.5, 
            shrink: 0 
          }}>
            <IconButton aria-label="Diminuir quantidade" onClick={() => setQuantity(Math.max(1, quantity - 1))} size="small">
              <Minus className="w-4 h-4" />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 700, px: 2, minWidth: '2ch', textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton aria-label="Aumentar quantidade" onClick={() => setQuantity(quantity + 1)} size="small">
              <Plus className="w-4 h-4" />
            </IconButton>
          </Box>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleAdd}
            startIcon={<Tote className="w-5 h-5" />}
            sx={{ flexGrow: 1 }}
          >
            Adicionar {formatCurrency(product.preco * quantity)}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
