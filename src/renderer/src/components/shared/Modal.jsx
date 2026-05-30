// src/renderer/src/components/shared/Modal.jsx

import React, { useEffect } from 'react';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
      <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className={`relative bg-white rounded-lg border border-primary-100 shadow-xl w-full ${SIZES[size] || SIZES.md}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100">
          <h3 className="text-sm font-semibold text-primary-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-icon p-1 text-primary-400 hover:text-primary-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
