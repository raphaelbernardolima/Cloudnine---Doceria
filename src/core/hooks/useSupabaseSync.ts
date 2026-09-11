import { useEffect } from 'react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useUIStore } from '@/src/core/store/useUIStore';
import { getCurrentSupabaseUser, getSupabaseClient, getStoreConfig } from '@/src/core/services/supabase';
import { sendAdminNewOrderNotification } from '@/src/core/services/notificationService';
import { INITIAL_PRODUCTS } from '@/src/data/doceriaData';

export function useSupabaseSync() {
  const { 
    setCurrentUser,
    setStorePhone, 
    setProducts, 
    setIsLoadingProducts, 
    setOrders,
    setCustomCakeConfig,
    setBanners,
    setStoreInfo,
    setLoyaltySettings
  } = useDataStore();
  const { setNotifications } = useUIStore();

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
      if (config) {
        if (config.telefone) {
          setStorePhone(config.telefone);
        }
        if (config.custom_cake_config) {
          setCustomCakeConfig(config.custom_cake_config);
        }
        if (config.banners) {
          setBanners(config.banners);
        }

        if (config.pontos_por_real !== undefined && config.valor_resgate_por_ponto !== undefined) {
          setLoyaltySettings({
            pontosPorReal: Number(config.pontos_por_real),
            valorResgatePorPonto: Number(config.valor_resgate_por_ponto)
          });
        }
        
        setStoreInfo({
          historia_loja: config.historia_loja || '',
          fotos_loja: config.fotos_loja || [],
          pix_chave: config.pix_chave,
          pix_tipo: config.pix_tipo,
          pix_beneficiario: config.pix_beneficiario,
          pix_cidade: config.pix_cidade
        });
      }
    }
    loadStoreConfig();
  }, [setStorePhone, setCustomCakeConfig, setBanners, setStoreInfo]);

  // Fetch real data from Supabase
  useEffect(() => {
    const client = getSupabaseClient();
    
    const fetchSupabaseData = async () => {
      setIsLoadingProducts(true);
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
        const { data: ordData, error: ordErr } = await client.from('pedidos').select('*, itens_pedidos(*)').order('created_at', { ascending: false });
        if (!ordErr && ordData && ordData.length > 0) {
          const mappedOrders = ordData.map((o: any) => ({
            ...o,
            itens: (o.itens_pedidos || []).map((i: any) => ({
              ...i,
              nomeProduto: i.nome_produto || i.nome
            }))
          }));
          setOrders(mappedOrders as any);
        } else {
          setOrders([]);
        }

        // Fetch users (Perfis) for CRM
        const { data: perfisData, error: perfisErr } = await client.from('Perfis').select('*');
        if (!perfisErr && perfisData) {
          const { setUsers } = useDataStore.getState();
          setUsers(perfisData);
        }

      } catch (err: any) {
        console.error("Error fetching from Supabase", err);
        if (navigator.onLine) {
          useUIStore.getState().showToast(`Erro de comunicação com o servidor: ${err.message || 'Falha ao carregar dados iniciais'}.`);
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchSupabaseData();

    if (!client) return;

    // Realtime Subscriptions
    const channel = client.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        async (payload) => {
          console.log('Realtime Order Change:', payload);
          if (payload.eventType === 'INSERT') {
             sendAdminNewOrderNotification(payload.new.id, payload.new.total);
          }
          const { data: ordData, error: ordErr } = await client.from('pedidos').select('*, itens_pedidos(*)').order('created_at', { ascending: false });
          if (!ordErr && ordData) {
            const mappedOrders = ordData.map((o: any) => ({
              ...o,
              itens: (o.itens_pedidos || []).map((i: any) => ({
                ...i,
                nomeProduto: i.nome_produto || i.nome
              }))
            }));
            useDataStore.getState().setOrders(mappedOrders as any);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        async (payload) => {
          console.log('Realtime Product Change:', payload);
          const { data: prodData } = await client.from('produtos').select('*');
          if (prodData) {
            useDataStore.getState().setProducts(prodData);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [setProducts, setIsLoadingProducts, setOrders]);
}
