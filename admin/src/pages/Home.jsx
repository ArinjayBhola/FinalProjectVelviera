import React, { useState, useContext, useEffect } from "react";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import Card from "../components/ui/Card";
import { HiOutlineCube, HiOutlineShoppingBag, HiOutlineCurrencyDollar, HiOutlineChartPie } from "react-icons/hi2";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const Home = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentSales: [],
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);
  const { serverUrl } = useContext(authDataContext);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/admin/stats`, { withCredentials: true });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#2c7b89', '#4fd1c5', '#81e6d9', '#b2f5ea', '#234e52'];

  const kpis = [
    { name: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: 'text-green-600' },
    { name: 'Total Orders', value: stats.totalOrders, icon: HiOutlineShoppingBag, color: 'text-blue-600' },
    { name: 'Products', value: stats.totalProducts, icon: HiOutlineCube, color: 'text-purple-600' },
    { name: 'Avg. Order', value: stats.totalOrders > 0 ? `₹${Math.round(stats.totalRevenue / stats.totalOrders)}` : 'N/A', icon: HiOutlineChartPie, color: 'text-orange-600' },
  ];

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Analytics...</div>;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-base)]">Trend Tracker</h1>
        <p className="text-[var(--text-muted)] text-sm">Real-time performance analytics for Velviera.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.name} className="flex items-center gap-6 border-none shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl bg-[var(--background-subtle)] ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{kpi.name}</p>
              <h3 className="text-2xl font-black">{kpi.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6 min-h-[400px]">
          <div>
            <h3 className="font-bold text-lg">Sales Trend (Last 7 Days)</h3>
            <p className="text-xs text-[var(--text-muted)]">Daily revenue updates</p>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.recentSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-base)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background-base)', border: '1px solid var(--border-base)', borderRadius: '8px' }}
                  itemStyle={{ color: '#2c7b89', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#2c7b89" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 min-h-[400px]">
          <div>
            <h3 className="font-bold text-lg">Category Performance</h3>
            <p className="text-xs text-[var(--text-muted)]">Sales distribution by category</p>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-base)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background-base)', border: '1px solid var(--border-base)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
