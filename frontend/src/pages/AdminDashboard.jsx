import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store';
import { Rocket, FileText, TrendingUp, Activity, Box, Package, BarChart2, X, Send, AlertCircle, Eye, User, Filter, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OrderFulfillmentCard, CategoryAndLeaderboardGrid } from './VendorDashboard';

const VendorDirectory = () => {
  const [data, setData] = useState({ vendors: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { apiFetch } = useStore();
  const navigate = useNavigate();

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
            <div style={{ color: 'var(--success)', fontWeight: 600 }}>₹{(vendor.revenue || 0).toFixed(2)}</div>
            <div>
              ⭐ {vendor.rating > 0 ? (vendor.rating || 0).toFixed(1) : 'No rating'}
            </div>
            <div>
              <span className={`badge badge-${vendor.status}`}>{vendor.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} 
                onClick={() => navigate(`/admin/analytics?vendor_id=${vendor.id}`)}
                title="View Fulfillment Health & Category Analytics"
              >
                <BarChart2 size={14} /> Analytics
              </button>
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
            <img 
              src={product.picture_url ? `http://localhost:8010${product.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
              style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '1/1', border: '1px solid var(--border-color)' }} 
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
              }}
            />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{product.title}</h3>
            <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem' }}>₹{product.price.toFixed(2)}</div>
            
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
      <div className="table-header" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 80px' }}>
        <div>PRODUCT & VENDOR</div>
        <div>CATEGORY</div>
        <div>PRICE</div>
        <div>STOCK</div>
        <div>SOLD</div>
        <div>STATUS</div>
        <div style={{ textAlign: 'center' }}>ACTION</div>
      </div>
      {products.map(p => (
        <div className="table-row" key={p.id} style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={p.picture_url ? `http://localhost:8010${p.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} 
              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} 
              alt={p.title} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
              }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {p.vendor_name}</div>
            </div>
          </div>
          <div>{p.category}</div>
          <div style={{ fontWeight: 600 }}>₹{p.price.toFixed(2)}</div>
          <div>{p.quantity > 0 ? p.quantity : <span style={{ color: 'var(--danger)' }}>Out of Stock</span>}</div>
          <div>{p.sales || 0}</div>
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
// --- 4. Platform Analytics Engine ---
const VendorDetailsModal = ({ vendor, onClose }) => {
  const { apiFetch } = useStore();
  const [vendorAnalytics, setVendorAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    const vId = vendor.vendor_id || vendor.id;
    if (vId) {
      apiFetch(`/admin/analytics?vendor_id=${vId}`)
        .then(res => setVendorAnalytics(res))
        .catch(err => console.error('Failed to load vendor analytics for modal:', err))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [vendor]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} style={{ color: '#8b5cf6' }} />
          Vendor Analytics & Profile: {vendor.vendor_name || vendor.name}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Profile Information</h3>
            <p><strong>Email:</strong> {vendor.email}</p>
            <p><strong>Phone:</strong> {vendor.phone_number}</p>
            <p><strong>Joined:</strong> {vendor.joined_date || 'N/A'}</p>
            <p><strong>Rating:</strong> {vendor.rating > 0 ? `${vendor.rating.toFixed(1)} ⭐` : 'No ratings'}</p>
            <p><strong>Status:</strong> <span className={`badge ${vendor.status === 'active' ? 'badge-active' : 'badge-warning'}`}>{vendor.status}</span></p>
          </div>
          <div>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Business Analytics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>TOTAL REVENUE GENERATED</p>
                <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{Number(vendor.revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>TOTAL ORDERS</p>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{vendor.orders || 0}</div>
                </div>
                <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>CATALOG SIZE</p>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{vendor.products || 0} items</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor-specific Order Preview & Fulfillment Health */}
        {vendorAnalytics?.order_status_distribution && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} style={{ color: '#10b981' }} />
              Fulfillment Health & Order Status
            </h3>
            <OrderFulfillmentCard orderDist={vendorAnalytics.order_status_distribution} />
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} style={{ color: '#f59e0b' }} />
            Product Catalog ({vendor.products || 0})
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
              <div>₹{Number(p.price || 0).toFixed(2)}</div>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVendor = searchParams.get('vendor_id') || 'all';
  const [activeTab, setActiveTab] = useState(initialVendor !== 'all' ? 'individual' : 'overall');
  const [selectedVendorId, setSelectedVendorId] = useState(initialVendor);
  const [leaderboardTab, setLeaderboardTab] = useState('products');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const fetchAnalytics = async (vId) => {
    setLoading(true);
    try {
      const url = vId && vId !== 'all' ? `/admin/analytics?vendor_id=${vId}` : '/admin/analytics';
      const res = await apiFetch(url);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const vId = searchParams.get('vendor_id') || 'all';
    setSelectedVendorId(vId);
    if (vId !== 'all') {
      setActiveTab('individual');
    }
    fetchAnalytics(vId);
  }, [searchParams]);

  const handleVendorChange = (newVendorId) => {
    setSelectedVendorId(newVendorId);
    if (newVendorId && newVendorId !== 'all') {
      setActiveTab('individual');
      setSearchParams({ vendor_id: newVendorId });
    } else {
      setActiveTab('overall');
      setSearchParams({});
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'overall') {
      setSelectedVendorId('all');
      setSearchParams({});
    } else if (tab === 'individual') {
      // Pick first vendor if 'all' was selected
      const firstVendorId = data?.vendors?.[0]?.id ? String(data.vendors[0].id) : 'all';
      const targetId = selectedVendorId !== 'all' ? selectedVendorId : firstVendorId;
      setSelectedVendorId(targetId);
      if (targetId !== 'all') {
        setSearchParams({ vendor_id: targetId });
      }
    }
  };

  if (loading && !data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading analytics engine...</div>;
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>No analytics available.</div>;

  const rankingList = data.vendor_performance_ranking || (Array.isArray(data.vendor_performance) ? data.vendor_performance : (data.vendor_performance?.vendors || []));
  const isIndividual = activeTab === 'individual' && selectedVendorId !== 'all';

  const gridData = {
    ...data,
    category_distribution: data.category_distribution || { total_revenue: 0, categories: [] },
    product_performance: data.product_performance || [],
    vendor_performance: data.peer_vendor_performance || (Array.isArray(data.vendor_performance) ? { vendors: data.vendor_performance } : (data.vendor_performance || { vendors: [] }))
  };

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header & Main Mode Toggle Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart2 size={26} style={{ color: '#3b82f6' }} />
            <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Platform & Vendor Analytics Engine</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Switch between comprehensive marketplace overall graphs and isolated individual vendor graphs.
          </p>
        </div>

        {/* View Mode Switcher: Overall vs Individual */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button 
            onClick={() => handleTabSwitch('overall')}
            style={{ 
              background: activeTab === 'overall' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: activeTab === 'overall' ? '#2563eb' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeTab === 'overall' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🌐 Overall Platform Graphs
          </button>
          <button 
            onClick={() => handleTabSwitch('individual')}
            style={{ 
              background: activeTab === 'individual' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: activeTab === 'individual' ? '#2563eb' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeTab === 'individual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            👤 Individual Vendor Graphs
          </button>
        </div>
      </div>

      {/* Mode A: Individual Vendor View Controls & Spotlight */}
      {activeTab === 'individual' && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👤 Individual Vendor Inspection</span>
                {data.selected_vendor && (
                  <span className={`badge badge-${data.selected_vendor.status}`}>
                    {data.selected_vendor.status}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Select any vendor to isolate their individual fulfillment health donut, revenue share, and top products.
              </div>
            </div>

            {/* Vendor Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                Select Vendor:
              </span>
              <select 
                className="input-field" 
                style={{ margin: 0, minWidth: '260px', fontWeight: 600, background: '#ffffff', color: '#0f172a', borderRadius: '8px' }}
                value={selectedVendorId}
                onChange={(e) => handleVendorChange(e.target.value)}
              >
                {(data.vendors || []).map(v => (
                  <option key={v.id} value={String(v.id)}>
                    👤 {v.name || v.vendor_name} ({v.email})
                  </option>
                ))}
              </select>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => handleTabSwitch('overall')}
                title="Return to overall marketplace overview"
              >
                <RotateCcw size={14} /> Back to Overall
              </button>
            </div>
          </div>

          {/* Quick Vendor Selector Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Quick Switch:</span>
            {(data.vendors || []).map(v => {
              const vId = String(v.id);
              const isCurrent = selectedVendorId === vId;
              return (
                <button
                  key={v.id}
                  onClick={() => handleVendorChange(vId)}
                  style={{
                    background: isCurrent ? '#2563eb' : '#ffffff',
                    color: isCurrent ? '#ffffff' : '#334155',
                    border: isCurrent ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: isCurrent ? 700 : 600,
                    cursor: 'pointer',
                    boxShadow: isCurrent ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {v.name || v.vendor_name}
                </button>
              );
            })}
          </div>

          {/* Selected Vendor Info Bar */}
          {data.selected_vendor && (
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '10px', 
              padding: '0.75rem 1rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <strong>{data.selected_vendor.name}</strong> • <span style={{ color: '#64748b' }}>{data.selected_vendor.email}</span> • <span style={{ color: '#64748b' }}>{data.selected_vendor.phone_number || 'No phone'}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                {data.selected_vendor.rating > 0 && <span>⭐ Rating: <strong>{data.selected_vendor.rating.toFixed(1)}</strong></span>}
                <span>Catalog: <strong>{data.summary.products} products</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Overall Platform Banner */}
      {activeTab === 'overall' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌐</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                Marketplace Overall Analytics View
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Aggregating all {data.summary.total_vendors} vendors, {data.summary.total_products} products, and live fulfillment health.
              </div>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => handleTabSwitch('individual')}
          >
            <User size={15} /> Switch to Individual Vendor Graph
          </button>
        </div>
      )}
      
      {/* 4 KPI Summary Stat Cards */}
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            {isIndividual ? 'VENDOR NET REVENUE' : 'PLATFORM REVENUE'}
          </p>
          <h2 style={{ margin: 0, fontSize: '2rem' }} className="text-gradient">
            ₹{(isIndividual ? data.summary.revenue : data.summary.total_revenue)?.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </h2>
          {isIndividual && data.summary.refunded_amount > 0 && (
            <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
              (-₹{data.summary.refunded_amount.toFixed(2)} refunded returns)
            </span>
          )}
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            {isIndividual ? 'VENDOR ORDERS' : 'TOTAL ORDERS'}
          </p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>
            {isIndividual ? data.summary.orders : data.summary.total_orders}
          </h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            {isIndividual ? 'EST. PROFIT (MARGIN)' : 'TOTAL VENDORS'}
          </p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: isIndividual ? 'var(--success)' : 'inherit' }}>
            {isIndividual 
              ? `₹${(data.summary.profit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`
              : data.summary.total_vendors}
          </h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            {isIndividual ? 'LISTED PRODUCTS' : 'TOTAL PRODUCTS'}
          </p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>
            {isIndividual ? data.summary.products : data.summary.total_products}
          </h2>
        </div>
      </div>

      {/* 1. Order Preview & Fulfillment Health Distribution */}
      {data.order_status_distribution && (
        <OrderFulfillmentCard orderDist={data.order_status_distribution} />
      )}

      {/* 2. Category Distribution & Multi-Bar Leaderboard Grid */}
      <CategoryAndLeaderboardGrid 
        data={gridData} 
        leaderboardTab={leaderboardTab} 
        setLeaderboardTab={setLeaderboardTab} 
      />

      {/* Vendor Performance Ranking Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Vendor Performance Ranking</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Click &quot;View Individual Graph&quot; on any vendor to isolate their charts
          </span>
        </div>
        <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 180px' }}>
          <div>VENDOR</div>
          <div>PRODUCTS</div>
          <div>ORDERS</div>
          <div>REVENUE</div>
          <div>STATUS</div>
          <div style={{ textAlign: 'center' }}>ACTIONS</div>
        </div>
        {rankingList.map((v, i) => {
          const vId = String(v.vendor_id || v.id);
          const isSelected = selectedVendorId === vId && isIndividual;
          return (
            <div 
              className="table-row" 
              key={i} 
              style={{ 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 180px',
                background: isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined,
                borderLeft: isSelected ? '4px solid #2563eb' : undefined
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{v.vendor_name || v.name}
                {isSelected && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>(Viewing Graph)</span>}
              </div>
              <div>{v.products}</div>
              <div>{v.orders}</div>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>₹{Number(v.revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div><span className={`badge ${v.status === 'active' ? 'badge-active' : 'badge-warning'}`}>{v.status}</span></div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                <button 
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} 
                  title="View individual graph for this vendor"
                  onClick={() => handleVendorChange(vId)}
                >
                  <BarChart2 size={13} /> {isSelected ? 'Current Graph' : 'Individual Graph'}
                </button>
                <button className="btn" style={{ padding: '0.4rem' }} title="View Full Details Modal" onClick={() => setSelectedVendor(v)}>
                  <Eye size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    {selectedVendor && <VendorDetailsModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}
    </>
  );
};

// --- Customer Segmentation Analytics ---
const CustomerSegmentation = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/analytics/customer-segments')
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div>Loading SQL customer segments...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="gradient-text" style={{ margin: 0 }}>SQL-Based Customer Segmentation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          RFM and total spend segmentation grouping customers into actionable value tiers.
        </p>
      </div>

      <div className="grid grid-cols-4">
        {data.segments?.map((seg, idx) => (
          <div key={idx} className="glass-panel" style={{ borderTop: `4px solid ${idx === 0 ? '#10b981' : idx === 1 ? '#38bdf8' : idx === 2 ? '#f59e0b' : '#ef4444'}` }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{seg.name.toUpperCase()}</h4>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>{seg.count} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({seg.percentage}%)</span></h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>Total Spent: <strong style={{ color: 'var(--success)' }}>₹{seg.revenue.toFixed(2)}</strong></div>
              <div>Avg. Spend: <strong>₹{seg.avg_spend.toFixed(2)}</strong></div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.25rem' }}>Segment Breakdown & Target Retention Strategies</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.segments?.map((seg, idx) => (
            <div key={idx} style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{seg.name}</strong>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{seg.revenue_share}% Platform Revenue</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.75rem 0' }}>
                {idx === 0 ? '🎯 Strategy: Reward with exclusive VIP perks, personal account manager, and early product drops.' :
                 idx === 1 ? '🎯 Strategy: Encourage repeat frequency with milestone discounts and free shipping perks.' :
                 idx === 2 ? '🎯 Strategy: Onboarding nurture sequences and product discovery recommendations.' :
                 '🎯 Strategy: Re-engagement campaigns with win-back discount vouchers.'}
              </p>
              {seg.sample_customers?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {seg.sample_customers.map((c, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      👤 {c.name} (₹{c.total_spent})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Platform Stock Health Monitor ---
const StockHealth = () => {
  const { apiFetch } = useStore();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/inventory')
      .then(res => setHealth(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !health) return <div>Loading stock health records...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="gradient-text" style={{ margin: 0 }}>Platform Inventory Health & Stockout Monitor</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          System-wide catalog inventory valuation and low-stock vendor notifications.
        </p>
      </div>

      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL PRODUCTS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{health.total_catalog_products}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PLATFORM STOCK UNITS</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>{health.total_stock_units}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CATALOG VALUATION</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>₹{health.total_inventory_valuation?.toFixed(2)}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>OUT OF STOCK ITEMS</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: health.out_of_stock_count > 0 ? '#ef4444' : 'var(--text-main)' }}>
            {health.out_of_stock_count}
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Out of Stock Items</h3>
          {health.out_of_stock_items?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items currently out of stock.</p>
          ) : (
            health.out_of_stock_items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span><strong>{item.title}</strong> (By {item.vendor_name})</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>0 Units</span>
              </div>
            ))
          )}
        </div>

        <div className="glass-panel">
          <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>⚠️ Low Stock Warnings (&le; 10 Units)</h3>
          {health.low_stock_items?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>All catalog products have healthy stock.</p>
          ) : (
            health.low_stock_items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span><strong>{item.title}</strong> (By {item.vendor_name})</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{item.quantity} Units Left</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<VendorDirectory />} />
      <Route path="/activity" element={<VendorActivityLog />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/analytics" element={<PlatformAnalytics />} />
      <Route path="/segments" element={<CustomerSegmentation />} />
      <Route path="/stock-health" element={<StockHealth />} />
    </Routes>
  );
};

export default AdminDashboard;

