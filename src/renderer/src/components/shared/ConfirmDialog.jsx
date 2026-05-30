// src/renderer/src/components/shared/ConfirmDialog.jsx

import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-primary-600 mb-4">{message}</p>
      <div className="flex items-center justify-end gap-2">
        <button className="btn-secondary btn-sm" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn-danger btn-sm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
