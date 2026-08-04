import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { Box, PlusCircle, BarChart2, Package, Search, Trash2, Edit3, User, Camera, Eye, Mail, Bell } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

// --- 1. Dashboard Overview ---
const Overview = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(`/vendor/analytics/advanced?time_range=30days&t=${Date.now()}`)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Access denied'));
  }, []);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}><h4>Account Restricted</h4><p>{error}</p></div>;
  if (!data) return <div>Loading overview...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 className="gradient-text" style={{ margin: 0 }}>Dashboard Overview</h2>
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL SALES REVENUE</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>${data.summary.revenue.toFixed(2)}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>EST. PROFIT (75% MARGIN)</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>${data.summary.profit.toFixed(2)}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL ORDERS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.orders}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PRODUCTS LISTED</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.products}</h2>
        </div>
      </div>
      
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Order Activity Trend</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.sales_trend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- 2. Add Product ---
const AddProduct = () => {
  const { apiFetch } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', price: '', quantity: '', discount: '0', sku: '', description: '', status: 'active'
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(k => data.append(k, formData[k]));
    if (image) data.append('image', image);

    try {
      const res = await fetch('http://localhost:8006/vendor/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: data
      });
      if(res.ok) navigate('/vendor/catalog');
    } catch (err) {
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="gradient-text" style={{ marginBottom: '2rem' }}><PlusCircle /> Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group"><label>Product Title</label><input type="text" className="input-field" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          <div className="form-group"><label>Category</label><input type="text" className="input-field" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
          <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" className="input-field" required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
          <div className="form-group"><label>Discount (%)</label><input type="number" className="input-field" value={formData.discount || ''} onChange={e => setFormData({...formData, discount: e.target.value})} /></div>
          <div className="form-group"><label>Stock Quantity</label><input type="number" className="input-field" required value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
          <div className="form-group"><label>SKU</label><input type="text" className="input-field" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Description (Optional)</label><textarea className="input-field" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <input type="file" className="input-field" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
          {loading ? 'Generating AI Details & Saving...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
};

// --- 3. Catalog Management ---
const Catalog = () => {
  const { apiFetch } = useStore();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  
  // Email Modal State
  const [emailModal, setEmailModal] = useState(false);
  const [currentEmailContent, setCurrentEmailContent] = useState('');

  // Edit Modal State
  const [editModal, setEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8006/vendor/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingProduct)
      });
      if(res.ok) {
        setEditModal(false);
        loadProducts();
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      alert("Error updating product");
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8006/vendor/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        loadProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      alert("Error deleting product.");
    }
  };

  useEffect(() => { loadProducts(); }, []);
  const loadProducts = () => apiFetch('/vendor/products')
    .then(res => setProducts(res))
    .catch(err => setError(err.message || 'Access denied'));

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}><h4>Account Restricted</h4><p>{error}</p></div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package style={{ color: '#f59e0b' }} /> My Catalog
        </h3>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search catalog..." className="input-field" style={{ paddingLeft: '2.5rem', width: '250px', margin: 0 }} />
        </div>
      </div>
      <div className="table-header" style={{ gridTemplateColumns: '1.5fr 3fr 1fr 1fr 1fr', padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
        <div>PRODUCT NAME</div>
        <div>DESCRIPTION & TAGS</div>
        <div>CATEGORY</div>
        <div>PRICE / STOCK / SOLD</div>
        <div style={{ textAlign: 'center' }}>MARKETING</div>
      </div>
      {products.map(p => (
        <div className="table-row" key={p.id} style={{ gridTemplateColumns: '1.5fr 3fr 1fr 1fr 1fr', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '4px' }}>
              <img src={p.picture_url ? `http://localhost:8006${p.picture_url}` : 'https://via.placeholder.com/60'} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} alt="" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{p.title}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '2rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.2)', 
              color: '#93c5fd', 
              padding: '0.5rem', 
              borderRadius: '4px',
              fontSize: '0.85rem',
              lineHeight: '1.4'
            }}>
              {p.description || "No description provided."}
            </div>
            <div style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              color: '#60a5fa', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              fontSize: '0.75rem',
              display: 'inline-block',
              width: 'fit-content',
              fontWeight: 600
            }}>
              AI TAGS: {p.tagline || p.category}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>VISION:</div>
            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>{p.category}</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${p.price.toFixed(2)}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock: {p.quantity}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="btn btn-dark" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setEditingProduct({...p}); setEditModal(true); }}>
              <Edit3 size={14}/> Edit
            </button>
            <button className="btn btn-dark" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }} onClick={() => { setCurrentEmailContent(p.marketing_email || ''); setEmailModal(true); }}>
              <Mail size={14}/> Email
            </button>
            <button className="btn btn-danger-outline" style={{ padding: '0.5rem', border: 'none' }} onClick={() => handleDelete(p.id)}>
              <Trash2 size={16}/>
            </button>
          </div>
        </div>
      ))}
      {products.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found in your catalog.</div>}

      {/* Edit Product Modal */}
      {editModal && editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, overflowY: 'auto', backdropFilter: 'blur(4px)', padding: '5vh 0' }}>
          <div className="glass-panel" style={{ width: '600px', maxWidth: '90%', margin: '0 auto', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit3 size={20} /> Edit Product Details
            </h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group"><label>Product Title</label><input type="text" className="input-field" required value={editingProduct.title || ''} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} /></div>
                <div className="form-group"><label>Category</label><input type="text" className="input-field" required value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} /></div>
                <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" className="input-field" required value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} /></div>
                <div className="form-group"><label>Discount (%)</label><input type="number" className="input-field" value={editingProduct.discount || ''} onChange={e => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value)})} /></div>
                <div className="form-group"><label>Stock Quantity</label><input type="number" className="input-field" required value={editingProduct.quantity || ''} onChange={e => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>SKU</label><input type="text" className="input-field" value={editingProduct.sku || ''} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea className="input-field" rows="3" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} /></div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Product Status</label>
                <select className="input-field" value={editingProduct.status} onChange={e => setEditingProduct({...editingProduct, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-dark" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, overflowY: 'auto', backdropFilter: 'blur(4px)', padding: '5vh 0' }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', margin: '0 auto', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={20} /> Edit Marketing Email
            </h3>
            <textarea 
              className="input-field" 
              style={{ minHeight: '300px', fontFamily: 'monospace', lineHeight: 1.5 }}
              value={currentEmailContent}
              onChange={e => setCurrentEmailContent(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-dark" onClick={() => setEmailModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert('Marketing email queued for sending!'); setEmailModal(false); }}>Send Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 4. Analytics Engine ---
const Analytics = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState(null);

  useEffect(() => {
    let url = `/vendor/analytics/advanced?time_range=${timeRange}&t=${Date.now()}`;
    if (timeRange === 'custom') {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    
    apiFetch(url)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Access denied'));
  }, [timeRange, startDate, endDate]);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}><h4>Account Restricted</h4><p>{error}</p></div>;
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading advanced analytics...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}><BarChart2 /> Advanced Analytics Engine (Live)</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {timeRange === 'custom' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <span>to</span>
              <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          )}
          <select className="input-field" style={{ width: '200px' }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>Orders Trend (Line Chart)</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.sales_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Trend (Bar Chart)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Profit Margins (Area Chart)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
                <Area type="monotone" dataKey="profit" stroke="#ec4899" fill="rgba(236, 72, 153, 0.3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Sales by Category (Doughnut)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie data={data.category_sales} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {data.category_sales.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Sales by Product (Pie Chart)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie data={data.product_sales.map(p => ({name: p.title, value: p.sales}))} outerRadius={90} dataKey="value" nameKey="name" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {data.product_sales.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Product-wise Sales Analysis</h3>
        </div>
        <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 2.5fr' }}>
          <div>PRODUCT NAME</div>
          <div>UNITS SOLD</div>
          <div>REVENUE</div>
          <div>STATUS</div>
          <div>AI INSIGHT</div>
        </div>
        {data.product_sales.map(ps => (
          <div className="table-row" key={ps.id} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 2.5fr' }}>
            <div style={{ fontWeight: 600 }}>{ps.title}</div>
            <div>{ps.sales}</div>
            <div style={{ color: 'var(--success)' }}>${ps.revenue.toFixed(2)}</div>
            <div>
              {ps.sales === 0 ? (
                <span className="badge badge-pending">Waiting</span>
              ) : (
                <span className="badge badge-active">Selling</span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontStyle: 'italic', lineHeight: 1.4 }}>
              {ps.insight || "Analyzing..."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 5. Vendor Profile ---
const Profile = () => {
  const { user, apiFetch } = useStore();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '',
    phone_number: user?.phone_number || '', address: user?.address || '',
    business_name: user?.business_name || '', business_category: user?.business_category || '',
    gst_number: user?.gst_number || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/vendor/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('Profile updated successfully');
      // In a real app we'd refresh the user in store.js
    } catch(err) {
      alert('Update failed');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {user?.profile_picture_url ? (
            <img src={user.profile_picture_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" />
          ) : <Camera size={32} style={{ color: 'var(--text-muted)' }} />}
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><Edit3 size={14} color="#000" /></div>
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{user?.business_name}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>⭐ {user?.rating > 0 ? user?.rating.toFixed(1) : 'No ratings yet'} • Member since {new Date(user?.joined_date).getFullYear()}</p>
        </div>
      </div>
      
      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          <div className="form-group"><label>First Name</label><input type="text" className="input-field" value={formData.first_name || ''} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
          <div className="form-group"><label>Last Name</label><input type="text" className="input-field" value={formData.last_name || ''} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
          <div className="form-group"><label>Phone Number</label><input type="tel" className="input-field" value={formData.phone_number || ''} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
          <div className="form-group"><label>GST / Tax Number</label><input type="text" className="input-field" value={formData.gst_number || ''} onChange={e => setFormData({...formData, gst_number: e.target.value})} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Business Address</label><input type="text" className="input-field" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div className="form-group"><label>Business Category</label><input type="text" className="input-field" value={formData.business_category || ''} onChange={e => setFormData({...formData, business_category: e.target.value})} /></div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }}>Save Profile Changes</button>
      </form>
    </div>
  );
};

// --- 6. Notifications ---
const Notifications = () => {
  const { apiFetch } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vendor/notifications')
      .then(res => setNotifications(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Bell size={24} style={{ color: '#3b82f6' }} />
        Vendor Notifications
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications yet.
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '1.5rem', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-color)',
              borderLeft: `4px solid ${n.action === 'Notification Sent' ? '#3b82f6' : '#8b5cf6'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{n.action}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-color)', lineHeight: '1.5' }}>{n.remarks}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const VendorDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
};

export default VendorDashboard;
