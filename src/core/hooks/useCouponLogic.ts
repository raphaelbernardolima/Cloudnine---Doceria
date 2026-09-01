import { useCallback } from 'react';
import { useStore } from '@/src/core/store/useStore';

export function useCouponLogic() {
  const { coupons, cartItems, setAppliedDiscount, showToast } = useStore();

  const handleApplyCoupon = useCallback((code: string) => {
    const upperCode = code.toUpperCase();
    const matchedCoupon = coupons.find(c => c.codigo.toUpperCase() === upperCode && c.ativo);

    if (matchedCoupon) {
      const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

      if (subtotal < matchedCoupon.minimoCompra) {
        showToast(`Pedido mínimo de R$ ${matchedCoupon.minimoCompra.toFixed(2)} para este cupom.`);
        return;
      }

      if (matchedCoupon.tipoDesconto === 'porcentagem') {
        setAppliedDiscount(subtotal * (matchedCoupon.valor / 100));
        showToast(`Cupom ${matchedCoupon.codigo} de ${matchedCoupon.valor}% aplicado!`);
      } else if (matchedCoupon.tipoDesconto === 'fixo') {
        setAppliedDiscount(matchedCoupon.valor);
        showToast(`Cupom ${matchedCoupon.codigo} de R$ ${matchedCoupon.valor.toFixed(2)} OFF aplicado!`);
      } else if (matchedCoupon.tipoDesconto === 'frete_gratis') {
        showToast(`Frete grátis aplicado com o cupom ${matchedCoupon.codigo}!`);
      }
    } else {
      showToast('Cupom inválido ou expirado.');
    }
  }, [coupons, cartItems, setAppliedDiscount, showToast]);

  return { handleApplyCoupon };
}
