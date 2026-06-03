// src/renderer/src/pages/Invoices.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { invoicesAPI } from '../utils/api';
import { fmt } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function Invoices() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => invoicesAPI.list({ search, page, limit: 15 }),
    [search, page]
  );

  const { data: rows = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / 15);

  const openView = async (row) => {
    try {
      const invoice = await invoicesAPI.get(row.id);
      setViewInvoice(invoice);
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await invoicesAPI.remove(viewInvoice.id);
      setDeleteOpen(false);
      setViewInvoice(null);
      refetch();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Invoices</h2>
          <p className="page-subtitle">{total} total invoices</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </Link>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8" placeholder="Search invoices..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button className="btn-ghost btn-sm" onClick={refetch}>Refresh</button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? (
           <EmptyState title="No invoices yet" subtitle="Create your first invoice to start billing."
             action={<Link to="/invoices/new" className="btn-primary btn-sm">Create Invoice</Link>} />
         ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Salesman</th>
                  <th>Delivery</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Profit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="font-mono text-xs text-primary-700">{row.invoiceNo}</td>
                    <td>
                      <div className="font-medium text-primary-900">{row.customer?.customerName}</div>
                      {row.customer?.shopName && (
                        <div className="text-2xs text-primary-400">{row.customer.shopName}</div>
                      )}
                    </td>
                    <td className="text-primary-600 text-xs">{row.salesman?.fullName || '—'}</td>
                    <td className="text-primary-600 text-xs">{row.deliveryPerson?.fullName || '—'}</td>
                    <td className="text-primary-500 text-xs">{fmt.date(row.invoiceDate)}</td>
                    <td><span className="badge-blue">{row._count?.items ?? 0}</span></td>
                    <td className="text-right text-money font-semibold text-primary-800">{fmt.money(row.total)}</td>
                    <td className="text-right text-money text-green-700">{fmt.money(row.totalProfit)}</td>
                    <td>
                      <button className="btn-ghost btn-sm text-primary-600" onClick={() => openView(row)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-primary-500">
          <span>Showing {rows.length} of {total}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
            <span className="px-2 font-medium text-primary-700">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      <Modal open={!!viewInvoice} onClose={() => setViewInvoice(null)}
        title={viewInvoice ? `Invoice ${viewInvoice.invoiceNo}` : ''} size="lg">
        {viewInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-primary-400">Customer</p>
                <p className="font-medium text-primary-900">{viewInvoice.customer?.customerName}</p>
                <p className="text-primary-500">{viewInvoice.customer?.shopName}</p>
              </div>
              <div>
                <p className="text-primary-400">Salesman</p>
                <p className="font-medium text-primary-900">{viewInvoice.salesman?.fullName || '—'}</p>
                <p className="text-primary-500">{fmt.date(viewInvoice.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-primary-400">Delivery Person</p>
                <p className="font-medium text-primary-900">{viewInvoice.deliveryPerson?.fullName || '—'}</p>
                <p className="text-primary-500">{viewInvoice.deliveryPerson?.vehicleNo || ''}</p>
              </div>
            </div>

            <div className="table-wrapper border border-primary-100 rounded">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInvoice.items?.map(item => (
                    <tr key={item.id}>
                      <td className="text-xs">{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td className="text-right text-money">{fmt.money(item.unitPrice)}</td>
                      <td className="text-right text-money">{fmt.money(item.lineTotal)}</td>
                      <td className="text-right text-money text-green-700">{fmt.money(item.lineProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="text-xs space-y-1 w-48">
                <div className="flex justify-between"><span className="text-primary-500">Subtotal</span><span className="text-money">{fmt.money(viewInvoice.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-primary-500">Discount</span><span className="text-money">{fmt.money(viewInvoice.discount)}</span></div>
                <div className="flex justify-between font-semibold text-primary-900 border-t border-primary-100 pt-1">
                  <span>Total</span><span className="text-money">{fmt.money(viewInvoice.total)}</span>
                </div>
                <div className="flex justify-between text-green-700"><span>Profit</span><span className="text-money">{fmt.money(viewInvoice.totalProfit)}</span></div>
                <div className="flex justify-between text-primary-600"><span>Commission</span><span className="text-money">{fmt.money(viewInvoice.commission)}</span></div>
              </div>
            </div>

            {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button className="btn-danger btn-sm" onClick={() => setDeleteOpen(true)}>Delete Invoice</button>
              <button className="btn-secondary btn-sm" onClick={() => setViewInvoice(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete Invoice"
        message="Delete this invoice and restore product stock?"
        loading={deleting} />
    </div>
  );
}
