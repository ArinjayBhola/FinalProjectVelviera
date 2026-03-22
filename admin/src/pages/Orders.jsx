import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/ui/Card';
import { HiOutlineShoppingBag, HiOutlineMapPin, HiOutlinePhone, HiOutlineCalendarDays } from "react-icons/hi2";


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { serverUrl } = useContext(authDataContext);
  const { showAlert } = useModal();

  const fetchAllOrders = async () => {
    try {
      const response = await axios.post(`${serverUrl}/api/order/list`, {}, { withCredentials: true });
      if (response.data) {
        setOrders(response.data.reverse());
      }
    } catch (error) {
      showAlert("Error", "Failed to fetch orders. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.post(`${serverUrl}/api/order/status`, { orderId, status: e.target.value }, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        if (response.data.success) {
          showAlert("Order Updated", "The order status has been successfully updated.", "success");
          await fetchAllOrders();
        } else {
          showAlert("Error", response.data.message || "Failed to update order status", "error");
        }
      } else {
        showAlert("Error", response.data.message || "Failed to update order status due to server error.", "error");
      }
    } catch (error) {
      showAlert("Error", "Something went wrong while updating the order status.", "error");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Orders Management</h1>
        <p className="text-[var(--text-muted)] text-sm">Monitor and update the fulfillment status of all customer orders.</p>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Card key={i} className="animate-pulse h-48" />)
        ) : orders.length > 0 ? (
          orders.map((order, index) => (
            <Card key={index} className="flex flex-col lg:flex-row gap-8 items-start relative">
              <div className="flex-shrink-0 p-4 bg-[var(--background-subtle)] rounded-soft text-[var(--brand-primary)]">
                <HiOutlineShoppingBag className="w-10 h-10" />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {/* Items & Customer */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm font-bold">
                        {item.name} <span className="text-[var(--text-muted)]">× {item.quantity}</span> 
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-[var(--background-subtle)] border border-[var(--border-base)] rounded-sm">{item.size}</span>
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <p className="text-sm font-bold">{order.address.firstName} {order.address.lastName}</p>
                    <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                      <HiOutlineMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{order.address.street}, {order.address.city}, {order.address.state}, {order.address.country} - {order.address.pinCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <HiOutlinePhone className="w-4 h-4 flex-shrink-0" />
                      <span>{order.address.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <span className="w-20 font-medium">Items</span>
                      <span className="font-bold text-[var(--text-base)]">{order.items.length}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <span className="w-20 font-medium">Method</span>
                      <span className="font-bold text-[var(--text-base)] uppercase tracking-tight">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <span className="w-20 font-medium">Payment</span>
                      <span className={`font-bold ${order.payment ? 'text-green-600' : 'text-orange-500'}`}>
                        {order.payment ? 'Done' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <HiOutlineCalendarDays className="w-4 h-4" />
                      <span className="font-medium">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Status Selection */}
                <div className="flex flex-col md:items-end justify-between gap-6">
                  <p className="text-2xl font-bold tracking-tight">₹{order.amount}</p>
                  
                  <div className="w-full md:w-48">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1 block pl-1">Order Status</label>
                    <select 
                      value={order.status} 
                      onChange={(e) => statusHandler(e, order._id)}
                      className="w-full px-3 py-2 bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-[var(--border-base)] rounded-soft">
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-[var(--text-muted)]">All customer orders will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
