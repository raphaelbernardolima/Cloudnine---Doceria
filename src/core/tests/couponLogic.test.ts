import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useCouponLogic } from '../hooks/useCouponLogic';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

// Mocking Stores
vi.mock('../store/useCartStore', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('../store/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

// Mocking Supabase Client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({
    data: {
      codigo: 'BEMVINDO',
      tipo_desconto: 'fixo',
      valor: 10,
      ativo: true,
      data_expiracao: new Date(Date.now() + 86400000).toISOString(),
    },
    error: null,
  }),
};

vi.mock('@/src/core/services/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

describe('useCouponLogic', () => {
  it('should validate and apply a valid coupon', async () => {
    const setAppliedDiscountMock = vi.fn();
    const showToastMock = vi.fn();

    // @ts-ignore
    useCartStore.mockReturnValue({
      cartItems: [
        { unitPrice: 50, quantity: 2 }, // Subtotal: 100
      ],
      setAppliedDiscount: setAppliedDiscountMock,
    });

    // @ts-ignore
    useUIStore.mockReturnValue({
      showToast: showToastMock,
    });

    const { result } = renderHook(() => useCouponLogic());

    await act(async () => {
      await result.current.handleApplyCoupon('BEMVINDO');
    });

    expect(setAppliedDiscountMock).toHaveBeenCalledWith(10);
    expect(showToastMock).toHaveBeenCalledWith('Cupom BEMVINDO de R$ 10.00 OFF aplicado!');
  });
});
