// src/renderer/src/pages/Products.jsx
import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { productsAPI } from '../utils/api';
import { fmt } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';

export default function Products() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useFetch(
    () => productsAPI.list({ search, page, limit: 15 }), [search, page]
  );
  const { data: rows = [], total = 0 } = data || {};

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{total} products in catalog</p>
        </div>
        <button className="btn-primary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8" placeholder="Search by name or SKU..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? <EmptyState title="No products found" subtitle="Add products to your catalog." /> :
         <div className="table-wrapper">
           <table className="table">
             <thead>
               <tr>
                 <th>SKU</th><th>Name</th><th>Category</th><th>Unit</th>
                 <th>Cost Price</th><th>Sale Price</th><th>Stock</th><th>Min Stock</th><th>Status</th>
               </tr>
             </thead>
             <tbody>
               {rows.map(p => (
                 <tr key={p.id}>
                   <td className="font-mono text-xs text-primary-500">{p.sku}</td>
                   <td className="font-medium text-primary-900">{p.name}</td>
                   <td className="text-primary-500">{p.category || '—'}</td>
                   <td className="text-primary-500">{p.unit}</td>
                   <td className="text-money">{fmt.money(p.costPrice)}</td>
                   <td className="text-money font-medium">{fmt.money(p.salePrice)}</td>
                   <td>
                     <span className={p.stock <= p.minStock ? 'badge-red' : 'badge-green'}>
                       {p.stock}
                     </span>
                   </td>
                   <td className="text-primary-500">{p.minStock}</td>
                   <td><span className={p.status === 'active' ? 'badge-green' : 'badge-gray'}>{p.status}</span></td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
        }
      </div>
    </div>
  );
}
