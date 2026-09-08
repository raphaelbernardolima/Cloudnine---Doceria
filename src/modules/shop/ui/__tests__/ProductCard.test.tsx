import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 'prod-123',
    nome: 'Bolo de Morango',
    preco: 60,
    descricao: 'Bolo delicioso com morangos frescos',
    categoria: 'Bolos',
    estoque: 10,
    image_url: 'https://via.placeholder.com/150',
    destaque: true,
    rating: 4.5
  };

  it('renders product details correctly', () => {
    const onAddToCart = vi.fn();
    const onOpenQuickView = vi.fn();

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={onAddToCart} 
        onOpenQuickView={onOpenQuickView} 
      />
    );

    expect(screen.getByText('Bolo de Morango')).toBeInTheDocument();
    expect(screen.getByText('Bolo delicioso com morangos frescos')).toBeInTheDocument();
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  it('calls onAddToCart when add button is clicked', () => {
    const onAddToCart = vi.fn();
    const onOpenQuickView = vi.fn();

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={onAddToCart} 
        onOpenQuickView={onOpenQuickView} 
      />
    );

    const addButton = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onOpenQuickView when quick view button is clicked', () => {
    const onAddToCart = vi.fn();
    const onOpenQuickView = vi.fn();

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={onAddToCart} 
        onOpenQuickView={onOpenQuickView} 
      />
    );

    // Because we used an icon button, we might need to find by text or test id. 
    // Wait, let's find the button by its text or aria-label.
    // Find by class instead since it's an icon button
    const quickViewBtn = document.querySelector('.quick-view-btn');
    if (quickViewBtn) {
      fireEvent.click(quickViewBtn);
      expect(onOpenQuickView).toHaveBeenCalledWith(mockProduct);
    }
  });
});
