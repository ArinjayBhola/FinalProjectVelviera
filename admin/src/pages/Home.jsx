import React, { useState, useContext, useEffect } from "react";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import Card from "../components/ui/Card";
import { HiOutlineCube, HiOutlineShoppingBag, HiOutlineChartBar } from "react-icons/hi2";

const Home = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const { serverUrl } = useContext(authDataContext);

  const fetchCounts = async () => {
    try {
      const productsRes = await axios.get(`${serverUrl}/api/product/list`);
      setTotalProducts(productsRes.data?.length || 0);

      const ordersRes = await axios.post(`${serverUrl}/api/order/list`, {}, { withCredentials: true });
      setTotalOrders(ordersRes.data?.length || 0);
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const stats = [
    { name: 'Total Products', value: totalProducts, icon: HiOutlineCube, color: 'text-blue-600' },
    { name: 'Total Orders', value: totalOrders, icon: HiOutlineShoppingBag, color: 'text-green-600' },
    { name: 'Average Order Value', value: 'N/A', icon: HiOutlineChartBar, color: 'text-purple-600' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-[var(--text-muted)] text-sm">Welcome back to your administration overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="flex items-center gap-6">
            <div className={`p-4 rounded-full bg-[var(--background-subtle)] ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)]">{stat.name}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <Card className="flex flex-col gap-4">
          <h3 className="font-bold text-lg">Recent Performance</h3>
          <div className="h-64 flex items-center justify-center bg-[var(--background-subtle)] rounded-soft border border-dashed border-[var(--border-base)]">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Analytics module unavailable</p>
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <h3 className="font-bold text-lg">System Status</h3>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">API Server</span>
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Database</span>
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                Operational
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
