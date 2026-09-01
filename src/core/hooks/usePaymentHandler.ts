import { useEffect } from 'react';
import { useStore } from '@/src/core/store/useStore';

export function usePaymentHandler() {
  const { showToast } = useStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    const messages: Record<string, string> = {
      success: '🎉 Pagamento aprovado com sucesso! Seu pedido já está sendo preparado.',
      failure: '⚠️ Houve um problema com o pagamento. Por favor, tente novamente ou escolha outra forma de pagamento.',
      pending: '⏳ Seu pagamento está em análise. Avisaremos assim que for aprovado.',
    };

    if (paymentStatus && messages[paymentStatus]) {
      showToast(messages[paymentStatus]);
      // Remove query params sem recarregar a página
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showToast]);
}
