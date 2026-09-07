import { Order, AuditLog } from '@/src/core/types';
import { getSupabaseClient } from '@/src/core/services/supabase';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useCartStore } from '@/src/core/store/useCartStore';
import { sendOrderStatusNotification, requestNotificationPermission } from '@/src/core/services/notificationService';

export function useOrderMutations() {
  const handlePlaceOrder = async (newOrderData: Partial<Order>) => {
    requestNotificationPermission().catch(() => { });
    
    const { currentUser, loyaltySettings, orders, setOrders, auditLogs, setAuditLogs, setCurrentUser } = useDataStore.getState();
    const { clearCart, setAppliedDiscount } = useCartStore.getState();

    const fullOrder: Order = {
      id: newOrderData.id || Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      cliente_id: currentUser?.id || 'usr-guest',
      cliente_nome: newOrderData.cliente_nome || currentUser?.nome || 'Cliente Cloudnine',
      cliente_telefone: newOrderData.cliente_telefone || currentUser?.telefone || '',
      total: newOrderData.total || 0,
      status: newOrderData.status || 'em_preparo',
      metodo_pagamento: newOrderData.metodo_pagamento || 'pix',
      tipo_entrega: newOrderData.tipo_entrega || 'entrega',
      data_agendada: newOrderData.data_agendada,
      horario_agendado: newOrderData.horario_agendado,
      endereco_entreg: newOrderData.endereco_entreg || '',
      itens: newOrderData.itens || []
    };

    const client = getSupabaseClient();
    if (client) {
      const pedidoDB = {
        cliente_id: fullOrder.cliente_id !== 'usr-guest' ? fullOrder.cliente_id : null,
        cliente_nome: fullOrder.cliente_nome,
        cliente_telefone: fullOrder.cliente_telefone,
        metodo_pagamento: fullOrder.metodo_pagamento,
        tipo_entrega: fullOrder.tipo_entrega,
        data_agendada: fullOrder.data_agendada || null,
        horario_agendado: fullOrder.horario_agendado || null,
        total: fullOrder.total,
        status: fullOrder.status,
        endereco_entreg: fullOrder.endereco_entreg
      };

      const { data, error } = await client.from('pedidos').insert([pedidoDB]).select();
      if (!error && data && data.length > 0) {
        fullOrder.id = data[0].id;

        if (fullOrder.itens.length > 0) {
          const itensDB = fullOrder.itens.map(item => ({
            pedido_id: fullOrder.id,
            produto_id: typeof item.produto_id === 'number' ? item.produto_id : null,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            nome_produto: item.nomeProduto || item.nome,
            detalhes_customizados: item.detalhesCustomizados
          }));
          await client.from('itens_pedidos').insert(itensDB);
        }

        if (fullOrder.cliente_id !== 'usr-guest') {
          const pontosGanhos = Math.floor(fullOrder.total * (loyaltySettings?.pontosPorReal || 1));
          if (pontosGanhos > 0) {
            await client.from('historico_fidelidade').insert([{
              cliente_id: fullOrder.cliente_id,
              tipo: 'ganho',
              pontos: pontosGanhos,
              descricao: 'Compra na loja',
              pedido_id: fullOrder.id
            }]);
            
            if (currentUser) {
              const novosPontos = (currentUser.pontosFidelidade || 0) + pontosGanhos;
              await client.from('Perfis').update({ pontos_fidelidade: novosPontos }).eq('id', currentUser.id);
              setCurrentUser({ ...currentUser, pontosFidelidade: novosPontos });
            }
          }
        }
      } else {
        console.error("Erro ao inserir pedido", error);
      }
    }

    setOrders([fullOrder, ...orders]);
    clearCart();
    setAppliedDiscount(0);

    const novoLog: AuditLog = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      admin_id: currentUser?.id || 'system',
      admin_nome: currentUser?.nome || 'Cliente',
      acao: 'NOVO_PEDIDO',
      detalhes: `Novo pedido #${fullOrder.id} realizado por ${fullOrder.cliente_nome} no valor de R$ ${fullOrder.total.toFixed(2)}`
    };

    if (client) {
      await client.from('logs_auditoria').insert([{
        acao: novoLog.acao,
        detalhes: novoLog.detalhes,
        admin_id: currentUser?.id || null
      }]);
    }

    setAuditLogs([novoLog, ...auditLogs]);
  };

  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: Order['status']) => {
    const { orders, setOrders } = useDataStore.getState();
    const targetOrder = orders.find(o => o.id === orderId);
    const client = getSupabaseClient();
    if (client) {
      await client.from('pedidos').update({ status: newStatus }).eq('id', orderId);
    }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    if (newStatus === 'saiu_entrega' || newStatus === 'entregue') {
      sendOrderStatusNotification(orderId, newStatus, targetOrder?.cliente_nome);
    }
  };

  const handleAssignDriver = async (orderId: number | string, driverId: string) => {
    const { orders, setOrders } = useDataStore.getState();
    const client = getSupabaseClient();
    if (client) {
      await client.from('pedidos').update({ entregador_id: driverId }).eq('id', orderId);
    }
    setOrders(orders.map(o => o.id === orderId ? { ...o, entregador_id: driverId } : o));
  };

  return { handlePlaceOrder, handleUpdateOrderStatus, handleAssignDriver };
}
