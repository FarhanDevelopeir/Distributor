// src/renderer/src/pages/Dashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useFetch } from '../hooks/useFetch';
import { dashboardAPI } from '../utils/api';
import { fmt } from '../utils/format';
import StatCard from '../components/dashboard/StatCard';
import { LoadingSpinner, ErrorState } from '../components/shared/States';

const ICONS = {
  revenue:  'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  profit:   'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  invoices: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  stock:    'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-primary-100 rounded-lg shadow-card-md px-3 py-2 text-xs">
      <p className="font-medium text-primary-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && (p.name === 'Revenue' || p.name === 'Profit')
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

  const { stats = {}, recentInvoices = [], monthlySales = [] } = data || {};

  const chartData = (monthlySales || []).map(r => ({
    month:   r.month?.slice(5) || '',
    Revenue: Number(r.revenue) || 0,
    Profit:  Number(r.profit)  || 0,
    Invoices: Number(r.invoices) || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          title="Total Revenue"
          value={fmt.moneyShort(stats.totalRevenue)}
          subtitle="All time sales"
          accent="blue"
          iconPath={ICONS.revenue}
        />
        <StatCard
          title="Total Profit"
          value={fmt.moneyShort(stats.totalProfit)}
          subtitle="Gross profit"
          accent="green"
          iconPath={ICONS.profit}
        />
        <StatCard
          title="Invoices"
          value={stats.totalInvoices ?? '—'}
          subtitle={`${stats.totalCustomers ?? 0} customers`}
          accent="yellow"
          iconPath={ICONS.invoices}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts ?? '—'}
          subtitle={`${stats.totalProducts ?? 0} products`}
          accent={stats.lowStockProducts > 0 ? 'red' : 'green'}
          iconPath={ICONS.stock}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="card xl:col-span-2">
          <div className="card-header">
            <div>
              <p className="text-sm font-semibold text-primary-900">Monthly Revenue</p>
              <p className="text-2xs text-primary-400 mt-0.5">Last 6 months</p>
            </div>
          </div>
          <div className="p-4 h-52">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-primary-300">
                No sales data yet — create your first invoice.
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

        <div className="card">
          <div className="card-header">
            <div>
              <p className="text-sm font-semibold text-primary-900">Invoices / Month</p>
              <p className="text-2xs text-primary-400 mt-0.5">Billing volume</p>
            </div>
          </div>
          <div className="p-4 h-52">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-primary-300">No invoices yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0eaff" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Invoices" fill="#bfdbfe" radius={[3, 3, 0, 0]} activeBar={{ fill: '#3b82f6' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <p className="text-sm font-semibold text-primary-900">Recent Invoices</p>
            <p className="text-2xs text-primary-400 mt-0.5">Latest 5 transactions</p>
          </div>
          <Link to="/invoices" className="text-xs text-primary-500 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="table-wrapper">
          {recentInvoices.length === 0 ? (
            <div className="py-10 text-center text-xs text-primary-300">
              No invoices yet. <Link to="/invoices/new" className="text-primary-600 hover:underline">Create one</Link>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Salesman</th>
                  <th>Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-primary-700 text-xs">{inv.invoiceNo}</td>
                    <td>
                      <div className="text-primary-800 font-medium">{inv.customer?.customerName}</div>
                      <div className="text-2xs text-primary-400">{inv.customer?.shopName}</div>
                    </td>
                    <td className="text-primary-500 text-xs">{inv.salesman?.fullName || '—'}</td>
                    <td className="text-primary-500 text-xs">{fmt.date(inv.invoiceDate)}</td>
                    <td className="text-right font-semibold text-primary-800 text-money">{fmt.money(inv.total)}</td>
                    <td className="text-right text-green-700 text-money">{fmt.money(inv.totalProfit)}</td>
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
