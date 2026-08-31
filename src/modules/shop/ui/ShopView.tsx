import React from 'react';
import { ProductCard, ProductSkeleton } from './ProductCard';
import { Sparkles, Cake, Gift, Search, SlidersHorizontal } from 'lucide-react';
import { Product } from '@/src/core/types/index';
import { Box, Typography, Button, TextField, InputAdornment, Grid, Chip, Stack, IconButton, alpha } from '@mui/material';

interface ShopViewProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoadingProducts: boolean;
  filteredProducts: Product[];
  onOpenCustomCake: () => void;
  onNavigateLoyalty: () => void;
  onAddToCart: (p: Product, qty: number) => void;
  onOpenQuickView: (p: Product) => void;
}

export function ShopView({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  isLoadingProducts,
  filteredProducts,
  onOpenCustomCake,
  onNavigateLoyalty,
  onAddToCart,
  onOpenQuickView
}: ShopViewProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, pb: 8, animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Categories (Pills) - Horizontal Scroll */}
      <Box
        id="shop-categories-filter-bar"
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          maxWidth: '100%',
          width: '100%',
          py: 0.5,
          px: 0.25,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollSnapType: 'x proximity',
        }}
      >
        {categories.map((cat) => (
          <Chip
            id={`category-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            key={cat}
            label={cat}
            onClick={() => setSelectedCategory(cat)}
            color={selectedCategory === cat ? 'primary' : 'default'}
            variant={selectedCategory === cat ? 'filled' : 'outlined'}
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              scrollSnapAlign: 'start',
              cursor: 'pointer',
              userSelect: 'none',
              px: 1.5,
              py: 2.5,
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.875rem',
              bgcolor: selectedCategory === cat ? 'primary.light' : 'surfaceContainerLow',
              color: selectedCategory === cat ? 'primary.dark' : 'text.secondary',
              borderColor: selectedCategory === cat ? 'transparent' : 'outlineVariant',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: selectedCategory === cat ? 'primary.light' : 'surfaceContainerHigh',
                transform: 'translateY(-1px)',
              }
            }}
          />
        ))}
      </Box>

      {/* Header section (Nossas Delicias + Search) */}
      <Stack spacing={4}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Descubra novos sabores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
                bgcolor: 'transparent',
                '& fieldset': {
                  borderColor: 'outlineVariant',
                }
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-5 h-5 text-[var(--color-outline)]" />
                  </InputAdornment>
                ),
              }
            }}
          />
          <IconButton 
            sx={{ 
              border: '1px solid', 
              borderColor: 'outlineVariant', 
              p: 1.5,
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </IconButton>
        </Box>

        <Box>
          <Typography variant="h2" component="h1" sx={{ color: 'text.primary', mb: 1 }}>
            Nossas Delícias
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Artesanal, delicado e feito para você.
          </Typography>
        </Box>
      </Stack>

      {/* Product Catalog Grid */}
      <Grid container spacing={3}>
        {isLoadingProducts ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <ProductSkeleton />
            </Grid>
          ))
        ) : (
          filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <ProductCard
                product={product}
                onAddToCart={(p) => onAddToCart(p, 1)}
                onOpenQuickView={(p) => onOpenQuickView(p)}
              />
            </Grid>
          ))
        )}
      </Grid>

      {!isLoadingProducts && filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="subtitle1" color="text.primary" gutterBottom>
            Nenhum doce encontrado nesta categoria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente buscar por outro termo ou escolha outra categoria do cardápio.
          </Typography>
        </Box>
      )}

      {/* Hero Brand Banner moved to bottom or removed to match screenshots better, but let's keep it as an extra action block at the bottom */}
      <Box sx={{ 
        p: { xs: 4, sm: 6 }, 
        borderRadius: 4, 
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, rgba(254, 240, 245, 0.8) 100%)`,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4
      }}>
        <Box sx={{ maxWidth: 500, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h3" sx={{ mb: 2, color: 'primary.dark' }}>
            Momentos Inesquecíveis Pedem Doces Especiais ☁️
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
            Ingredientes nobres importados, preparo diário e carinho em cada detalhe. Faça seu pedido para entrega agendada ou monte seu bolo exclusivo.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Button variant="contained" onClick={onOpenCustomCake} startIcon={<Cake className="w-4 h-4" />}>
              Bolo Personalizado
            </Button>
            <Button variant="outlined" onClick={onNavigateLoyalty} startIcon={<Gift className="w-4 h-4" />}>
              Cloudnine Club
            </Button>
          </Stack>
        </Box>
        <Box 
          component="img" 
          src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800"
          alt="Doces Cloudnine"
          sx={{ width: { xs: '100%', md: 300 }, height: 200, objectFit: 'cover', borderRadius: 3, transform: 'rotate(2deg)', boxShadow: 3 }}
        />
      </Box>

    </Box>
  );
}
