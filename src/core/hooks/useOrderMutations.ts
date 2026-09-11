import { Order, AuditLog } from '@/src/core/types';
import { formatCurrency } from '@/src/core/utils/formatters';
import { getSupabaseClient } from '@/src/core/services/supabase';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useCartStore } from '@/src/core/store/useCartStore';
import { useUIStore } from '@/src/core/store/useUIStore';
import { sendOrderStatusNotification, requestNotificationPermission } from '@/src/core/services/notificationService';

export function useOrderMutations() {
  const handlePlaceOrder = async (newOrderData: Partial<Order>) => {
    requestNotificationPermission().catch(() => { });
    
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Verifique sua conexão antes de finalizar o pedido.');
      return;
    }

    try {
      const { currentUser, loyaltySettings, auditLogs, setAuditLogs, setCurrentUser } = useDataStore.getState();
      const { cartItems: cartItemsState, clearCart, setAppliedDiscount, appliedDiscount, appliedCouponCode } = useCartStore.getState();

      const orderDataToSubmit = {
        cliente_id: currentUser?.id || 'guest',
        cliente_nome: newOrderData.cliente_nome || currentUser?.nome || 'Cliente Cloudnine',
        cliente_telefone: newOrderData.cliente_telefone || currentUser?.telefone || '',
        metodo_pagamento: newOrderData.metodo_pagamento || 'pix',
        tipo_entrega: newOrderData.tipo_entrega || 'entrega',
        data_agendada: newOrderData.data_agendada,
        horario_agendado: newOrderData.horario_agendado,
        endereco_entreg: newOrderData.endereco_entreg || '',
        appliedDiscount: appliedDiscount,
        cupom_usado: appliedCouponCode
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cartItemsState, orderData: orderDataToSubmit })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar checkout');
      }

      // Member get Member (Indique e Ganhe): Recompensa o dono do código usado
      const client = getSupabaseClient();
      if (client && appliedCouponCode) {
        // Tenta achar um perfil com este codigo_indicacao
        const { data: referrerProfile } = await client
          .from('Perfis')
          .select('*')
          .ilike('codigo_indicacao', appliedCouponCode)
          .maybeSingle();

        if (referrerProfile) {
          // Dá R$ 5 de cashback para quem indicou
          const novoSaldo = (referrerProfile.walletBalance || 0) + 5;
          await client.from('Perfis').update({ walletBalance: novoSaldo }).eq('id', referrerProfile.id);
          
          // Se o dono do código for o usuário atual (mesmo não sendo ideal usar o próprio código, testamos localmente)
          if (currentUser?.id === referrerProfile.id) {
            setCurrentUser({ ...currentUser, walletBalance: novoSaldo });
          }
        }
      }

      // Supabase realtime will catch the new order and update the state, but we can clear the cart immediately.
      clearCart();
      setAppliedDiscount(0, null);

      // We skip manual loyalty insertion here because it ideally should be done on the backend.
      // But for audit logs, we'll keep the frontend register for demonstration.
      const novoLog: AuditLog = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        admin_id: currentUser?.id || 'system',
        admin_nome: currentUser?.nome || 'Cliente',
        acao: 'NOVO_PEDIDO',
        detalhes: `Novo pedido #${result.orderId} realizado por ${orderDataToSubmit.cliente_nome} no valor de ${formatCurrency(result.totalCalculado)}`
      };

      if (client) {
        await client.from('logs_auditoria').insert([{
          acao: novoLog.acao,
          detalhes: novoLog.detalhes,
          admin_id: currentUser?.id || null
        }]);
      }

      setAuditLogs([novoLog, ...auditLogs]);
      useUIStore.getState().showToast('Pedido realizado com sucesso!');
      
    } catch (err: any) {
      console.error("Erro ao realizar pedido:", err);
      useUIStore.getState().showToast(`Erro ao processar o pedido: ${err.message || 'Falha na conexão com o banco de dados.'}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: Order['status']) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Não é possível atualizar o status agora.');
      return;
    }

    try {
      const { orders, setOrders } = useDataStore.getState();
      const targetOrder = orders.find(o => o.id === orderId);
      const client = getSupabaseClient();
      
      if (client) {
        const { error } = await client.from('pedidos').update({ status: newStatus }).eq('id', orderId);
        if (error) throw new Error(error.message);
      }
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // SPLIT DE PAGAMENTO PARA ENTREGADORES
      if (newStatus === 'entregue' && targetOrder && targetOrder.tipo_entrega === 'entrega' && targetOrder.entregador_id) {
        const { drivers, setDrivers, expenses, setExpenses } = useDataStore.getState();
        const driver = drivers.find(d => d.id === targetOrder.entregador_id);
        
        if (driver) {
          // Increment Driver Earnings
          const taxa = driver.taxaPorEntrega || 5.00;
          setDrivers(drivers.map(d => 
            d.id === driver.id 
              ? { ...d, pedidosEntregues: d.pedidosEntregues + 1, totalGanhos: d.totalGanhos + taxa, status: 'disponivel' } 
              : d
          ));
          
          // Lança a taxa de entrega como Despesa automaticamente no financeiro
          const newExpense = {
            id: Date.now().toString(),
            descricao: `Frete (Repasse) - Pedido #${targetOrder.id} - ${driver.nome}`,
            valor: taxa,
            data: new Date().toISOString().split('T')[0],
            categoria: 'Logística / Fretes'
          };
          setExpenses([...expenses, newExpense as any]);
        }
      }

      if (newStatus === 'saiu_entrega' || newStatus === 'entregue') {
        sendOrderStatusNotification(orderId, newStatus, targetOrder?.cliente_nome);
      }
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);
      useUIStore.getState().showToast(`Erro ao atualizar status: ${err.message || 'Falha na conexão.'}`);
    }
  };

  const handleAssignDriver = async (orderId: number | string, driverId: string) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Não é possível atribuir entregador agora.');
      return;
    }

    try {
      const { orders, setOrders } = useDataStore.getState();
      const client = getSupabaseClient();
      
      if (client) {
        const { error } = await client.from('pedidos').update({ entregador_id: driverId }).eq('id', orderId);
        if (error) throw new Error(error.message);
      }
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, entregador_id: driverId } : o));
      useUIStore.getState().showToast('Entregador atribuído com sucesso!');
    } catch (err: any) {
      console.error("Erro ao atribuir entregador:", err);
      useUIStore.getState().showToast(`Erro ao atribuir entregador: ${err.message || 'Falha na conexão.'}`);
    }
  };

  const handleSubmitReview = async (orderId: number | string, rating: number, comment: string) => {
    try {
      const { orders, setOrders, products, setProducts } = useDataStore.getState();
      const targetOrder = orders.find(o => o.id === orderId);
      if (!targetOrder) return;

      const newReview = { rating, comment, date: new Date().toISOString() };
      
      // Update Order
      setOrders(orders.map(o => o.id === orderId ? { ...o, avaliacao: newReview } : o));

      // Update Products inside the order to contain the review for social proof
      const updatedProducts = products.map(p => {
        const isProductInOrder = targetOrder.itens.some(item => item.produto_id === p.id);
        if (isProductInOrder) {
          const productReview = {
            id: Date.now().toString() + p.id,
            userId: targetOrder.cliente_id,
            userName: targetOrder.cliente_nome,
            rating,
            comment,
            date: newReview.date
          };
          const existingReviews = p.avaliacoes || [];
          return { ...p, avaliacoes: [productReview, ...existingReviews] };
        }
        return p;
      });
      
      setProducts(updatedProducts);

      useUIStore.getState().showToast('Avaliação enviada com sucesso! Muito obrigado!');
    } catch (err: any) {
      console.error("Erro ao enviar avaliação:", err);
      useUIStore.getState().showToast(`Erro ao enviar avaliação: ${err.message}`);
    }
  };

  return { handlePlaceOrder, handleUpdateOrderStatus, handleAssignDriver, handleSubmitReview };
}
