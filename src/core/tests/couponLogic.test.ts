import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCouponLogic } from '../hooks/useCouponLogic';

// Mocking useStore
vi.mock('@/src/core/store/useStore', () => ({
  useStore: () => ({
    cartItems: [
      { unitPrice: 50, quantity: 2 }, // Subtotal: 100
    ],
    setAppliedDiscount: vi.fn(),
    showToast: vi.fn(),
  }),
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
      valor: 20,
      ativo: true,
      minimo_compra: 50,
      data_expiracao: '2030-12-31'
    },
    error: null
  }),
};

vi.mock('@/src/core/services/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

describe('useCouponLogic', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useCouponLogic());
    expect(result.current.handleApplyCoupon).toBeDefined();
  });
});
