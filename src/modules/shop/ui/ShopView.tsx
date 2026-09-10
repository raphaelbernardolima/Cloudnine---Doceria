import React, { useState, useEffect } from 'react';
import { SEO } from '@/src/core/ui/shared/SEO';
import { ProductCard, ProductSkeleton } from './ProductCard';
import { HeroCarousel } from './HeroCarousel';
import { Sparkle, Cake, Gift, MagnifyingGlass, SlidersHorizontal, MagnifyingGlassMinus } from '@phosphor-icons/react';
import { Product } from '@/src/core/types/index';
import { Box, Typography, Button, TextField, InputAdornment, Grid, Chip, Stack, IconButton, alpha } from '@mui/material';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useCartStore } from '@/src/core/store/useCartStore';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ShopViewProps {
  isLoadingProducts: boolean;
  onOpenCustomCake: () => void;
  onNavigateLoyalty: () => void;
  onOpenQuickView: (p: Product) => void;
}

export function ShopView({
  isLoadingProducts,
  onOpenCustomCake,
  onNavigateLoyalty,
  onOpenQuickView
}: ShopViewProps) {
  const { banners, products, categories } = useDataStore();
  const { addToCart, activeTable, setActiveTable } = useCartStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const mesa = searchParams.get('mesa');
    if (mesa) {
      setActiveTable(mesa);
    }
  }, [searchParams, setActiveTable]);

  const activeBanners = banners.filter(b => b.ativo);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'Todos' || p.categoria === selectedCategory;
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const onAddToCart = (product: Product, quantity = 1) => {
    addToCart({ product, quantity, customNote: undefined, unitPrice: product.preco });
  };

  useEffect(() => {
    const action = searchParams.get('action');
    const category = searchParams.get('category');
    const productId = searchParams.get('product');
    const mesa = searchParams.get('mesa');

    if (mesa) {
      setActiveTable(mesa);
    }

    if (action === 'custom-cake') {
      onOpenCustomCake();
      setSearchParams({});
    } else if (action === 'loyalty') {
      onNavigateLoyalty();
      setSearchParams({});
    }

    if (category && categories.includes(category)) {
      setSelectedCategory(category);
      // Optional: clear param after setting so it doesn't get stuck
      // setSearchParams({}); 
      // But keeping it might be nice for shareable links!
    }

    if (productId) {
      const p = products.find(prod => prod.id === productId);
      if (p) {
        onOpenQuickView(p);
        setSearchParams({}); // Clear so modal can be closed without getting stuck
      }
    }
  }, [searchParams, onOpenCustomCake, onNavigateLoyalty, categories, products, onOpenQuickView, setSearchParams]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, pb: 8, animation: 'fadeIn 0.5s ease-out' }}>
      <SEO 
        title="Cardápio Oficial | Cloudnine Doceria" 
        description="Navegue pelo nosso cardápio e encomende os melhores bolos personalizados e doces de luxo." 
      />

      {/* Banners Carousel */}
      <HeroCarousel banners={banners} />

      {activeTable && (
        <Box sx={{ px: 2 }}>
          <div className="bg-purple-600 text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg">🍽️ Mesa {activeTable}</h3>
              <p className="text-purple-100 text-sm">Os pedidos feitos aqui serão entregues diretamente na sua mesa.</p>
            </div>
            <button 
              onClick={() => setActiveTable(null)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
            >
              Trocar Mesa
            </button>
          </div>
        </Box>
      )}

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
                    <MagnifyingGlass className="w-5 h-5 text-(--color-outline)" />
                  </InputAdornment>
                ),
              }
            }}
          />
          <IconButton
            aria-label="Abrir filtros"
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
        <Box sx={{ 
          textAlign: 'center', 
          py: 10, 
          px: 2, 
          backgroundColor: 'surfaceContainerLowest', 
          borderRadius: 4, 
          border: '1px dashed',
          borderColor: 'outlineVariant' 
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: 'error.light', 
            color: 'error.main', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto', 
            mb: 3,
            opacity: 0.8
          }}>
            <MagnifyingGlassMinus className="w-10 h-10" />
          </Box>
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 800, mb: 1 }}>
            Nenhum doce encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxW: 400, mx: 'auto' }}>
            Não encontramos nenhum produto para "{searchQuery}" nesta categoria. Tente buscar por outro termo ou limpe os filtros.
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 3, borderRadius: 2 }}
            onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
          >
            Limpar Busca
          </Button>
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
