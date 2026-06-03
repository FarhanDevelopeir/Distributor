// src/renderer/src/pages/InvoiceCreate.jsx

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { productsAPI, customersAPI, salesmenAPI, deliveryPersonsAPI, invoicesAPI } from '../utils/api';
import { fmt } from '../utils/format';
import { LoadingSpinner, ErrorState } from '../components/shared/States';

const emptyLine = () => ({ productId: '', quantity: 1, unitPrice: '' });

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [salesmanId, setSalesmanId] = useState('');
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: productsData, loading: productsLoading, error: productsError } = useFetch(
    () => productsAPI.list({ limit: 500 }),
    []
  );
  const { data: customersData, loading: customersLoading, error: customersError } = useFetch(
    customersAPI.all,
    []
  );
  const { data: salesmenData, loading: salesmenLoading, error: salesmenError } = useFetch(
    salesmenAPI.all,
    []
  );
  const { data: deliveryPersonsData, loading: deliveryPersonsLoading, error: deliveryPersonsError } = useFetch(
    deliveryPersonsAPI.all,
    []
  );

  const products = productsData?.data || [];
  const customers = customersData?.data || [];
  const salesmen = salesmenData?.data || [];
  const deliveryPersons = deliveryPersonsData?.data || [];

  const productMap = useMemo(
    () => Object.fromEntries(products.map(p => [String(p.id), p])),
    [products]
  );

  const selectedSalesman = salesmen.find(s => String(s.id) === String(salesmanId));

  const computedLines = lines.map(line => {
    const product = productMap[line.productId];
    const qty = Number(line.quantity) || 0;
    const unitPrice = line.unitPrice !== '' ? Number(line.unitPrice) : (product?.salePrice || 0);
    const purchasePrice = product?.purchasePrice || 0;
    const lineTotal = qty * unitPrice;
    const lineProfit = qty * (unitPrice - purchasePrice);
    return { ...line, product, qty, unitPrice, lineTotal, lineProfit };
  });

  const subtotal = computedLines.reduce((s, l) => s + l.lineTotal, 0);
  const totalProfit = computedLines.reduce((s, l) => s + l.lineProfit, 0);
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);
  const commission = selectedSalesman
    ? totalProfit * (selectedSalesman.commissionPercentage / 100)
    : 0;

  const updateLine = (index, field, value) => {
    setLines(prev => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };
      if (field === 'productId') {
        const product = productMap[value];
        updated.unitPrice = product ? product.salePrice : '';
      }
      return updated;
    }));
  };

  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (index) => setLines(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const items = computedLines
      .filter(l => l.productId && l.qty > 0)
      .map(l => ({
        productId: Number(l.productId),
        quantity: l.qty,
        unitPrice: l.unitPrice,
      }));

    if (!customerId) {
      setFormError('Please select a customer');
      setSaving(false);
      return;
    }
    if (!items.length) {
      setFormError('Add at least one product');
      setSaving(false);
      return;
    }

    try {
      await invoicesAPI.create({
        customerId: Number(customerId),
        salesmanId: salesmanId ? Number(salesmanId) : null,
        deliveryPersonId: deliveryPersonId ? Number(deliveryPersonId) : null,
        discount: discountAmount,
        notes,
        items,
      });
      navigate('/invoices');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loading = productsLoading || customersLoading || salesmenLoading || deliveryPersonsLoading;
  const error = productsError || customersError || salesmenError || deliveryPersonsError;

  if (loading) return <LoadingSpinner text="Loading billing data..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">Create Invoice</h2>
          <p className="page-subtitle">Bill customer and auto-update stock</p>
        </div>
        <Link to="/invoices" className="btn-secondary btn-sm">← Back to Invoices</Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="card p-4">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-3">Invoice Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Customer *</label>
                <select className="select" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.customerName}{c.shopName ? ` — ${c.shopName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Salesman</label>
                <select className="select" value={salesmanId} onChange={e => setSalesmanId(e.target.value)}>
                  <option value="">No salesman</option>
                  {salesmen.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.commissionPercentage}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Delivery Person</label>
                <select className="select" value={deliveryPersonId} onChange={e => setDeliveryPersonId(e.target.value)}>
                  <option value="">No delivery person</option>
                  {deliveryPersons.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}{d.vehicleNo ? ` (${d.vehicleNo})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Products</p>
              <button type="button" className="btn-secondary btn-sm" onClick={addLine}>+ Add Line</button>
            </div>
            <div className="p-3 space-y-2">
              {computedLines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-surface-50 p-2 rounded border border-primary-50">
                  <div className="col-span-5">
                    {index === 0 && <label className="label">Product</label>}
                    <select className="select" value={line.productId}
                      onChange={e => updateLine(index, 'productId', e.target.value)}>
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="label">Qty</label>}
                    <input className="input" type="number" min="1"
                      value={line.quantity}
                      onChange={e => updateLine(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="label">Price</label>}
                    <input className="input" type="number" min="0" step="0.01"
                      value={line.unitPrice}
                      onChange={e => updateLine(index, 'unitPrice', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="label">Total</label>}
                    <div className="input bg-white text-money font-medium">{fmt.money(line.lineTotal)}</div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" className="btn-ghost btn-icon p-1 text-red-500"
                      onClick={() => removeLine(index)} disabled={lines.length === 1}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {line.product && line.qty > line.product.stockQuantity && (
                    <p className="col-span-12 text-2xs text-red-600">
                      Insufficient stock — available: {line.product.stockQuantity}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <label className="label">Notes</label>
            <textarea className="input min-h-[60px] resize-y" value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Optional invoice notes..." />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 sticky top-4">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-3">Summary</p>
            {formError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded mb-3">{formError}</p>}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-primary-600">
                <span>Subtotal</span>
                <span className="text-money">{fmt.money(subtotal)}</span>
              </div>
              <div>
                <label className="label">Discount</label>
                <input className="input" type="number" min="0" step="0.01"
                  value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
              <div className="flex justify-between font-semibold text-primary-900 text-base border-t border-primary-100 pt-2">
                <span>Total</span>
                <span className="text-money">{fmt.money(total)}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Profit</span>
                <span className="text-money">{fmt.money(totalProfit)}</span>
              </div>
              {selectedSalesman && (
                <div className="flex justify-between text-primary-600 text-xs">
                  <span>Commission ({selectedSalesman.commissionPercentage}%)</span>
                  <span className="text-money">{fmt.money(commission)}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full mt-4 justify-center" disabled={saving}>
              {saving ? 'Saving Invoice...' : 'Save Invoice'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
