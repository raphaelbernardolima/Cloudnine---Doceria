import { useCallback } from 'react';
import { useStore } from '@/src/core/store/useStore';
import { getSupabaseClient } from '@/src/core/services/supabase';

export function useCouponLogic() {
  const { cartItems, setAppliedDiscount, showToast } = useStore();

  const handleApplyCoupon = useCallback(async (code: string) => {
    const upperCode = code.toUpperCase();
    const client = getSupabaseClient();
    if (!client) {
      showToast('Erro de conexão ao validar cupom.');
      return;
    }

    const { data: matchedCoupon, error } = await client
      .from('cupons')
      .select('*')
      .ilike('codigo', upperCode)
      .eq('ativo', true)
      .maybeSingle();

    if (error || !matchedCoupon) {
      showToast('Cupom inválido ou expirado.');
      return;
    }

    // Check expiration
    if (matchedCoupon.data_expiracao && new Date(matchedCoupon.data_expiracao) < new Date()) {
      showToast('Este cupom já expirou.');
      return;
    }

    const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    const minimoCompra = Number(matchedCoupon.minimo_compra) || 0;
    if (subtotal < minimoCompra) {
      showToast(`Pedido mínimo de R$ ${minimoCompra.toFixed(2)} para este cupom.`);
      return;
    }

    const valor = Number(matchedCoupon.valor) || 0;
    if (matchedCoupon.tipo_desconto === 'porcentagem') {
      setAppliedDiscount(subtotal * (valor / 100));
      showToast(`Cupom ${matchedCoupon.codigo} de ${valor}% aplicado!`);
    } else if (matchedCoupon.tipo_desconto === 'fixo') {
      setAppliedDiscount(valor);
      showToast(`Cupom ${matchedCoupon.codigo} de R$ ${valor.toFixed(2)} OFF aplicado!`);
    } else if (matchedCoupon.tipo_desconto === 'frete_gratis') {
      // Logic for free shipping (could set discount as the shipping fee)
      showToast(`Frete grátis aplicado com o cupom ${matchedCoupon.codigo}!`);
    }
  }, [cartItems, setAppliedDiscount, showToast]);

  return { handleApplyCoupon };
}
