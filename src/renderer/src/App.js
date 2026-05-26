// src/renderer/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Dashboard    from './pages/Dashboard';
import Distributors from './pages/Distributors';
import Products     from './pages/Products';
import Orders       from './pages/Orders';
import Payments     from './pages/Payments';
import Reports      from './pages/Reports';
import Settings     from './pages/Settings';

// Styles
import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index           element={<Dashboard />} />
          <Route path="distributors" element={<Distributors />} />
          <Route path="products"     element={<Products />} />
          <Route path="orders"       element={<Orders />} />
          <Route path="payments"     element={<Payments />} />
          <Route path="reports"      element={<Reports />} />
          <Route path="settings"     element={<Settings />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
