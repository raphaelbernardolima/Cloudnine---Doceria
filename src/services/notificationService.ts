export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações Push.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendOrderStatusNotification(orderId: string | number, status: string, clienteNome?: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  let title = 'Atualização no seu pedido - Cloudnine';
  let body = `O status do seu pedido #${orderId} foi atualizado.`;

  if (status === 'saiu_entrega') {
    title = '🛵 Seu pedido está a caminho!';
    body = `Olá ${clienteNome || 'Cliente'}, seu pedido #${orderId} saiu para entrega e logo chegará até você!`;
  } else if (status === 'entregue') {
    title = '🎉 Pedido Entregue!';
    body = `Olá ${clienteNome || 'Cliente'}, seu pedido #${orderId} foi marcado como entregue. Bom apetite!`;
  } else if (status === 'pronto_retirada') {
    title = '📦 Pedido Pronto para Retirada!';
    body = `Olá ${clienteNome || 'Cliente'}, seu pedido #${orderId} está pronto para ser retirado na loja!`;
  } else {
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
  } catch (err) {
    console.error('Erro ao enviar notificação Push:', err);
  }
}
