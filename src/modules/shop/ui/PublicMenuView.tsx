import React, { useState } from 'react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { ProductCard } from '@/src/modules/shop/ui/ProductCard';
import { Box, Typography, Container, Grid, Dialog, IconButton } from '@mui/material';
import { X, BookOpen, Cake } from '@phosphor-icons/react';
import { SEO } from '@/src/core/ui/shared/SEO';
import { Product } from '@/src/core/types';

export const PublicMenuView: React.FC = () => {
  const { products, storeInfo } = useDataStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map(p => p.categoria)));

  return (
    <div className="min-h-screen bg-(--color-surface-container-lowest) animate-in fade-in pb-10">
      <SEO title="Cardápio Digital" description="Cardápio digital Cloudnine Doceria" />
      
      {/* Header Público */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Container maxWidth="md">
          <Box sx={{ py: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Cake className="w-8 h-8 text-(--color-primary)" />
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'text.primary' }}>
              Nosso Cardápio
            </Typography>
          </Box>
        </Container>
      </div>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {storeInfo?.historia_loja && (
          <Box sx={{ mb: 4, textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              "{storeInfo.historia_loja}"
            </Typography>
          </Box>
        )}

        {categories.map(category => {
          const categoryProducts = products.filter(p => p.categoria === category);
          if (categoryProducts.length === 0) return null;

          return (
            <Box key={category} sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <BookOpen className="w-6 h-6 text-(--color-primary)" />
                <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                  {category}
                </Typography>
                <Box sx={{ flexGrow: 1, height: 1, bgcolor: 'divider' }} />
              </Box>
              
              <Grid container spacing={3}>
                {categoryProducts.map(product => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                    <ProductCard 
                      product={product} 
                      onOpenQuickView={() => setQuickViewProduct(product)} 
                      readOnly={true} 
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Container>

      {/* Modal Quick View Básico sem botão de carrinho */}
      <Dialog 
        open={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', m: 2 } } }}
      >
        {quickViewProduct && (
          <Box sx={{ position: 'relative' }}>
            <IconButton 
              onClick={() => setQuickViewProduct(null)}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 10 }}
            >
              <X />
            </IconButton>
            <img 
              src={quickViewProduct.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'} 
              alt={quickViewProduct.nome}
              style={{ width: '100%', height: 300, objectFit: 'cover' }}
            />
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{quickViewProduct.nome}</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                R$ {quickViewProduct.preco.toFixed(2).replace('.', ',')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {quickViewProduct.descricao}
              </Typography>
            </Box>
          </Box>
        )}
      </Dialog>
    </div>
  );
};
