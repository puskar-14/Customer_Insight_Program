import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { Rocket, FileText, TrendingUp, Activity, Box, Package, BarChart2, X, Send, AlertCircle, Eye, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDirectory = () => {
  const [data, setData] = useState({ vendors: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { apiFetch } = useStore();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await apiFetch('/admin/vendors');
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      await apiFetch(`/admin/vendors/${vendorId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, remarks: `Status changed to ${newStatus} by admin` })
      });
      fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading vendors...</div>;

  const filteredVendors = data.vendors.filter(v => {
    const searchString = `${v.first_name} ${v.last_name} ${v.business_name} ${v.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Marketplace Vendor Directory</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="input-field" 
              style={{ margin: 0, width: '250px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="input-field" 
              style={{ margin: 0, width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
        <div className="table-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 1fr 2fr' }}>
          <div>VENDOR NAME</div>
          <div>BUSINESS</div>
          <div>PRODUCTS</div>
          <div>SALES REVENUE</div>
          <div>RATING</div>
          <div>STATUS</div>
          <div style={{ textAlign: 'right' }}>ACTIONS</div>
        </div>
        
        {filteredVendors.map(vendor => (
          <div className="table-row" key={vendor.id} style={{ gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 1fr 2fr' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{vendor.first_name} {vendor.last_name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{vendor.email}</div>
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{vendor.business_name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{vendor.phone_number}</div>
            </div>
            <div style={{ fontWeight: 600 }}>{vendor.products} listed</div>
            <div style={{ color: 'var(--success)', fontWeight: 600 }}>${(vendor.revenue || 0).toFixed(2)}</div>
            <div>
              ⭐ {vendor.rating > 0 ? (vendor.rating || 0).toFixed(1) : 'No rating'}
            </div>
            <div>
              <span className={`badge badge-${vendor.status}`}>{vendor.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {vendor.status === 'pending' ? (
                <>
                  <button className="btn btn-dark" style={{ padding: '0.5rem 1rem' }} onClick={() => handleStatusChange(vendor.id, 'active')}>Activate</button>
                </>
              ) : vendor.status === 'active' ? (
                <>
                  <button className="btn btn-danger-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => handleStatusChange(vendor.id, 'suspended')}>Suspend</button>
                  <button className="btn btn-dark" style={{ padding: '0.5rem 1rem' }} onClick={() => handleStatusChange(vendor.id, 'deactivated')}>Deactivate</button>
                </>
              ) : (
                <>
                  <button className="btn btn-dark" style={{ padding: '0.5rem 1rem' }} onClick={() => handleStatusChange(vendor.id, 'active')}>Activate</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VendorActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiFetch } = useStore();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiFetch('/admin/vendor-activities');
      setActivities(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading activity log...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} style={{ color: '#ec4899' }} />
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Vendor Activity History</h3>
      </div>
      <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1.5fr 2fr' }}>
        <div>DATE & TIME</div>
        <div>VENDOR</div>
        <div>ADMIN</div>
        <div>ACTION</div>
        <div>STATUS CHANGE</div>
        <div>REMARKS</div>
      </div>
      {activities.map(act => (
        <div className="table-row" key={act.id} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1.5fr 2fr' }}>
          <div style={{ color: 'var(--text-muted)' }}>{new Date(act.created_at).toLocaleString()}</div>
          <div style={{ fontWeight: 600 }}>{act.vendor_name}</div>
          <div>{act.admin_name}</div>
          <div><span style={{ background: 'var(--primary-color)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{act.action}</span></div>
          <div style={{ fontSize: '0.875rem' }}>
            {act.previous_status ? (
              <><span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{act.previous_status}</span> &rarr; <span style={{ color: 'var(--success)' }}>{act.new_status}</span></>
            ) : (
              <span style={{ color: 'var(--success)' }}>{act.new_status}</span>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{act.remarks}</div>
        </div>
      ))}
      {activities.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No activities logged.</div>}
    </div>
  );
};

// --- 3. Platform Products ---
const ProductDetailsModal = ({ product, onClose }) => {
  const { apiFetch } = useStore();
  const [emailContent, setEmailContent] = useState(product.marketing_email || '');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingNotify, setLoadingNotify] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSendEmail = async () => {
    setLoadingEmail(true);
    try {
      const res = await apiFetch(`/admin/products/${product.id}/marketing-email`, {
        method: 'POST',
        body: JSON.stringify({ content: emailContent })
      });
      setMsg({ type: 'success', text: res.message });
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleNotifyVendor = async (type) => {
    setLoadingNotify(type);
    try {
      const res = await apiFetch(`/admin/products/${product.id}/notify-vendor`, {
        method: 'POST',
        body: JSON.stringify({ notification_type: type })
      });
      setMsg({ type: 'success', text: res.message });
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoadingNotify(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={24} style={{ color: '#8b5cf6' }} />
          Product Details
        </h2>

        {msg && (
          <div style={{ padding: '1rem', borderRadius: 8, marginBottom: '1rem', backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)', border: `1px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--danger)'}` }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <img src={product.picture_url ? `http://localhost:8005${product.picture_url}` : 'https://via.placeholder.com/200'} style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '1/1', border: '1px solid var(--border-color)' }} alt="" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{product.title}</h3>
            <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem' }}>${product.price.toFixed(2)}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card" style={{ padding: '1rem' }}>
                <div className="stat-title">Current Stock</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{product.quantity} units</div>
              </div>
              <div className="stat-card" style={{ padding: '1rem' }}>
                <div className="stat-title">Status</div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                  <span className={`badge ${product.status === 'active' ? 'badge-active' : 'badge-warning'}`}>{product.status}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Tagline:</strong>
              <p style={{ margin: '0.25rem 0' }}>{product.tagline || 'N/A'}</p>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Description:</strong>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', lineHeight: 1.5 }}>{product.description || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
            <Send size={20} style={{ color: '#3b82f6' }} />
            AI Marketing Email
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            This AI-generated email draft can be customized before sending to platform customers.
          </p>
          <textarea 
            className="input-field" 
            style={{ width: '100%', minHeight: '150px', resize: 'vertical', marginBottom: '1rem', fontFamily: 'inherit' }}
            value={emailContent}
            onChange={e => setEmailContent(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSendEmail} disabled={loadingEmail || !emailContent}>
            {loadingEmail ? 'Sending...' : 'Send Campaign'}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
            <AlertCircle size={20} style={{ color: '#f59e0b' }} />
            Vendor Notifications
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Quickly alert the vendor ({product.vendor_name}) regarding inventory or pricing updates.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleNotifyVendor('out_of_stock')} disabled={loadingNotify}>
              {loadingNotify === 'out_of_stock' ? 'Notifying...' : 'Notify: Out of Stock'}
            </button>
            <button className="btn" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6' }} onClick={() => handleNotifyVendor('price_increase')} disabled={loadingNotify}>
              {loadingNotify === 'price_increase' ? 'Notifying...' : 'Suggest Price Increase'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const AllProducts = () => {
  const { apiFetch } = useStore();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  useEffect(() => {
    apiFetch('/admin/products').then(res => setProducts(res));
  }, []);

  return (
    <>
    <div className="glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Package size={20} style={{ color: '#8b5cf6' }} />
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Platform Products</h3>
      </div>
      <div className="table-header" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px' }}>
        <div>PRODUCT & VENDOR</div>
        <div>CATEGORY</div>
        <div>PRICE</div>
        <div>STOCK</div>
        <div>STATUS</div>
        <div style={{ textAlign: 'center' }}>ACTION</div>
      </div>
      {products.map(p => (
        <div className="table-row" key={p.id} style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={p.picture_url ? `http://localhost:8005${p.picture_url}` : 'https://via.placeholder.com/40'} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} alt="" />
            <div>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {p.vendor_name}</div>
            </div>
          </div>
          <div>{p.category}</div>
          <div style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</div>
          <div>{p.quantity > 0 ? p.quantity : <span style={{ color: 'var(--danger)' }}>Out of Stock</span>}</div>
          <div>
            <span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-warning'}`}>{p.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn" style={{ padding: '0.5rem' }} title="View Details" onClick={() => setSelectedProduct(p)}>
              <Eye size={18} />
            </button>
          </div>
        </div>
      ))}
      {products.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No products found on the platform.</div>}
    </div>
    {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  );
};

// --- 4. Platform Analytics Engine ---
const VendorDetailsModal = ({ vendor, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} style={{ color: '#8b5cf6' }} />
          Vendor Analytics & Profile: {vendor.vendor_name}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Profile Information</h3>
            <p><strong>Email:</strong> {vendor.email}</p>
            <p><strong>Phone:</strong> {vendor.phone_number}</p>
            <p><strong>Joined:</strong> {vendor.joined_date}</p>
            <p><strong>Rating:</strong> {vendor.rating > 0 ? `${vendor.rating.toFixed(1)} ⭐` : 'No ratings'}</p>
            <p><strong>Status:</strong> <span className={`badge ${vendor.status === 'active' ? 'badge-active' : 'badge-warning'}`}>{vendor.status}</span></p>
          </div>
          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Business Analytics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>TOTAL REVENUE GENERATED</p>
                <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${vendor.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>TOTAL ORDERS</p>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{vendor.orders}</div>
                </div>
                <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>CATALOG SIZE</p>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{vendor.products} items</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} style={{ color: '#f59e0b' }} />
            Product Catalog ({vendor.products})
          </h3>
          {vendor.products_list && vendor.products_list.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>
              <div>Title</div>
              <div>Price</div>
              <div>Stock</div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No products listed.</p>
          )}
          
          {vendor.products_list && vendor.products_list.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>{p.title}</div>
              <div>${p.price.toFixed(2)}</div>
              <div>{p.stock > 0 ? p.stock : <span style={{ color: 'var(--danger)' }}>Out of Stock</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlatformAnalytics = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    apiFetch('/admin/analytics').then(res => setData(res));
  }, []);

  if (!data) return <div>Loading platform analytics...</div>;

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart2 size={24} style={{ color: '#3b82f6' }} />
        <h2 style={{ margin: 0 }}>Platform Analytics Engine</h2>
      </div>
      
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PLATFORM REVENUE</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }} className="text-gradient">${data.summary.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL ORDERS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.total_orders}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL VENDORS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.total_vendors}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL PRODUCTS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.total_products}</h2>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Vendor Performance Ranking</h3>
        </div>
        <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px' }}>
          <div>VENDOR</div>
          <div>PRODUCTS</div>
          <div>ORDERS</div>
          <div>REVENUE</div>
          <div>STATUS</div>
          <div style={{ textAlign: 'center' }}>ACTION</div>
        </div>
        {data.vendor_performance.map((v, i) => (
          <div className="table-row" key={i} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px' }}>
            <div style={{ fontWeight: 600 }}>
              {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{v.vendor_name}
            </div>
            <div>{v.products}</div>
            <div>{v.orders}</div>
            <div style={{ fontWeight: 600, color: 'var(--success)' }}>${v.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <div><span className={`badge ${v.status === 'active' ? 'badge-active' : 'badge-warning'}`}>{v.status}</span></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn" style={{ padding: '0.5rem' }} title="View Details" onClick={() => setSelectedVendor(v)}>
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    {selectedVendor && <VendorDetailsModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}
    </>
  );
};

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<VendorDirectory />} />
      <Route path="/activity" element={<VendorActivityLog />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/analytics" element={<PlatformAnalytics />} />
    </Routes>
  );
};

export default AdminDashboard;
