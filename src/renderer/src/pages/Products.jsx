// src/renderer/src/pages/Products.jsx

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { productsAPI, companiesAPI } from '../utils/api';
import { fmt } from '../utils/format';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const UNIT_TYPES = ['pcs', 'carton', 'box', 'kg', 'liter', 'dozen'];
const EMPTY = { name: '', companyId: '', purchasePrice: '', salePrice: '', stockQuantity: '', unitType: 'pcs' };

export default function Products() {
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [stockForm, setStockForm] = useState({ type: 'in', quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => productsAPI.list({ search, companyId, page, limit: 15 }),
    [search, companyId, page]
  );

  const { data: companiesData } = useFetch(companiesAPI.all, []);
  const companies = companiesData?.data || [];

  const { data: rows = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / 15);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, companyId: companies[0]?.id || '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      companyId: row.companyId || '',
      purchasePrice: row.purchasePrice ?? '',
      salePrice: row.salePrice ?? '',
      stockQuantity: row.stockQuantity ?? '',
      unitType: row.unitType || 'pcs',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openStock = (row) => {
    setEditing(row);
    setStockForm({ type: 'in', quantity: '', reason: '' });
    setFormError('');
    setStockOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        companyId: Number(form.companyId),
        purchasePrice: Number(form.purchasePrice),
        salePrice: Number(form.salePrice),
        stockQuantity: Number(form.stockQuantity),
      };
      if (editing) await productsAPI.update(editing.id, payload);
      else await productsAPI.create(payload);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await productsAPI.updateStock(editing.id, {
        type: stockForm.type,
        quantity: Number(stockForm.quantity),
        reason: stockForm.reason,
      });
      setStockOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsAPI.remove(editing.id);
      setDeleteOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Products & Stock</h2>
          <p className="page-subtitle">{total} total products</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="card p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8" placeholder="Search products..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="select w-44" value={companyId}
          onChange={e => { setCompanyId(e.target.value); setPage(1); }}>
          <option value="">All Companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-ghost btn-sm" onClick={refetch}>Refresh</button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? (
           <EmptyState title="No products found" subtitle="Add products to manage inventory."
             action={<button className="btn-primary btn-sm" onClick={openCreate}>Add Product</button>} />
         ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Company</th>
                  <th>Purchase</th>
                  <th>Sale</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="font-medium text-primary-900">{row.name}</td>
                    <td className="text-primary-600 text-xs">{row.company?.name || '—'}</td>
                    <td className="text-money text-primary-600">{fmt.money(row.purchasePrice)}</td>
                    <td className="text-money text-primary-700">{fmt.money(row.salePrice)}</td>
                    <td>
                      <span className={row.stockQuantity <= 10 ? 'badge-red' : 'badge-green'}>
                        {row.stockQuantity}
                      </span>
                    </td>
                    <td className="text-xs text-primary-500 capitalize">{row.unitType}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost btn-sm text-primary-600" onClick={() => openStock(row)}>Stock</button>
                        <button className="btn-ghost btn-icon p-1" onClick={() => openEdit(row)}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="btn-ghost btn-icon p-1 text-red-500 hover:bg-red-50"
                          onClick={() => { setEditing(row); setDeleteOpen(true); }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-3">
          {formError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{formError}</p>}
          <div>
            <label className="label">Product Name *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Company *</label>
            <select className="select" value={form.companyId} onChange={set('companyId')} required>
              <option value="">Select company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Purchase Price</label>
              <input className="input" type="number" min="0" step="0.01" value={form.purchasePrice}
                onChange={set('purchasePrice')} />
            </div>
            <div>
              <label className="label">Sale Price</label>
              <input className="input" type="number" min="0" step="0.01" value={form.salePrice}
                onChange={set('salePrice')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stock Quantity</label>
              <input className="input" type="number" min="0" value={form.stockQuantity}
                onChange={set('stockQuantity')} />
            </div>
            <div>
              <label className="label">Unit Type</label>
              <select className="select" value={form.unitType} onChange={set('unitType')}>
                {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={stockOpen} onClose={() => setStockOpen(false)} title={`Update Stock — ${editing?.name}`} size="sm">
        <form onSubmit={handleStockUpdate} className="space-y-3">
          {formError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{formError}</p>}
          <p className="text-xs text-primary-500">Current stock: <strong>{editing?.stockQuantity ?? 0}</strong></p>
          <div>
            <label className="label">Type</label>
            <select className="select" value={stockForm.type}
              onChange={e => setStockForm(f => ({ ...f, type: e.target.value }))}>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Set Quantity</option>
            </select>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input className="input" type="number" min="1" value={stockForm.quantity}
              onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Reason</label>
            <input className="input" value={stockForm.reason}
              onChange={e => setStockForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary btn-sm" onClick={() => setStockOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm" disabled={saving}>
              {saving ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete Product" message={`Delete "${editing?.name}"?`} loading={deleting} />
    </div>
  );
}
