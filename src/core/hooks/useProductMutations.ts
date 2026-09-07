import { Product } from '@/src/core/types';
import { getSupabaseClient } from '@/src/core/services/supabase';
import { useDataStore } from '@/src/core/store/useDataStore';

export function useProductMutations() {
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    const { products, setProducts } = useDataStore.getState();
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('produtos').insert([newProd]).select();
      if (!error && data) {
        setProducts([data[0], ...products]);
        return;
      }
    }
    const created: Product = { ...newProd, id: Date.now() };
    setProducts([created, ...products]);
  };

  const handleUpdateStock = async (id: number | string, newStock: number) => {
    const { products, setProducts } = useDataStore.getState();
    const client = getSupabaseClient();
    if (client) {
      await client.from('produtos').update({ estoque: newStock }).eq('id', id);
    }
    setProducts(products.map(p => p.id === id ? { ...p, estoque: newStock } : p));
  };

  const handleDeleteProduct = async (id: number | string) => {
    const { products, setProducts } = useDataStore.getState();
    const client = getSupabaseClient();
    if (client) {
      await client.from('produtos').delete().eq('id', id);
    }
    setProducts(products.filter(p => p.id !== id));
  };

  return { handleAddProduct, handleUpdateStock, handleDeleteProduct };
}
