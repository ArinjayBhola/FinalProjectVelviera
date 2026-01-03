import React, { useContext, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import CartTotal from '../components/shared/CartTotal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import axios from 'axios';
import { toast } from 'react-toastify';
import { userDataContext } from '../context/UserContext';

const PlaceOrder = () => {
  const { backendUrl, token, cartItem, setCartItem, getCartAmount, delivery_fee, products } = useContext(shopDataContext);
  const { userData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: userData?.userName || '',
    lastName: '',
    email: userData?.email || '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      let orderItems = [];
      for (const items in cartItem) {
        for (const item in cartItem[items]) {
          if (cartItem[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItem[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        userId: userData._id
      };

      switch (method) {
        case 'cod':
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
          if (response.status === 200 || response.status === 201) {
            setCartItem({});
            navigate('/order');
            toast.success("Order placed successfully!");
          } else {
            toast.error(response.data.message);
          }
          break;

        case 'razorpay':
          const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } });
          if (responseRazorpay.status === 200 || responseRazorpay.status === 201) {
            initPay(responseRazorpay.data.order);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data, status } = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, { headers: { token } });
          if (status === 200 || status === 201) {
            navigate('/order');
            setCartItem({});
            toast.success("Payment successful!");
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 lg:max-w-6xl">
      <form onSubmit={onSubmitHandler} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Delivery Information */}
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold tracking-tight">Delivery Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={onChangeHandler} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={onChangeHandler} required />
          </div>
          <Input label="Email address" type="email" name="email" value={formData.email} onChange={onChangeHandler} required />
          <Input label="Street" name="street" value={formData.street} onChange={onChangeHandler} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" name="city" value={formData.city} onChange={onChangeHandler} required />
            <Input label="State" name="state" value={formData.state} onChange={onChangeHandler} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Zipcode" name="zipcode" value={formData.zipcode} onChange={onChangeHandler} required />
            <Input label="Country" name="country" value={formData.country} onChange={onChangeHandler} required />
          </div>
          <Input label="Phone" type="tel" name="phone" value={formData.phone} onChange={onChangeHandler} required />
        </div>

        {/* Order Summary & Payment */}
        <div className="flex flex-col gap-10">
          <Card className="bg-[var(--background-subtle)]/50">
            <CartTotal />
          </Card>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod('razorpay')}
                className={`flex items-center justify-center p-4 rounded-soft border transition-all ${
                  method === 'razorpay' ? 'border-[var(--brand-primary)] bg-[var(--background-base)] ring-2 ring-[var(--brand-primary)]/10' : 'border-[var(--border-base)] bg-transparent grayscale hover:grayscale-0'
                }`}
              >
                <img src="https://razorpay.com/assets/razorpay-logo-white.svg" alt="Razorpay" className="h-6 dark:block hidden" />
                <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6 dark:hidden block" />
              </button>
              <button
                type="button"
                onClick={() => setMethod('cod')}
                className={`flex items-center justify-center p-4 rounded-soft border transition-all ${
                  method === 'cod' ? 'border-[var(--brand-primary)] bg-[var(--background-base)] ring-2 ring-[var(--brand-primary)]/10' : 'border-[var(--border-base)] bg-transparent'
                }`}
              >
                <span className="text-sm font-bold uppercase tracking-widest leading-none">Cash on Delivery</span>
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="h-14 rounded-full text-lg" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order Now'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
