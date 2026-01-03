import React, { useContext, useEffect, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineArrowLeft } from "react-icons/hi2";
import CartTotal from '../components/shared/CartTotal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Cart = () => {
  const { products, currency, cartItem, updateQuantity } = useContext(shopDataContext);
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const tempData = [];
    for (const productId in cartItem) {
      for (const size in cartItem[productId]) {
        if (cartItem[productId][size] > 0) {
          tempData.push({
            _id: productId,
            size: size,
            quantity: cartItem[productId][size],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItem]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/collection" className="p-2 hover:bg-[var(--background-subtle)] rounded-full transition-colors">
          <HiOutlineArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cartData.length > 0 ? (
            cartData.map((item, index) => {
              const productData = products.find((product) => product._id === item._id);
              if (!productData) return null;

              return (
                <Card key={`${item._id}-${item.size}`} padding={false} className="flex overflow-hidden">
                  <div className="w-24 md:w-32 aspect-square bg-[var(--background-subtle)]">
                    <img src={productData.image1} alt={productData.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-lg md:text-xl leading-tight">
                        <Link to={`/productdetail/${item._id}`} className="hover:underline">{productData.name}</Link>
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-[var(--text-muted)]">Size:</span>
                        <span className="font-medium px-2 py-0.5 bg-[var(--background-subtle)] rounded border border-[var(--border-base)]">{item.size}</span>
                      </div>
                      <p className="mt-2 font-medium text-[var(--brand-secondary)]">{currency}{productData.price}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="flex items-center border border-[var(--border-base)] rounded-soft">
                        <button 
                          onClick={() => updateQuantity(item._id, item.size, Math.max(0, item.quantity - 1))}
                          className="px-3 py-1 hover:bg-[var(--background-subtle)] transition-colors"
                        >-</button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-[var(--background-subtle)] transition-colors"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-[var(--border-base)] rounded-soft">
              <h3 className="text-xl font-medium mb-4">Your cart is empty</h3>
              <Link to="/collection">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="bg-[var(--background-subtle)]/50 border-[var(--border-base)]">
              <CartTotal />
              <Button 
                size="lg" 
                className="w-full mt-8 rounded-full" 
                disabled={cartData.length === 0}
                onClick={() => navigate('/placeorder')}
              >
                Proceed to Checkout
              </Button>
              <p className="text-[10px] text-center text-[var(--text-muted)] mt-4 uppercase tracking-widest font-bold">
                Secure SSL Encrypted Checkout
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
