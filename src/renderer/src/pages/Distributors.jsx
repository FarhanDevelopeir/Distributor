// src/renderer/src/pages/Distributors.jsx

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { distributorsAPI } from '../utils/api';
import { fmt, statusBadge } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';

export default function Distributors() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);

  const { data, loading, error, refetch } = useFetch(
    () => distributorsAPI.list({ search, status, page, limit: 15 }),
    [search, status, page]
  );

  const { data: rows = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Distributors</h2>
          <p className="page-subtitle">{total} total records</p>
        </div>
        <button className="btn-primary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Distributor
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8" placeholder="Search by name, code, phone..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="select w-36"
          value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="btn-ghost btn-sm" onClick={refetch}>Refresh</button>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? (
           <EmptyState
             title="No distributors found"
             subtitle="Add your first distributor to get started."
             action={<button className="btn-primary btn-sm">Add Distributor</button>}
           />
         ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Credit Limit</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(d => (
                  <tr key={d.id}>
                    <td className="font-mono text-xs text-primary-500">{d.code}</td>
                    <td>
                      <div className="font-medium text-primary-900">{d.name}</div>
                      {d.email && <div className="text-2xs text-primary-400">{d.email}</div>}
                    </td>
                    <td className="text-primary-600">{d.phone || '—'}</td>
                    <td className="text-primary-600">{d.city || '—'}</td>
                    <td className="text-money text-primary-700">{fmt.money(d.creditLimit)}</td>
                    <td className="text-money font-medium text-primary-800">{fmt.money(d.balance)}</td>
                    <td>
                      <span className={statusBadge[d.status] || 'badge-gray'}>
                        {fmt.capitalize(d.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost btn-icon p-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-primary-500">
          <span>Showing {rows.length} of {total}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
            <span className="px-2 font-medium text-primary-700">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
