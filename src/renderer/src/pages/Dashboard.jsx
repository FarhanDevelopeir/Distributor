// src/renderer/src/pages/Dashboard.jsx

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useFetch } from '../hooks/useFetch';
import { dashboardAPI } from '../utils/api';
import { fmt, statusBadge } from '../utils/format';
import StatCard from '../components/dashboard/StatCard';
import { LoadingSpinner, ErrorState } from '../components/shared/States';

// ─── Icon paths ───────────────────────────────────────────────────────────────
const ICONS = {
  distributors: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  products:     'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  orders:       'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  revenue:      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-primary-100 rounded-lg shadow-card-md px-3 py-2 text-xs">
      <p className="font-medium text-primary-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name === 'Revenue'
            ? fmt.money(p.value)
            : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data, loading, error, refetch } = useFetch(dashboardAPI.getSummary);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const { stats = {}, recentOrders = [], monthlySales = [] } = data || {};

  // Format monthly sales for recharts
  const chartData = (monthlySales || []).map(r => ({
    month:   r.month?.slice(5) || '',    // "01" → month label
    Revenue: Number(r.revenue) || 0,
    Orders:  Number(r.orders)  || 0,
  }));

  return (
    <div className="space-y-4">
      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          title="Total Revenue"
          value={fmt.moneyShort(stats.totalRevenue)}
          subtitle="All time sales"
          accent="blue"
          iconPath={ICONS.revenue}
        />
        <StatCard
          title="Active Distributors"
          value={stats.activeDistributors ?? '—'}
          subtitle={`${stats.totalDistributors ?? 0} total`}
          accent="green"
          iconPath={ICONS.distributors}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders ?? '—'}
          subtitle={`${stats.totalOrders ?? 0} total orders`}
          accent="yellow"
          iconPath={ICONS.orders}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockProducts ?? '—'}
          subtitle={`${stats.totalProducts ?? 0} total products`}
          accent={stats.lowStockProducts > 0 ? 'red' : 'green'}
          iconPath={ICONS.products}
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Revenue area chart */}
        <div className="card xl:col-span-2">
          <div className="card-header">
            <div>
              <p className="text-sm font-semibold text-primary-900">Monthly Revenue</p>
              <p className="text-2xs text-primary-400 mt-0.5">Last 6 months performance</p>
            </div>
          </div>
          <div className="p-4 h-52">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-primary-300">
                No sales data yet — add your first order to see charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0eaff" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={false} tickLine={false}
                    tickFormatter={v => fmt.moneyShort(v)} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2}
                    fill="url(#revenueGrad)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders bar chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="text-sm font-semibold text-primary-900">Orders / Month</p>
              <p className="text-2xs text-primary-400 mt-0.5">Order volume trend</p>
            </div>
          </div>
          <div className="p-4 h-52">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-primary-300">
                No orders yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0eaff" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Orders" fill="#bfdbfe" radius={[3, 3, 0, 0]}
                    activeBar={{ fill: '#3b82f6' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table ──────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div>
            <p className="text-sm font-semibold text-primary-900">Recent Orders</p>
            <p className="text-2xs text-primary-400 mt-0.5">Latest 5 transactions</p>
          </div>
          <a href="/orders" className="text-xs text-primary-500 hover:text-primary-700 font-medium">
            View all →
          </a>
        </div>
        <div className="table-wrapper">
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-primary-300">
              No orders yet. Create your first order to get started.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Distributor</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="font-mono text-primary-700 text-xs">{order.orderNo}</td>
                    <td>
                      <div className="text-primary-800 font-medium">{order.distributor?.name}</div>
                      <div className="text-2xs text-primary-400">{order.distributor?.code}</div>
                    </td>
                    <td className="text-primary-500 text-xs">{fmt.date(order.orderDate)}</td>
                    <td>
                      <span className={statusBadge[order.status] || 'badge-gray'}>
                        {fmt.capitalize(order.status)}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-primary-800 text-money">
                      {fmt.money(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
