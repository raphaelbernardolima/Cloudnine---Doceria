import { describe, it, expect, beforeEach } from 'vitest';
import { useDataStore } from '../useDataStore';

describe('useDataStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useDataStore.setState({
      currentUser: null,
      products: [],
      isLoadingProducts: false,
      orders: [],
      staff: [],
      auditLogs: [],
      ingredients: [],
      drivers: [],
      coupons: [],
      loyaltySettings: { pontosPorReal: 1, valorResgatePorPonto: 0.1 },
      storePhone: '11999999999',
      storeInfo: { 
        historia_loja: '',
        fotos_loja: []
      },
      banners: [],
      customCakeConfig: {
        tamanhos: [],
        massas: [],
        recheios: [],
        coberturas: [],
        extras: [],
        toppers: []
      }
    });
  });

  it('should set current user', () => {
    const mockUser = {
      id: '123',
      nome: 'Teste',
      sobrenome: 'Silva',
      email: 'teste@teste.com',
      role: 'USUARIO_PADRAO' as const,
      Status: 'ativo' as const,
      telefone: '11999999999',
      dataCriacao: new Date().toISOString(),
      pontosFidelidade: 0
    };

    useDataStore.getState().setCurrentUser(mockUser);
    expect(useDataStore.getState().currentUser?.nome).toBe('Teste');
  });

  it('should set products', () => {
    const mockProducts = [
      {
        id: '1',
        nome: 'Bolo',
        preco: 50,
        descricao: 'Bolo',
        categoria: 'Bolos',
        estoque: 10,
        ingredientes: [],
        image_url: 'url'
      }
    ];

    useDataStore.getState().setProducts(mockProducts);
    expect(useDataStore.getState().products).toHaveLength(1);
    expect(useDataStore.getState().products[0].nome).toBe('Bolo');
  });
});
