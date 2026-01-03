import React, { useContext, useEffect, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Order = () => {
  const [orderData, setOrderData] = useState([]);
  const { currency, backendUrl, token } = useContext(shopDataContext);

  const loadOrderData = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrderData();
    }
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
        <p className="text-sm text-[var(--text-muted)]">Track and manage your recent purchases</p>
      </div>

      <div className="flex flex-col gap-4">
        {orderData.length > 0 ? (
          orderData.map((item, index) => (
            <Card key={index} padding={false} className="flex flex-col md:flex-row items-center overflow-hidden">
              <div className="w-full md:w-32 aspect-square bg-[var(--background-subtle)]">
                <img src={item.image1} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span>{currency}{item.price}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>Size: {item.size}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider font-medium">
                    Date: {new Date(item.date).toDateString()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Payment: <span className="font-bold">{item.paymentMethod}</span>
                  </p>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`}></span>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={loadOrderData}>Track Order</Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-[var(--border-base)] rounded-soft">
            <h3 className="text-xl font-medium mb-2">No orders yet</h3>
            <p className="text-[var(--text-muted)]">When you buy something, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
