// src/renderer/src/pages/Payments.jsx
import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { paymentsAPI } from '../utils/api';
import { fmt } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';

export default function Payments() {
  const { data, loading, error, refetch } = useFetch(() => paymentsAPI.list({ limit: 20 }));
  const { data: rows = [], total = 0 } = data || {};

  const METHOD_BADGE = { cash: 'badge-green', bank: 'badge-blue', cheque: 'badge-yellow' };

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Payments</h2>
          <p className="page-subtitle">{total} payment records</p>
        </div>
        <button className="btn-primary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Payment
        </button>
      </div>
      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? <EmptyState title="No payments recorded" subtitle="Record your first payment." /> :
         <div className="table-wrapper">
           <table className="table">
             <thead>
               <tr><th>Payment No.</th><th>Distributor</th><th>Date</th><th>Method</th><th>Reference</th><th className="text-right">Amount</th></tr>
             </thead>
             <tbody>
               {rows.map(p => (
                 <tr key={p.id}>
                   <td className="font-mono text-xs text-primary-600">{p.paymentNo}</td>
                   <td className="font-medium">{p.distributor?.name}</td>
                   <td className="text-xs text-primary-500">{fmt.date(p.paymentDate)}</td>
                   <td><span className={METHOD_BADGE[p.method] || 'badge-gray'}>{fmt.capitalize(p.method)}</span></td>
                   <td className="text-primary-500 text-xs">{p.reference || '—'}</td>
                   <td className="text-right text-money font-semibold text-green-700">{fmt.money(p.amount)}</td>
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
