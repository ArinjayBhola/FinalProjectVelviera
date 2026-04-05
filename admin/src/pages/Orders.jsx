import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/ui/Card';
import { HiOutlineShoppingBag, HiOutlineMapPin, HiOutlinePhone, HiOutlineCalendarDays, HiOutlineArrowUturnLeft, HiCheckCircle, HiXCircle } from "react-icons/hi2";


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | returns | completed
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.post(`${serverUrl}/api/order/status`, { orderId, status }, { withCredentials: true });
      if ((response.status === 200 || response.status === 201) && response.data.success) {
        showAlert("Order Updated", `Status changed to "${status}".`, "success");
        await fetchAllOrders();
      } else {
        showAlert("Error", response.data?.message || "Failed to update order status", "error");
      }
    } catch (error) {
      showAlert("Error", "Something went wrong while updating the order status.", "error");
    }
  };

  const statusHandler = (e, orderId) => updateOrderStatus(orderId, e.target.value);
  const approveReturn = (orderId) => updateOrderStatus(orderId, "Return Approved");
  const rejectReturn = (orderId) => updateOrderStatus(orderId, "Return Rejected");
  const markReturned = (orderId) => updateOrderStatus(orderId, "Returned");

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const returnStatuses = ['Return Requested', 'Return Approved', 'Return Rejected', 'Returned'];
  const completedStatuses = ['Delivered', 'Cancelled', 'Returned', 'Return Rejected'];

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'returns') return returnStatuses.includes(o.status);
    if (filter === 'active') return !completedStatuses.includes(o.status) && !returnStatuses.includes(o.status);
    if (filter === 'completed') return completedStatuses.includes(o.status);
    return true;
  });

  const returnRequestCount = orders.filter(o => o.status === 'Return Requested').length;

  const tabClass = (key) =>
    `px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
      filter === key
        ? 'border-[var(--brand-primary)] text-[var(--text-base)]'
        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'
    }`;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Orders Management</h1>
        <p className="text-[var(--text-muted)] text-sm">Monitor and update the fulfillment status of all customer orders.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[var(--border-base)] overflow-x-auto">
        <button onClick={() => setFilter('all')} className={tabClass('all')}>All ({orders.length})</button>
        <button onClick={() => setFilter('active')} className={tabClass('active')}>Active</button>
        <button onClick={() => setFilter('returns')} className={tabClass('returns')}>
          Returns
          {returnRequestCount > 0 && (
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-purple-500 text-white rounded-full">{returnRequestCount} new</span>
          )}
        </button>
        <button onClick={() => setFilter('completed')} className={tabClass('completed')}>Completed</button>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Card key={i} className="animate-pulse h-48" />)
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <Card key={index} className={`flex flex-col lg:flex-row gap-8 items-start relative ${
              order.status === 'Return Requested' ? 'border-purple-400 ring-2 ring-purple-400/20' : ''
            }`}>
              {order.status === 'Return Requested' && (
                <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 flex items-center gap-2 rounded-t-soft">
                  <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" /> Return Requested — action required
                </div>
              )}
              <div className={`flex-shrink-0 p-4 bg-[var(--background-subtle)] rounded-soft text-[var(--brand-primary)] ${order.status === 'Return Requested' ? 'mt-6' : ''}`}>
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
                      <span>{order.address.street}, {order.address.city}, {order.address.state}, {order.address.country} - {order.address.zipcode || order.address.pinCode}</span>
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
                  
                  <div className="w-full md:w-48 flex flex-col gap-2">
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
                      <option value="Cancelled">Cancelled</option>
                      {/* Return Requested is user-initiated and only shown when already in that state */}
                      {order.status === 'Return Requested' && (
                        <option value="Return Requested">Return Requested</option>
                      )}
                      <option value="Return Approved">Return Approved</option>
                      <option value="Returned">Returned</option>
                      <option value="Return Rejected">Return Rejected</option>
                    </select>

                    {/* Return-specific quick actions */}
                    {order.status === 'Return Requested' && (
                      <div className="flex flex-col gap-2 mt-2 p-3 bg-purple-50 border border-purple-200 rounded-soft">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Handle Return</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approveReturn(order._id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-soft transition-colors"
                          >
                            <HiCheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectReturn(order._id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-soft transition-colors"
                          >
                            <HiXCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'Return Approved' && (
                      <button
                        type="button"
                        onClick={() => markReturned(order._id)}
                        className="mt-2 flex items-center justify-center gap-1 px-3 py-2 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--background-base)] text-xs font-bold rounded-soft transition-opacity"
                      >
                        <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" /> Mark as Returned
                      </button>
                    )}
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
