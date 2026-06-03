// src/renderer/src/pages/Companies.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { companiesAPI } from '../utils/api';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/shared/States';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const EMPTY = { name: '', ownerName: '', phone: '', address: '', notes: '' };

export default function Companies() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => companiesAPI.list({ search, page, limit: 15 }),
    [search, page]
  );

  const { data: rows = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / 15);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      ownerName: row.ownerName || '',
      phone: row.phone || '',
      address: row.address || '',
      notes: row.notes || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openDelete = (row) => {
    setEditing(row);
    setDeleteOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) await companiesAPI.update(editing.id, form);
      else await companiesAPI.create(form);
      setModalOpen(false);
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
      await companiesAPI.remove(editing.id);
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
          <h2 className="page-title">Companies</h2>
          <p className="page-subtitle">{total} total records</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Company
        </button>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-8" placeholder="Search companies..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button className="btn-ghost btn-sm" onClick={refetch}>Refresh</button>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> :
         error   ? <ErrorState message={error} onRetry={refetch} /> :
         rows.length === 0 ? (
           <EmptyState title="No companies found" subtitle="Add your first company to get started."
             action={<button className="btn-primary btn-sm" onClick={openCreate}>Add Company</button>} />
         ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="font-medium text-primary-900">{row.name}</td>
                    <td className="text-primary-600">{row.ownerName || '—'}</td>
                    <td className="text-primary-600">{row.phone || '—'}</td>
                    <td className="text-primary-500 text-xs max-w-[180px] truncate">{row.address || '—'}</td>
                    <td><span className="badge-blue">{row._count?.products ?? 0}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link className="btn-ghost btn-sm" to={`/companies/${row.id}`}>Profile</Link>
                        <button className="btn-ghost btn-icon p-1" onClick={() => openEdit(row)} title="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="btn-ghost btn-icon p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDelete(row)} title="Delete">
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
        title={editing ? 'Edit Company' : 'Add Company'}>
        <form onSubmit={handleSave} className="space-y-3">
          {formError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{formError}</p>}
          <div>
            <label className="label">Company Name *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Owner Name</label>
              <input className="input" value={form.ownerName} onChange={set('ownerName')} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={set('address')} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[60px] resize-y" value={form.notes} onChange={set('notes')} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Delete Company" message={`Delete "${editing?.name}"? This cannot be undone.`}
        loading={deleting} />
    </div>
  );
}
