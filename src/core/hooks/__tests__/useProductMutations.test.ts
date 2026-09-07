import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useProductMutations } from '../useProductMutations';
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
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: {
      id: 'prod-123',
      nome: 'Bolo Novo',
      preco: 100
    },
    error: null,
  }),
};

vi.mock('@/src/core/services/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

describe('useProductMutations', () => {
  it('should add a new product', async () => {
    const setProductsMock = vi.fn();
    const showToastMock = vi.fn();

    // @ts-ignore
    useDataStore.getState.mockReturnValue({
      products: [],
      setProducts: setProductsMock,
    });

    // @ts-ignore
    useUIStore.getState.mockReturnValue({
      showToast: showToastMock,
    });

    const { result } = renderHook(() => useProductMutations());

    await act(async () => {
      await result.current.handleAddProduct({
        nome: 'Bolo Novo',
        preco: 100,
        descricao: 'Bolo gostoso',
        categoria: 'Bolos',
        estoque: 10,
        image_url: 'bolo.png',
      });
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('produtos');
    expect(mockSupabaseClient.insert).toHaveBeenCalled();
    
    expect(setProductsMock).toHaveBeenCalled();
  });
});
