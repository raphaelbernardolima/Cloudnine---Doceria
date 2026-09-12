import { formatCurrency } from '@/src/core/utils/formatters';
import { useCallback } from 'react';
import { useCartStore } from '@/src/core/store/useCartStore';
import { useUIStore } from '@/src/core/store/useUIStore';
import { getSupabaseClient } from '@/src/core/services/supabase';

export function useCouponLogic() {
  const { cartItems, setAppliedDiscount } = useCartStore();
  const { showToast } = useUIStore();

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
      // Tenta buscar como código de indicação no perfil de algum cliente
      const { data: matchedProfile } = await client
        .from('Perfis')
        .select('*')
        .ilike('codigo_indicacao', upperCode)
        .maybeSingle();

      if (matchedProfile) {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        setAppliedDiscount(subtotal * 0.10, upperCode); // 10% discount for referral
        showToast(`Código de Indicação de ${matchedProfile.nome} aplicado! Você ganhou 10% OFF.`);
        return;
      }

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
      showToast(`Pedido mínimo de ${formatCurrency(minimoCompra)} para este cupom.`);
      return;
    }

    const valor = Number(matchedCoupon.valor) || 0;
    if (matchedCoupon.tipo_desconto === 'porcentagem') {
      setAppliedDiscount(subtotal * (valor / 100), upperCode);
      showToast(`Cupom ${matchedCoupon.codigo} de ${valor}% aplicado!`);
    } else if (matchedCoupon.tipo_desconto === 'fixo') {
      setAppliedDiscount(valor, upperCode);
      showToast(`Cupom ${matchedCoupon.codigo} de ${formatCurrency(valor)} OFF aplicado!`);
    } else if (matchedCoupon.tipo_desconto === 'frete_gratis') {
      // Logic for free shipping (could set discount as the shipping fee)
      showToast(`Frete grátis aplicado com o cupom ${matchedCoupon.codigo}!`);
    }
  }, [cartItems, setAppliedDiscount, showToast]);

  return { handleApplyCoupon };
}
