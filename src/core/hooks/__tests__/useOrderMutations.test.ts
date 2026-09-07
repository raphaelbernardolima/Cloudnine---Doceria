import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useOrderMutations } from '../useOrderMutations';
import { useDataStore } from '../../store/useDataStore';
import { useUIStore } from '../../store/useUIStore';

// Mocking Stores
vi.mock('../../store/useDataStore', () => ({
  useDataStore: Object.assign(vi.fn(), {
    getState: vi.fn(),
  }),
}));

vi.mock('../../store/useUIStore', () => ({
  useUIStore: Object.assign(vi.fn(), {
    getState: vi.fn(),
  }),
}));

// Mocking Supabase Client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: {
      id: 'pedido-123',
      status: 'pendente'
    },
    error: null,
  }),
};

vi.mock('@/src/core/services/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

describe('useOrderMutations', () => {
  it('should update order status', async () => {
    const setOrdersMock = vi.fn();
    const showToastMock = vi.fn();

    // @ts-ignore
    useDataStore.getState.mockReturnValue({
      orders: [
        { id: 'pedido-123', status: 'pendente' }
      ],
      setOrders: setOrdersMock,
    });

    // @ts-ignore
    useUIStore.getState.mockReturnValue({
      showToast: showToastMock,
    });

    const { result } = renderHook(() => useOrderMutations());

    await act(async () => {
      await result.current.handleUpdateOrderStatus('pedido-123', 'em_preparo');
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('pedidos');
    expect(mockSupabaseClient.update).toHaveBeenCalledWith({ status: 'em_preparo' });
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'pedido-123');
    
    // Check if the mock of setOrders was called
    expect(setOrdersMock).toHaveBeenCalled();
  });
});
