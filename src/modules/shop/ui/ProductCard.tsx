import React from 'react';
import { Product } from '@/src/core/types/index';
import { Card, CardMedia, CardContent, Typography, Box, Button, Skeleton, Chip, alpha } from '@mui/material';
import { Star, Flame, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenQuickView
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        '&:hover .quick-view-btn': { opacity: 1 },
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={product.image_url}
          alt={product.nome}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            '&:hover': { transform: 'scale(1.04)' }
          }}
        />
        
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1, flexWrap: 'wrap', zIndex: 1 }}>
          {product.is_best_seller && (
            <Chip 
              icon={<Flame className="w-3.5 h-3.5" />} 
              label="Bestseller" 
              size="small"
              sx={{ 
                bgcolor: 'rgba(255, 251, 240, 0.9)', 
                color: 'warning.800', 
                border: '1px solid rgba(251, 191, 36, 0.5)',
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }} 
            />
          )}
          {product.is_gluten_free && (
            <Chip 
              label="Sem Glúten" 
              size="small"
              sx={{ 
                bgcolor: 'rgba(236, 253, 245, 0.9)', 
                color: 'success.800', 
                border: '1px solid rgba(16, 185, 129, 0.5)',
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }} 
            />
          )}
        </Box>

        <Button
          className="quick-view-btn"
          onClick={() => onOpenQuickView(product)}
          variant="contained"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            minWidth: 'auto',
            width: 40,
            height: 40,
            borderRadius: '50%',
            p: 0,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            bgcolor: 'rgba(255,255,255,0.9)',
            color: 'grey.900',
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: '#fff', transform: 'scale(1.05)' }
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
          <Box>
            {/* The images don't show the category, they show title and price next to each other, but I'll keep the category for completeness or hide it */}
            <Typography variant="h5" component="h3" sx={{ mb: 0.5, color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
              {product.nome}
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>
            R$ {product.preco.toFixed(0)}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.descricao}
        </Typography>

        <Button 
          variant="contained" 
          fullWidth
          onClick={() => onAddToCart(product)}
          sx={{ 
            bgcolor: 'primary.light', 
            color: 'primary.dark',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.light, 0.8),
              boxShadow: 'none',
            }
          }}
        >
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" sx={{ paddingTop: '75%' }} />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="20%" height={32} />
        </Box>
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 'auto' }} />
      </CardContent>
    </Card>
  );
};
