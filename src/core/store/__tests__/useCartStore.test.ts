import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../useCartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({
      cartItems: [],
      isCartOpen: false,
      appliedDiscount: 0,
    });
  });

  const mockProduct = {
    id: '1',
    nome: 'Bolo de Chocolate',
    preco: 50,
    descricao: 'Bolo fofinho',
    categoria: 'Bolos',
    estoque: 10,
    ingredientes: [],
    image_url: 'url'
  };

  it('should add item to cart', () => {
    const store = useCartStore.getState();
    store.addToCart({ product: mockProduct, quantity: 2, unitPrice: 50 });

    const updatedStore = useCartStore.getState();
    expect(updatedStore.cartItems).toHaveLength(1);
    expect(updatedStore.cartItems[0].product.nome).toBe('Bolo de Chocolate');
    expect(updatedStore.cartItems[0].quantity).toBe(2);
  });

  it('should increment quantity if product already in cart', () => {
    const store = useCartStore.getState();
    store.addToCart({ product: mockProduct, quantity: 2, unitPrice: 50 });
    store.addToCart({ product: mockProduct, quantity: 3, unitPrice: 50 });

    const updatedStore = useCartStore.getState();
    expect(updatedStore.cartItems).toHaveLength(1);
    expect(updatedStore.cartItems[0].quantity).toBe(5);
  });

  it('should remove item from cart', () => {
    const store = useCartStore.getState();
    store.addToCart({ product: mockProduct, quantity: 2, unitPrice: 50 });
    
    const cartItemId = useCartStore.getState().cartItems[0].id;
    useCartStore.getState().removeFromCart(cartItemId);

    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  it('should update quantity correctly', () => {
    const store = useCartStore.getState();
    store.addToCart({ product: mockProduct, quantity: 2, unitPrice: 50 });
    
    const cartItemId = useCartStore.getState().cartItems[0].id;
    useCartStore.getState().updateQuantity(cartItemId, 10);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(10);
  });

  it('should clear the cart', () => {
    const store = useCartStore.getState();
    store.addToCart({ product: mockProduct, quantity: 2, unitPrice: 50 });
    store.setAppliedDiscount(15);
    
    useCartStore.getState().clearCart();

    const updatedStore = useCartStore.getState();
    expect(updatedStore.cartItems).toHaveLength(0);
    expect(updatedStore.appliedDiscount).toBe(0);
  });
});
