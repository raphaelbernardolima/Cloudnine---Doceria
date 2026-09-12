import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { CaretLeft, CaretRight, ImageBroken } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '@/src/core/types';

interface HeroCarouselProps {
  banners: Banner[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBanners = banners.filter(b => b.ativo);

  // Auto-play logic
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (activeIndex + 1) % activeBanners.length;
        const width = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
          left: width * nextIndex,
          behavior: 'smooth'
        });
        setActiveIndex(nextIndex);
      }
    }, 5000); // 5 seconds autoplay

    return () => clearInterval(interval);
  }, [activeIndex, activeBanners.length]);

  // Handle manual scroll to update dots
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollPosition / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  if (activeBanners.length === 0) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 4, group: 'carousel' }}>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-[32px] shadow-sm hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeBanners.map((banner, index) => (
          <div 
            key={banner.id} 
            className="flex-none w-full h-full snap-center relative aspect-[16/10] sm:aspect-[21/9] md:aspect-[3/1] bg-[var(--color-surface-container-high)] group overflow-hidden cursor-pointer"
            onClick={() => {
              if (banner.link && banner.layout_type === 'clean') {
                navigate(banner.link);
              }
            }}
          >
            {/* Image with object-fit cover to ensure PERFECT resizing regardless of upload dimensions */}
            <img 
              src={banner.image_url} 
              alt="Promoção Especial" 
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                const fallback = document.createElement('div');
                fallback.innerHTML = '<div class="flex flex-col items-center justify-center text-[var(--color-on-surface-variant)] opacity-50"><svg class="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs font-bold uppercase tracking-widest">Imagem Indisponível</span></div>';
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
            
            {/* --- LAYOUT TYPE RENDERING --- */}

            {/* 1. CLASSIC LAYOUT */}
            {(!banner.layout_type || banner.layout_type === 'classic') && banner.cta_text && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6 z-10">
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: '900',
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (banner.link) navigate(banner.link);
                    }}
                  >
                    {banner.cta_text}
                  </Button>
                </div>
              </>
            )}

            {/* 2. GLASSMORPHISM LAYOUT */}
            {banner.layout_type === 'glassmorphism' && banner.cta_text && (
              <>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center transform transition-transform group-hover:scale-105">
                    <h3 className="text-white font-black text-xl sm:text-2xl mb-4 drop-shadow-md">Oferta Especial</h3>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: 'white',
                        color: 'black',
                        fontWeight: '900',
                        borderRadius: 4,
                        py: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'var(--color-surface-container-high)',
                          color: 'var(--color-on-surface)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (banner.link) navigate(banner.link);
                      }}
                    >
                      {banner.cta_text}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* 3. CLEAN LAYOUT */}
            {/* Clean layout doesn't render buttons or overlays, the image itself does the talking. Link triggers on the wrapper div click. */}

          </div>
        ))}
      </div>

      {/* Navigation Arrows (Desktop) */}
      {activeBanners.length > 1 && (
        <>
          <div className="hidden md:flex absolute inset-y-0 left-4 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton 
              onClick={() => scrollToIndex((activeIndex - 1 + activeBanners.length) % activeBanners.length)}
              sx={{ bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', color: 'black', '&:hover': { bgcolor: 'white' } }}
            >
              <CaretLeft />
            </IconButton>
          </div>
          <div className="hidden md:flex absolute inset-y-0 right-4 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton 
              onClick={() => scrollToIndex((activeIndex + 1) % activeBanners.length)}
              sx={{ bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', color: 'black', '&:hover': { bgcolor: 'white' } }}
            >
              <CaretRight />
            </IconButton>
          </div>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex 
                  ? 'bg-[var(--color-primary)] w-6 shadow-sm' 
                  : 'bg-[var(--color-outline-variant)] w-2 hover:bg-[var(--color-outline)]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Global style to hide scrollbar on Webkit */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </Box>
  );
};
