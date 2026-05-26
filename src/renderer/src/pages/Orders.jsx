// src/renderer/src/pages/Orders.jsx
import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { ordersAPI } from '../utils/api';
import { fmt, statusBadge } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';

const STATUS_OPTIONS = ['pending','confirmed','shipped','delivered','cancelled'];

export default function Orders() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);

  const { data, loading, error, refetch } = useFetch(
    () => ordersAPI.list({ search, status, page, limit: 15 }), [search, status, page]
  );
  const { data: rows = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{total} total orders</p>
        </div>
        <button className="btn-primary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </button>
      </div>

      <div className="card p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8" placeholder="Search order number..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="select w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{fmt.capitalize(s)}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? <EmptyState title="No orders found" subtitle="Create your first order." /> :
         <div className="table-wrapper">
           <table className="table">
             <thead>
               <tr>
                 <th>Order No.</th><th>Distributor</th><th>Date</th>
                 <th>Items</th><th>Status</th><th className="text-right">Total</th>
               </tr>
             </thead>
             <tbody>
               {rows.map(o => (
                 <tr key={o.id}>
                   <td className="font-mono text-xs text-primary-600 font-medium">{o.orderNo}</td>
                   <td>
                     <div className="font-medium">{o.distributor?.name}</div>
                     <div className="text-2xs text-primary-400">{o.distributor?.code}</div>
                   </td>
                   <td className="text-xs text-primary-500">{fmt.date(o.orderDate)}</td>
                   <td className="text-primary-600">{o.items?.length ?? 0} items</td>
                   <td><span className={statusBadge[o.status] || 'badge-gray'}>{fmt.capitalize(o.status)}</span></td>
                   <td className="text-right text-money font-semibold">{fmt.money(o.total)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
        }
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-primary-500">
          <span>Showing {rows.length} of {total}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
            <span className="px-2 font-medium">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
