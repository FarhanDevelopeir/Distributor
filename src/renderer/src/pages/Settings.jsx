// src/renderer/src/pages/Settings.jsx
import React from 'react';

export default function Settings() {
  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Application configuration</p>
        </div>
      </div>
      <div className="card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-primary-800 mb-3">Company Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Company Name</label><input className="input" placeholder="Your Company Ltd." /></div>
            <div><label className="label">Currency</label>
              <select className="select">
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </div>
            <div><label className="label">Address</label><input className="input" placeholder="Office address" /></div>
            <div><label className="label">Phone</label><input className="input" placeholder="+92-XXX-XXXXXXX" /></div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="btn-primary btn-sm">Save Settings</button>
          </div>
        </div>
        <div className="border-t border-primary-100 pt-4">
          <h3 className="text-sm font-semibold text-primary-800 mb-1">Database</h3>
          <p className="text-xs text-primary-500 mb-3">SQLite database stored locally on your computer. No cloud sync.</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded text-xs text-green-700 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Database connected — Fully Offline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
