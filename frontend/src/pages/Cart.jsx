import React, { useContext, useEffect, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineArrowLeft, HiOutlineXMark } from "react-icons/hi2";
import CartTotal from '../components/shared/CartTotal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useModal } from '../context/ModalContext';

const Cart = () => {
  const { products, currency, cartItem, updateQuantity, clearCartHandler } = useContext(shopDataContext);
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();
  const { showConfirm } = useModal();

  const handleClearCart = () => {
    if (cartData.length === 0) return;
    showConfirm(
      "Clear Cart",
      "Are you sure you want to remove all items from your bag?",
      () => clearCartHandler()
    );
  };

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

  const validCartData = cartData.filter(item => products.some(product => product._id === item._id));

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-[70vh]">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Link to="/collection" className="p-2 hover:bg-[var(--background-subtle)] rounded-full transition-colors">
            <HiOutlineArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        </div>
        
        {cartData.length > 0 && (
          <button 
            onClick={handleClearCart}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-4 py-2 hover:bg-red-50 rounded-full"
          >
            <HiOutlineXMark className="w-4 h-4" />
            Clear Bag
          </button>
        )}
      </div>

      {validCartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {validCartData.map((item, index) => {
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
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-[var(--background-subtle)]/50 border-[var(--border-base)]">
                <CartTotal />
                <Button 
                  size="lg" 
                  className="w-full mt-8 rounded-full" 
                  disabled={validCartData.length === 0}
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
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-[var(--background-subtle)] border border-[var(--border-base)] rounded-soft">
          <span className="text-6xl mb-6 drop-shadow-sm">🛍️</span>
          <h3 className="text-2xl font-bold text-[var(--brand-primary)] mb-3">Your cart is empty</h3>
          <p className="text-[var(--text-muted)] max-w-sm mb-10">
            Looks like you haven't added anything to your cart yet. Explore our collections to find your next favorite item!
          </p>
          <Link to="/collection">
            <Button size="lg" className="px-12 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-md transition-transform hover:scale-105">
              Explore Collections
            </Button>
          </Link>
          {cartData.length > 0 && validCartData.length === 0 && (
             <p className="text-xs text-red-400 mt-6 max-w-xs mx-auto">
                Note: Some old items in your cart are no longer available in the store. Please tap "Clear Bag" at the top to refresh your cart.
             </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
