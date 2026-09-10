import { Product } from '@/src/core/types';
import { getSupabaseClient } from '@/src/core/services/supabase';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useUIStore } from '@/src/core/store/useUIStore';

export function useProductMutations() {
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Conecte-se à internet para adicionar produtos.');
      return;
    }
    
    try {
      const { products, setProducts } = useDataStore.getState();
      const client = getSupabaseClient();
      
      if (client) {
        // Remove frontend-only properties before saving to database
        const dbPayload = {
          nome: newProd.nome,
          descricao: newProd.descricao,
          preco: newProd.preco,
          categoria: newProd.categoria,
          estoque: newProd.estoque,
          image_url: newProd.image_url,
          ativo: newProd.ativo
        };
        
        const { data, error } = await client.from('produtos').insert([dbPayload]).select();
        if (error) throw new Error(error.message);
        
        if (data && data.length > 0) {
          setProducts([data[0], ...products]);
          useUIStore.getState().showToast('Produto adicionado com sucesso!');
          return;
        }
      }
      
      // Fallback local se não tiver client
      const created: Product = { ...newProd, id: Date.now() };
      setProducts([created, ...products]);
      useUIStore.getState().showToast('Produto adicionado localmente (Modo Offline).');
    } catch (err: any) {
      console.error("Erro ao adicionar produto:", err);
      useUIStore.getState().showToast(`Erro ao salvar produto: ${err.message}`);
    }
  };

  const handleUpdateStock = async (id: number | string, newStock: number) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Não é possível atualizar estoque agora.');
      return;
    }

    try {
      const { products, setProducts } = useDataStore.getState();
      const client = getSupabaseClient();
      
      if (client) {
        const { error } = await client.from('produtos').update({ estoque: newStock }).eq('id', id);
        if (error) throw new Error(error.message);
      }
      
      setProducts(products.map(p => p.id === id ? { ...p, estoque: newStock } : p));
    } catch (err: any) {
      console.error("Erro ao atualizar estoque:", err);
      useUIStore.getState().showToast(`Erro ao atualizar estoque: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Não é possível excluir o produto.');
      return;
    }

    try {
      const { products, setProducts } = useDataStore.getState();
      const client = getSupabaseClient();
      
      if (client) {
        const { error } = await client.from('produtos').delete().eq('id', id);
        if (error) throw new Error(error.message);
      }
      
      setProducts(products.filter(p => p.id !== id));
      useUIStore.getState().showToast('Produto removido com sucesso!');
    } catch (err: any) {
      console.error("Erro ao excluir produto:", err);
      useUIStore.getState().showToast(`Erro ao remover produto: ${err.message}`);
    }
  };

  return { handleAddProduct, handleUpdateStock, handleDeleteProduct };
}
