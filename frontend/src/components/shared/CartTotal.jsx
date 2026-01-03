import React, { useContext } from 'react';
import { shopDataContext } from '../../context/ShopContext';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(shopDataContext);

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Order Summary</h3>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Subtotal</span>
          <span>{currency} {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Shipping</span>
          <span>{currency} {delivery_fee.toFixed(2)}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-[var(--border-base)] flex justify-between items-center">
        <span className="font-bold">Total</span>
        <span className="text-xl font-bold">{currency} {total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartTotal;
