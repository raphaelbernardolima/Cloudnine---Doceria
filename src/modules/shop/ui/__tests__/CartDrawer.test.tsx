import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartDrawer } from '../CartDrawer';
import { useCartStore } from '@/src/core/store/useCartStore';
import { useUIStore } from '@/src/core/store/useUIStore';
import { BrowserRouter } from 'react-router-dom';

// Mocking Stores
vi.mock('@/src/core/store/useCartStore', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('@/src/core/store/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

describe('CartDrawer', () => {
  it('renders correctly when closed', () => {
    // @ts-ignore
    useCartStore.mockReturnValue({
      cartItems: [],
      isCartOpen: false,
      setIsCartOpen: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      appliedDiscount: 0,
      clearCart: vi.fn()
    });

    // @ts-ignore
    useUIStore.mockReturnValue({
      showToast: vi.fn()
    });

    render(
      <BrowserRouter>
        <CartDrawer />
      </BrowserRouter>
    );

    // The drawer should not be visible
    expect(screen.queryByText('Seu Carrinho')).not.toBeInTheDocument();
  });
});
