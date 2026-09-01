import { useEffect } from 'react';
import { useStore } from '@/src/core/store/useStore';
import { getCurrentSupabaseUser, getSupabaseClient, getStoreConfig } from '@/src/core/services/supabase';
import { INITIAL_PRODUCTS } from '@/src/data/doceriaData';

export function useSupabaseSync() {
  const { 
    setCurrentUser, 
    setStorePhone, 
    setProducts, 
    setIsLoadingProducts, 
    setOrders 
  } = useStore();

  // Load User Session
  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentSupabaseUser();
      if (user) {
        setCurrentUser(user);
      }
    }
    loadUser();
  }, [setCurrentUser]);

  // Load Store Config
  useEffect(() => {
    async function loadStoreConfig() {
      const config = await getStoreConfig();
      if (config && config.telefone) {
        setStorePhone(config.telefone);
      }
    }
    loadStoreConfig();
  }, [setStorePhone]);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      setIsLoadingProducts(true);
      const client = getSupabaseClient();
      if (!client) {
        // Fallback to initial if no supabase configured
        setProducts(INITIAL_PRODUCTS);
        setIsLoadingProducts(false);
        return;
      }

      try {
        // Fetch products
        const { data: prodData, error: prodErr } = await client.from('produtos').select('*');
        if (!prodErr && prodData && prodData.length > 0) {
          setProducts(prodData);
        } else {
          setProducts([]);
        }

        // Fetch orders
        const { data: ordData, error: ordErr } = await client.from('pedidos').select('*, itens_pedidos(*)');
        if (!ordErr && ordData && ordData.length > 0) {
          setOrders(ordData as any);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching from Supabase", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchSupabaseData();
  }, [setProducts, setIsLoadingProducts, setOrders]);
}
