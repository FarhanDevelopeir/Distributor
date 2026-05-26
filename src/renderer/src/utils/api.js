// src/renderer/src/utils/api.js
// All API calls go to local Express server — fully offline

const BASE = 'http://127.0.0.1:4000/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get:    (path)         => request('GET', path),
  post:   (path, body)   => request('POST', path, body),
  put:    (path, body)   => request('PUT', path, body),
  patch:  (path, body)   => request('PATCH', path, body),
  delete: (path)         => request('DELETE', path),
};

// ── Convenience helpers ─────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const distributorsAPI = {
  list:   (params = {}) => api.get(`/distributors?${new URLSearchParams(params)}`),
  get:    (id)           => api.get(`/distributors/${id}`),
  create: (data)         => api.post('/distributors', data),
  update: (id, data)     => api.put(`/distributors/${id}`, data),
  remove: (id)           => api.delete(`/distributors/${id}`),
};

export const productsAPI = {
  list:   (params = {}) => api.get(`/products?${new URLSearchParams(params)}`),
  get:    (id)           => api.get(`/products/${id}`),
  create: (data)         => api.post('/products', data),
  update: (id, data)     => api.put(`/products/${id}`, data),
  remove: (id)           => api.delete(`/products/${id}`),
};

export const ordersAPI = {
  list:         (params = {}) => api.get(`/orders?${new URLSearchParams(params)}`),
  get:          (id)           => api.get(`/orders/${id}`),
  create:       (data)         => api.post('/orders', data),
  updateStatus: (id, status)   => api.patch(`/orders/${id}/status`, { status }),
};

export const paymentsAPI = {
  list:   (params = {}) => api.get(`/payments?${new URLSearchParams(params)}`),
  create: (data)         => api.post('/payments', data),
};
