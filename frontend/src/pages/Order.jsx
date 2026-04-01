import React, { useContext, useEffect, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from "react-router-dom";

const Order = () => {
  const [orderData, setOrderData] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const { currency, backendUrl } = useContext(shopDataContext);
  const { userData } = useContext(userDataContext);
  const navigate = useNavigate();

  const loadOrderData = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/order/userorder', {}, { withCredentials: true });
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id;
            item['updatedAt'] = order.updatedAt;
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancelOrderHandler = async (orderId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/order/cancelorder', { orderId }, { withCredentials: true });
      if (data.success) {
        loadOrderData();
        // showAlert is not in local scope, I should check if it's available via context
      }
    } catch (error) {
      console.log(error);
    }
  };

  const returnOrderHandler = async (orderId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/order/returnorder', { orderId }, { withCredentials: true });
      if (data.success) {
        loadOrderData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData) {
      loadOrderData();
    }
  }, [userData]);

  const activeOrders = orderData.filter(item => item.status !== 'Delivered' && item.status !== 'Cancelled' && item.status !== 'Return Requested');
  const completedOrders = orderData.filter(item => item.status === 'Delivered' || item.status === 'Cancelled' || item.status === 'Return Requested');

  const isReturnable = (updatedAt) => {
    const deliveryDate = new Date(updatedAt);
    const currentDate = new Date();
    const diffInDays = Math.ceil((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7;
  };

  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-[70vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
        <p className="text-sm text-[var(--text-muted)]">Track and manage your recent purchases</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-base)] mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('active')} 
          className={`flex-1 md:flex-none px-8 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'active' ? 'border-[var(--brand-primary)] text-[var(--text-base)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`flex-1 md:flex-none px-8 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'completed' ? 'border-[var(--brand-primary)] text-[var(--text-base)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'}`}
        >
          Archive / Completed ({completedOrders.length})
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {displayedOrders.length > 0 ? (
          displayedOrders.map((item, index) => (
            <Card key={index} padding={false} className="flex flex-col md:flex-row items-center overflow-hidden transition-all hover:shadow-md hover:border-[var(--brand-secondary)]/30">
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
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                      Ordered: {new Date(item.date).toDateString()}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                      Payment: <span className="text-[var(--text-base)]">{item.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === 'Delivered' ? 'bg-green-500' : 
                      item.status === 'Cancelled' ? 'bg-red-500' : 
                      item.status === 'Return Requested' ? 'bg-purple-500' : 'bg-orange-400 animate-pulse'
                    }`}></span>
                    <span className="text-sm font-bold uppercase tracking-tight">{item.status}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Action Buttons */}
                    {(item.status === 'Order Placed' || item.status === 'Packing') && (
                      <Button variant="outline" size="sm" className="text-red-500 border-red-500/20 hover:bg-red-500/5" onClick={() => cancelOrderHandler(item.orderId)}>
                        Cancel Order
                      </Button>
                    )}
                    
                    {item.status === 'Delivered' && isReturnable(item.updatedAt) && (
                      <Button variant="outline" size="sm" className="text-[var(--brand-secondary)] border-[var(--brand-secondary)]/20 hover:bg-[var(--brand-secondary)]/5" onClick={() => returnOrderHandler(item.orderId)}>
                        Return / Replace
                      </Button>
                    )}

                    <Button variant="secondary" size="sm" onClick={loadOrderData}>Track Status</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-[var(--background-subtle)] border border-[var(--border-base)] rounded-soft">
            <span className="text-5xl mb-4">{activeTab === 'active' ? '📦' : '🧾'}</span>
            <h3 className="text-xl font-bold text-[var(--text-base)] mb-2">
              {activeTab === 'active' ? "You don't have any active orders" : "No completed orders yet"}
            </h3>
            <p className="text-[var(--text-muted)] max-w-sm mb-6">
              {activeTab === 'active' 
                ? "When you place a new order, it will appear here so you can track its progress."
                : "Orders that have been fully delivered or completed will be archived here."}
            </p>
            {activeTab === 'active' && (
              <Button onClick={() => navigate('/collection')}>Shop Now</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
