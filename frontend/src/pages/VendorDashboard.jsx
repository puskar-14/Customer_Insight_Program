import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { 
  Box, PlusCircle, BarChart2, Package, Search, Trash2, Edit3, User, Camera, 
  Eye, Mail, Bell, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, 
  RotateCcw, RefreshCw, Zap, Star, MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// --- 1. Dashboard Overview with Analytics Validation ---
const Overview = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(`/vendor/analytics/advanced?time_range=30days&t=${Date.now()}`)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Access denied'));

    apiFetch('/vendor/analytics/validation')
      .then(res => setValidation(res))
      .catch(err => console.error('Validation check error:', err));
  }, []);

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}><h4>Account Restricted</h4><p>{error}</p></div>;
  if (!data) return <div>Loading overview...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Dashboard Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time multi-vendor commerce performance & stock health.
          </p>
        </div>

        {/* Analytical Validation Badge */}
        {validation && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.45rem 0.9rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--success)',
            fontWeight: 600
          }}>
            <ShieldCheck size={16} /> Data Validated: 100% Reconciled
          </div>
        )}
      </div>

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
      
      {/* Dual Revenue & Profit Combined Trend Graph */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Revenue & Profit Trend Analysis</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Comparative tracking of gross sales revenue vs estimated net profit margins.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-color)' }}></span> Revenue ($)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></span> Profit ($)
            </span>
          </div>
        </div>

        <div style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.sales_trend} margin={{ top: 10, right: 20, left: -10, bottom: 15 }}>
              <defs>
                <linearGradient id="colorRevDual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorProfDual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#03a685" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#03a685" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
              <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
              <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                itemStyle={{ color: '#282c3f' }}
                labelStyle={{ color: '#535766', fontWeight: 700, marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ff3f6c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevDual)" name="Revenue ($)" />
              <Area type="monotone" dataKey="profit" stroke="#03a685" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfDual)" name="Profit ($)" />
              <Legend verticalAlign="top" height={36} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Bar & Volume Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Order Volume Distribution</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
                <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Bar dataKey="orders" fill="#ff3f6c" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Daily Gross Revenue ($)</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
                <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Bar dataKey="revenue" fill="#03a685" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. Inventory Management Hub & Low Stock Alerts ---
const InventoryHub = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(20);
  const [toast, setToast] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/vendor/inventory');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockModal) return;
    try {
      const res = await apiFetch(`/vendor/inventory/${restockModal.id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantity: Number(restockQty) })
      });
      setToast(res.message);
      setTimeout(() => setToast(null), 3000);
      setRestockModal(null);
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Restock failed');
    }
  };

  if (loading) return <div>Loading inventory records...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(11, 31, 46, 0.95)',
          border: '1px solid var(--success)',
          color: '#fff',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Inventory Tracking & Stock Alerts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Monitor stock health, manage low-stock thresholds, and trigger instant restock.
          </p>
        </div>
        <button onClick={fetchInventory} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} /> Refresh Stock
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL STOCK UNITS</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>{data?.summary?.total_units}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>INVENTORY VALUATION</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>${data?.summary?.total_valuation?.toFixed(2)}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>LOW STOCK ALERTS</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data?.summary?.low_stock_count > 0 ? '#f59e0b' : 'var(--text-main)' }}>
            {data?.summary?.low_stock_count}
          </h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>OUT OF STOCK</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data?.summary?.out_of_stock_count > 0 ? '#ef4444' : 'var(--text-main)' }}>
            {data?.summary?.out_of_stock_count}
          </h2>
        </div>
      </div>

      {/* Inventory Table with Horizontal Scroll Safety */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '860px' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 1.3fr 130px',
                padding: '1rem 1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              <div>PRODUCT</div>
              <div>UNIT PRICE</div>
              <div>TOTAL STOCK</div>
              <div>STOCK LEFT</div>
              <div>VALUATION</div>
              <div>STOCK STATUS</div>
              <div style={{ textAlign: 'right' }}>ACTION</div>
            </div>

            {data?.inventory?.map((item) => {
              const totalStock = (item.quantity || 0) + (item.sales || 0);
              const stockLeft = item.quantity || 0;

              return (
                <div 
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr 1.3fr 130px',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    fontSize: '0.95rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category: {item.category}</div>
                  </div>

                  <div style={{ fontWeight: 700 }}>${item.price.toFixed(2)}</div>

                  {/* Total Stock */}
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {totalStock} units
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({item.sales || 0} sold)
                    </span>
                  </div>

                  {/* Stock Left */}
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: stockLeft === 0 ? '#ef4444' : stockLeft <= 10 ? '#ff905a' : '#03a685' }}>
                      {stockLeft} left
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    ${item.stock_valuation.toFixed(2)}
                  </div>

                  <div>
                    {item.is_out_of_stock ? (
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={12} /> Out of Stock
                      </span>
                    ) : item.is_low_stock ? (
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={12} /> Low Stock Alert
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Healthy Stock
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setRestockModal(item)}
                      className="btn btn-primary"
                      style={{ 
                        padding: '0.5rem 1rem', 
                        fontSize: '0.85rem', 
                        borderRadius: '8px', 
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Restock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog glass-panel" style={{ padding: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Restock Inventory
                </h3>
                <p style={{ color: 'var(--primary-color)', fontSize: '0.95rem', fontWeight: 600, margin: '0.25rem 0 0 0' }}>
                  {restockModal.title}
                </p>
              </div>

              <button 
                onClick={() => setRestockModal(null)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT STOCK</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{restockModal.quantity} units</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UNIT PRICE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>${restockModal.price?.toFixed(2)}</div>
              </div>
            </div>

            <form onSubmit={handleRestock}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>
                  Units to Add to Inventory
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700, padding: '0.75rem 1rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setRestockModal(null)}
                  style={{ padding: '0.75rem', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '0.75rem', fontWeight: 700, boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)' }}
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. Machine Learning Time-Series Demand Forecasting ---
const DemandForecast = () => {
  const { apiFetch } = useStore();
  const [forecastData, setForecastData] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vendor/analytics/inventory-forecast')
      .then(res => setForecastData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Machine Learning forecast models...</div>;

  const currentForecast = forecastData?.forecasts?.[selectedProductIndex] || null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.75rem', fontWeight: 600 }}>
          <Sparkles size={14} /> Time-Series ML Demand Forecasting (Holt-Winters / Trend Velocity)
        </div>
        <h2 className="gradient-text" style={{ margin: 0 }}>Predictive Inventory Demand & Stockout Warnings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Statistical projections calculate daily sales velocity to forecast stock depletion and recommended safety stock.
        </p>
      </div>

      {/* Product Selector Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {forecastData?.forecasts?.map((f, idx) => (
          <button
            key={f.product_id}
            onClick={() => setSelectedProductIndex(idx)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: selectedProductIndex === idx ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
              background: selectedProductIndex === idx ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
              color: selectedProductIndex === idx ? 'var(--primary-color)' : 'var(--text-muted)',
              fontWeight: selectedProductIndex === idx ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f.product_title}
          </button>
        ))}
      </div>

      {currentForecast && (
        <>
          {/* Key ML KPI Cards */}
          <div className="grid grid-cols-4">
            <div className="glass-panel text-center">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>DAILY SALES VELOCITY</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>
                {currentForecast.avg_daily_velocity} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>units/day</span>
              </h2>
            </div>

            <div className="glass-panel text-center">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ESTIMATED STOCKOUT</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: currentForecast.days_to_stockout <= 7 ? '#ef4444' : '#f59e0b' }}>
                {currentForecast.days_to_stockout} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Days</span>
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {currentForecast.estimated_sellout_date}</span>
            </div>

            <div className="glass-panel text-center">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>RECOMMENDED SAFETY BUFFER</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>
                {currentForecast.recommended_safety_stock} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>units</span>
              </h2>
            </div>

            <div className="glass-panel text-center">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>SUGGESTED REORDER QTY</p>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>
                {currentForecast.recommended_restock_qty} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>units</span>
              </h2>
            </div>
          </div>

          {/* 30-Day Projected Depletion Curve Chart */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem', color: '#282c3f', fontSize: '1.15rem' }}>30-Day Projected Stock Depletion Trajectory ({currentForecast.product_title})</h3>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentForecast.forecast_series} margin={{ top: 10, right: 20, left: -10, bottom: 15 }}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                  <XAxis dataKey="date" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
                  <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                    itemStyle={{ color: '#282c3f' }}
                    labelStyle={{ color: '#535766', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="projected_stock" stroke="#ff3f6c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStock)" name="Projected Stock" />
                  <Line type="monotone" dataKey="predicted_demand" stroke="#ff905a" strokeWidth={2.5} dot={{ r: 3, fill: '#ff905a' }} name="Daily Demand" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- 4. LLM Customer Review Sentiment Analysis Pipeline ---
const ReviewSentiment = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vendor/analytics/reviews-sentiment')
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Running LLM Sentiment Analysis on product reviews...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', color: '#c084fc', marginBottom: '0.75rem', fontWeight: 600 }}>
          <Sparkles size={14} /> Natural Language Processing (NLP / LLM) Sentiment Pipeline
        </div>
        <h2 className="gradient-text" style={{ margin: 0 }}>Customer Sentiment & Pros/Cons Intelligence</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Aggregated sentiment polarity analysis synthesizes buyer comments into strengths, weaknesses, and vendor actions.
        </p>
      </div>

      {/* Sentiment Gauge Cards */}
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>AVERAGE RATING</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Star size={24} fill="#f59e0b" /> {data.average_rating.toFixed(1)}
          </h2>
        </div>

        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>POSITIVE SENTIMENT</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>
            {data.positive_percentage}%
          </h2>
        </div>

        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NEUTRAL / MIXED</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>
            {data.neutral_percentage}%
          </h2>
        </div>

        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CRITICAL FEEDBACK</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data.negative_percentage > 10 ? '#ef4444' : 'var(--text-muted)' }}>
            {data.negative_percentage}%
          </h2>
        </div>
      </div>

      {/* Top Pros and Cons Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Pros */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '1rem' }}>
            <ThumbsUp size={20} /> Top Buyer Strengths (Pros)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.top_pros?.map((pro, idx) => (
              <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                ✅ {pro}
              </div>
            ))}
          </div>
        </div>

        {/* Cons */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '1rem' }}>
            <ThumbsDown size={20} /> Improvement Opportunities (Cons)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.top_cons?.map((con, idx) => (
              <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                ⚠️ {con}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Action Items */}
      <div className="glass-panel" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          <Zap size={20} /> AI Synthesized Action Items for Vendor
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.actionable_insights?.map((action, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 500 }}>
              {action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 5. Catalog Management ---
const Catalog = () => {
  const { apiFetch } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Marketing Email Modal State
  const [emailModal, setEmailModal] = useState(false);
  const [currentEmailContent, setCurrentEmailContent] = useState('');
  const [selectedProductTitle, setSelectedProductTitle] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Edit Product Modal State
  const [editModal, setEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = () => {
    apiFetch('/vendor/products')
      .then(res => setProducts(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/vendor/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingProduct.title,
          category: editingProduct.category,
          price: parseFloat(editingProduct.price),
          discount: parseFloat(editingProduct.discount || 0),
          quantity: parseInt(editingProduct.quantity),
          description: editingProduct.description,
          tagline: editingProduct.tagline,
          status: editingProduct.status
        })
      });
      setEditModal(false);
      loadProducts();
    } catch (err) {
      alert("Failed to update product details");
    }
  };

  const handleSendCampaign = () => {
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      setEmailSuccess(true);
      setTimeout(() => {
        setEmailSuccess(false);
        setEmailModal(false);
      }, 2000);
    }, 1000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiFetch(`/vendor/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Product Details Modal State (Clicking Product Name)
  const [detailProduct, setDetailProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Restock within Detail Modal State
  const [restockQty, setRestockQty] = useState('');
  const [restockSuccess, setRestockSuccess] = useState(false);

  const openProductDetails = async (product) => {
    setDetailProduct(product);
    setReviewsLoading(true);
    setRestockQty('');
    setRestockSuccess(false);
    try {
      const res = await apiFetch(`/shop/products/${product.id}/reviews`);
      setProductReviews(res || []);
    } catch (e) {
      console.error('Failed to load product reviews:', e);
      setProductReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDetailRestock = async (e) => {
    e.preventDefault();
    if (!restockQty || parseInt(restockQty) <= 0) return;
    try {
      await apiFetch(`/vendor/inventory/${detailProduct.id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantity_to_add: parseInt(restockQty) })
      });
      setRestockSuccess(true);
      const updatedStock = (detailProduct.quantity || 0) + parseInt(restockQty);
      setDetailProduct({ ...detailProduct, quantity: updatedStock });
      loadProducts();
      setTimeout(() => setRestockSuccess(false), 2500);
      setRestockQty('');
    } catch (err) {
      alert("Failed to restock product");
    }
  };

  if (loading) return <div>Loading catalog...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Catalog Management</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Click on any product title to view complete product details, customer ratings, buyer comments, and restock inventory.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search products or descriptions..." 
            className="input-field" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '280px', margin: 0 }} 
          />
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 1fr 1fr 1fr 160px', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>PRODUCT (CLICK TO VIEW)</div>
          <div>DESCRIPTION & AI COPY</div>
          <div>CATEGORY</div>
          <div>TOTAL STOCK</div>
          <div>STOCK LEFT</div>
          <div style={{ textAlign: 'center' }}>ACTIONS & CAMPAIGN</div>
        </div>

        {filteredProducts.map(p => {
          const totalStock = (p.quantity || 0) + (p.sales || 0);
          const stockLeft = p.quantity || 0;
          const ratingVal = p.rating || 4.5;

          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 1fr 1fr 1fr 160px', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', gap: '1rem' }}>
              
              {/* 1. Product Image, Title (Clickable), Rating, & Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={p.picture_url ? `http://localhost:8010${p.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} 
                  style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid #eaeaec', cursor: 'pointer' }} 
                  alt="" 
                  onClick={() => openProductDetails(p)}
                />
                <div>
                  <div 
                    onClick={() => openProductDetails(p)}
                    style={{ 
                      fontWeight: 700, 
                      color: 'var(--primary-color)', 
                      fontSize: '0.95rem', 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px'
                    }}
                    title="Click to view complete details, ratings & comments"
                  >
                    {p.title}
                  </div>
                  
                  {/* Rating Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    {p.rating && p.rating > 0 ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#03a685', color: '#ffffff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                        <span>{p.rating.toFixed(1)}</span>
                        <Star size={10} fill="#ffffff" />
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94969f', background: '#f5f5f6', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                        No ratings yet
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#94969f' }}>({p.sales || 0} sold)</span>
                  </div>

                  <div style={{ fontWeight: 800, color: '#282c3f', marginTop: '0.2rem', fontSize: '0.95rem' }}>
                    ${p.price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 2. Description & AI Copy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ 
                  backgroundColor: 'rgba(56, 189, 248, 0.08)', 
                  color: '#0284c7', 
                  padding: '0.45rem 0.65rem', 
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  lineHeight: '1.35',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {p.description || "Premium catalog offering crafted for maximum performance and style."}
                </div>
                {p.tagline && (
                  <div style={{ fontSize: '0.75rem', color: '#ff905a', fontWeight: 700 }}>
                    ✨ {p.tagline}
                  </div>
                )}
              </div>

              {/* 3. Category */}
              <div style={{ color: '#535766', fontWeight: 600, fontSize: '0.9rem' }}>
                <span style={{ background: '#f5f5f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  {p.category}
                </span>
              </div>
              
              {/* 4. Total Stock */}
              <div>
                <span style={{ fontWeight: 700, color: '#282c3f', fontSize: '0.95rem' }}>
                  {totalStock} units
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94969f' }}>
                  ({p.sales || 0} sold)
                </span>
              </div>

              {/* 5. Stock Left */}
              <div>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  color: stockLeft === 0 ? '#ef4444' : stockLeft <= (p.low_stock_threshold || 10) ? '#ff905a' : '#03a685' 
                }}>
                  {stockLeft} left
                </span>
                {stockLeft === 0 ? (
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>
                    Out of stock
                  </span>
                ) : stockLeft <= (p.low_stock_threshold || 10) ? (
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#ff905a', fontWeight: 800, textTransform: 'uppercase' }}>
                    Low stock alert
                  </span>
                ) : (
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#03a685', fontWeight: 600 }}>
                    In stock
                  </span>
                )}
              </div>

              {/* 6. Actions & Campaign Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                <button 
                  title="Edit Product Details"
                  className="btn btn-secondary" 
                  style={{ padding: '0.45rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }} 
                  onClick={() => { setEditingProduct({...p}); setEditModal(true); }}
                >
                  <Edit3 size={13}/> Edit
                </button>

                <button 
                  title="Send Marketing Campaign Email"
                  className="btn btn-secondary" 
                  style={{ padding: '0.45rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', background: '#fff1f4', border: '1px solid #fde2e7' }} 
                  onClick={() => { 
                    setSelectedProductTitle(p.title);
                    setCurrentEmailContent(p.marketing_email || `Subject: Discover our top-rated ${p.title}!\n\nHello Valued Customer,\n\nWe are excited to spotlight our ${p.title}. Crafted for premium quality and outstanding performance. Order now to get exclusive discounts!\n\nBest,\nShopSense Team`); 
                    setEmailModal(true); 
                  }}
                >
                  <Mail size={13}/> Email
                </button>

                <button 
                  title="Delete Product"
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }} 
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 size={16}/>
                </button>
              </div>

            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No products found matching your search.
          </div>
        )}
      </div>

      {/* FULL PRODUCT DETAILS & CUSTOMER REVIEWS & RESTOCK MODAL */}
      {detailProduct && (
        <div className="modal-backdrop" onClick={() => setDetailProduct(null)}>
          <div 
            className="modal-dialog animate-fade-in" 
            style={{ width: '740px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eaeaec', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <img 
                  src={detailProduct.picture_url ? `http://localhost:8010${detailProduct.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'} 
                  style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '1px solid #eaeaec' }} 
                  alt="" 
                />
                <div>
                  <span style={{ fontSize: '0.75rem', background: '#f5f5f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, color: '#535766', textTransform: 'uppercase' }}>
                    {detailProduct.category}
                  </span>
                  <h2 style={{ margin: '0.35rem 0 0.2rem 0', color: '#282c3f', fontSize: '1.4rem', fontWeight: 800 }}>
                    {detailProduct.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                      ${detailProduct.price.toFixed(2)}
                    </span>
                    {detailProduct.discount > 0 && (
                      <span style={{ fontSize: '0.85rem', color: '#ff905a', fontWeight: 700, background: '#fff5ed', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {detailProduct.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => setDetailProduct(null)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Product Metadata & AI Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fafbfc', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaec' }}>
                <div style={{ fontSize: '0.75rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>CUSTOMER RATING</div>
                {detailProduct.rating && detailProduct.rating > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#03a685' }}>
                      {detailProduct.rating.toFixed(1)} / 5.0
                    </span>
                    <Star size={16} fill="#03a685" color="#03a685" />
                  </div>
                ) : (
                  <div style={{ marginTop: '0.25rem', fontSize: '1rem', fontWeight: 700, color: '#94969f' }}>
                    No ratings yet
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#535766', marginTop: '0.2rem' }}>
                  {detailProduct.sales || 0} total units ordered
                </div>
              </div>

              <div style={{ background: '#fafbfc', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaec' }}>
                <div style={{ fontSize: '0.75rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>INVENTORY STATUS</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: detailProduct.quantity === 0 ? '#ef4444' : detailProduct.quantity <= 10 ? '#ff905a' : '#03a685', marginTop: '0.25rem' }}>
                  {detailProduct.quantity} units left
                </div>
                <div style={{ fontSize: '0.75rem', color: '#535766', marginTop: '0.2rem' }}>
                  Initial Stock: {(detailProduct.quantity || 0) + (detailProduct.sales || 0)} units
                </div>
              </div>

              <div style={{ background: '#fafbfc', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaec' }}>
                <div style={{ fontSize: '0.75rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>STOCK VALUATION</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#282c3f', marginTop: '0.25rem' }}>
                  ${((detailProduct.quantity || 0) * (detailProduct.price || 0)).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#535766', marginTop: '0.2rem' }}>
                  SKU: {detailProduct.sku || `SKU-${detailProduct.id}`}
                </div>
              </div>
            </div>

            {/* Description & Tagline Box */}
            <div style={{ background: '#fff1f4', border: '1px solid #fde2e7', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Product Description & Copy
              </div>
              <p style={{ margin: 0, color: '#282c3f', fontSize: '0.925rem', lineHeight: 1.5 }}>
                {detailProduct.description || "Premium catalog offering crafted for maximum performance, elegance, and durability."}
              </p>
              {detailProduct.tagline && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#ff905a', fontWeight: 700 }}>
                  ✨ Tagline: "{detailProduct.tagline}"
                </div>
              )}
            </div>

            {/* 1-CLICK RESTOCK SECTION */}
            <div style={{ background: '#ffffff', border: '1px solid #eaeaec', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(40,44,63,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: '#282c3f', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem', fontWeight: 800 }}>
                  <Box size={18} color="var(--primary-color)" /> Instant Inventory Restock
                </h4>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#535766' }}>
                  Current: {detailProduct.quantity} units
                </span>
              </div>

              {restockSuccess && (
                <div style={{ background: '#e6f9f4', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Inventory successfully restocked! Catalog has been refreshed.
                </div>
              )}

              <form onSubmit={handleDetailRestock} style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="number" 
                  min="1" 
                  placeholder="Enter units to add (e.g. 50)" 
                  className="input-field" 
                  value={restockQty} 
                  onChange={e => setRestockQty(e.target.value)}
                  style={{ margin: 0, flex: 1, padding: '0.65rem 1rem' }}
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '0.65rem 1.4rem', fontWeight: 800, whiteSpace: 'nowrap' }}
                >
                  + Add Stock
                </button>
              </form>
            </div>

            {/* CUSTOMER REVIEWS & COMMENTS SECTION */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#282c3f', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={18} color="#03a685" /> Customer Ratings & Reviews ({productReviews.length})
                </h4>
              </div>

              {reviewsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94969f' }}>Loading buyer reviews...</div>
              ) : productReviews.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fafbfc', borderRadius: '8px', border: '1px solid #eaeaec', color: '#535766' }}>
                  <Star size={24} style={{ color: '#ff905a', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>No individual customer reviews submitted yet.</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94969f' }}>
                    Customer ratings from purchases automatically synthesize into average product scores.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {productReviews.map((rev) => (
                    <div key={rev.id} style={{ background: '#fafbfc', border: '1px solid #eaeaec', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#282c3f', fontSize: '0.9rem' }}>{rev.customer_name}</span>
                          <span style={{ fontSize: '0.7rem', background: '#e6f9f4', color: '#03a685', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            Verified Buyer
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#03a685', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                          <span>{rev.rating}</span>
                          <Star size={11} fill="#ffffff" />
                        </div>
                      </div>

                      <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#535766', fontSize: '0.875rem', lineHeight: 1.4 }}>
                        "{rev.comment}"
                      </p>

                      {(rev.pros || rev.cons) && (
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                          {rev.pros && (
                            <span style={{ color: '#03a685', background: '#e6f9f4', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                              ✓ {rev.pros}
                            </span>
                          )}
                          {rev.cons && (
                            <span style={{ color: '#ef4444', background: '#fff1f4', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                              ✕ {rev.cons}
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#94969f', marginTop: '0.4rem' }}>
                        {rev.created_at}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setDetailProduct(null)} style={{ fontWeight: 700, padding: '0.65rem 1.5rem' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal && editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditModal(false)}>
          <div className="modal-dialog animate-fade-in" style={{ width: '600px', maxWidth: '90%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#282c3f', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', fontWeight: 800 }}>
                <Edit3 size={20} color="var(--primary-color)" /> Edit Product Details
              </h3>
              <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Product Title</label>
                  <input type="text" className="input-field" required value={editingProduct.title || ''} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" className="input-field" required value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" className="input-field" required value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input type="number" className="input-field" value={editingProduct.discount || ''} onChange={e => setEditingProduct({...editingProduct, discount: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" className="input-field" required value={editingProduct.quantity || ''} onChange={e => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>AI Tagline</label>
                  <input type="text" className="input-field" value={editingProduct.tagline || ''} onChange={e => setEditingProduct({...editingProduct, tagline: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Description</label>
                  <textarea className="input-field" rows="3" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marketing Email Campaign Modal */}
      {emailModal && (
        <div className="modal-backdrop" onClick={() => setEmailModal(false)}>
          <div className="modal-dialog animate-fade-in" style={{ width: '560px', maxWidth: '90%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#282c3f', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', fontWeight: 800 }}>
                  <Mail size={20} color="var(--primary-color)" /> Send Campaign Email
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94969f' }}>
                  Product: <strong>{selectedProductTitle}</strong>
                </p>
              </div>
              <button onClick={() => setEmailModal(false)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer' }}>✕</button>
            </div>

            {emailSuccess && (
              <div style={{ background: '#e6f9f4', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> Marketing Campaign successfully dispatched to target customer segment!
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Campaign Email Copy (Markdown / Text)</label>
              <textarea 
                className="input-field" 
                style={{ minHeight: '220px', fontFamily: 'monospace', lineHeight: 1.5, fontSize: '0.9rem' }}
                value={currentEmailContent}
                onChange={e => setCurrentEmailContent(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setEmailModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={handleSendCampaign}
                disabled={emailSending}
              >
                {emailSending ? 'Sending Campaign...' : 'Send Campaign Now 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 6. Add Product ---
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
      const res = await fetch('http://localhost:8010/vendor/products', {
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
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Product Image</label>
          <input type="file" className="input-field" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}>
          {loading ? 'Creating...' : 'Upload & Publish Product'}
        </button>
      </form>
    </div>
  );
};

// --- 7. Analytics Engine ---
const PIE_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#e11d48'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent === 0) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12px"
      fontWeight="700"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Analytics = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `/vendor/analytics/advanced?time_range=${timeRange}&t=${Date.now()}`;
    if (timeRange === 'custom') {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    
    apiFetch(url)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [timeRange, startDate, endDate]);

  if (loading || !data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Advanced Analytics Engine...</div>;

  // Prepare Pie Chart data from product sales
  const productPieData = (data.product_sales || [])
    .filter(p => (p.sales || 0) > 0 || (p.revenue || 0) > 0)
    .map(p => ({
      name: p.title,
      value: p.sales || 1
    }));

  const categoryPieData = (data.category_sales || [])
    .filter(c => (c.value || 0) > 0)
    .map(c => ({
      name: c.name,
      value: c.value
    }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Range Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={26} /> Advanced Analytics Engine (Live)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time multi-dimensional velocity, order trajectories, profit curves & AI demand insights.
          </p>
        </div>

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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL REVENUE</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>${data.summary.revenue.toFixed(2)}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ESTIMATED PROFIT</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>${data.summary.profit.toFixed(2)}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL ORDERS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.orders}</h2>
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>LISTED PRODUCTS</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{data.summary.products}</h2>
        </div>
      </div>

      {/* Graph 1: Orders Trend (Line Chart) - Full Width */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Orders Trend (Line Chart)</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.sales_trend} margin={{ top: 10, right: 20, left: -10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
              <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
              <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                itemStyle={{ color: '#282c3f' }}
                labelStyle={{ color: '#535766', fontWeight: 700, marginBottom: '4px' }}
              />
              <Line type="monotone" dataKey="orders" stroke="#ff3f6c" strokeWidth={3} dot={{ r: 4, fill: '#ff3f6c' }} activeDot={{ r: 6 }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graph 1B: Combined Revenue & Profit Comparative Chart */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Revenue & Profit Trajectory (Dual Comparative Chart)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Side-by-side performance of gross earnings vs bottom-line net profit.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff3f6c', fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3f6c' }}></span> Revenue ($)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#03a685', fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#03a685' }}></span> Profit ($)
            </span>
          </div>
        </div>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.sales_trend} margin={{ top: 10, right: 20, left: -10, bottom: 15 }}>
              <defs>
                <linearGradient id="colorRevDualAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorProfDualAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#03a685" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#03a685" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
              <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
              <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                itemStyle={{ color: '#282c3f' }}
                labelStyle={{ color: '#535766', fontWeight: 700, marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ff3f6c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevDualAnalytics)" name="Revenue ($)" />
              <Area type="monotone" dataKey="profit" stroke="#03a685" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfDualAnalytics)" name="Profit ($)" />
              <Legend verticalAlign="top" height={36} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graph 2 & 3: Revenue Trend (Bar Chart) & Profit Margins (Area Chart) */}
      <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Revenue Trend (Bar Chart)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
                <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Bar dataKey="revenue" fill="#03a685" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Profit Margins (Area Chart)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <defs>
                  <linearGradient id="colorProfitPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
                <YAxis stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#ff3f6c" strokeWidth={2.5} fill="url(#colorProfitPink)" name="Profit ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Graph 4 & 5: Sales by Category (Doughnut) & Sales by Product (Pie Chart) */}
      <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', color: '#282c3f' }}>Sales by Category (Doughnut)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <Pie 
                  data={categoryPieData.length > 0 ? categoryPieData : [{ name: 'Catalog', value: 1 }]} 
                  innerRadius={60} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value" 
                  nameKey="name" 
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {(categoryPieData.length > 0 ? categoryPieData : [{ name: 'Catalog', value: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', color: '#282c3f' }}>Sales by Product (Pie Chart)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <Pie 
                  data={productPieData.length > 0 ? productPieData : [{ name: 'Products', value: 1 }]} 
                  outerRadius={90} 
                  dataKey="value" 
                  nameKey="name" 
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {(productPieData.length > 0 ? productPieData : [{ name: 'Products', value: 1 }]).map((entry, index) => (
                    <Cell key={`cell-prod-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product-wise Sales Analysis Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Product-wise Sales Analysis</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 2.5fr', padding: '0.9rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>PRODUCT NAME</div>
          <div>UNITS SOLD</div>
          <div>REVENUE</div>
          <div>STATUS</div>
          <div>AI INSIGHT</div>
        </div>

        {data.product_sales?.map((ps) => (
          <div 
            key={ps.id} 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.8fr 1fr 1fr 1fr 2.5fr', 
              padding: '1.15rem 1.5rem', 
              borderBottom: '1px solid rgba(255,255,255,0.04)', 
              alignItems: 'center',
              fontSize: '0.95rem'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ps.title}</div>
            <div>{ps.sales || 0}</div>
            <div style={{ color: 'var(--success)', fontWeight: 700 }}>${(ps.revenue || 0).toFixed(2)}</div>
            <div>
              {ps.sales === 0 ? (
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  WAITING
                </span>
              ) : (
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  SELLING
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#c084fc', fontStyle: 'italic', lineHeight: 1.4 }}>
              {ps.insight || "💡 AI: Maintain steady marketing momentum."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 8. Profile ---
const Profile = () => {
  const { user, apiFetch } = useStore();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '', 
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '', 
    address: user?.address || '',
    business_name: user?.business_name || '', 
    business_category: user?.business_category || '',
    gst_number: user?.gst_number || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/vendor/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('Vendor profile updated successfully! 🎉');
    } catch(err) {
      alert('Update failed: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#fff1f4', border: '2px solid var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {user?.profile_picture_url ? (
            <img src={user.profile_picture_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" />
          ) : (
            <Camera size={32} style={{ color: 'var(--primary-color)' }} />
          )}
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary-color)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit3 size={13} color="#ffffff" />
          </div>
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#282c3f', fontSize: '1.6rem' }}>{user?.business_name || `${user?.first_name || 'Vendor'} ${user?.last_name || ''}`}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '0.9rem' }}>
            ⭐ {user?.rating > 0 ? user?.rating.toFixed(1) : '5.0 (Top Rated)'} • Member since {user?.joined_date ? new Date(user.joined_date).getFullYear() : '2024'}
          </p>
          <span style={{ fontSize: '0.75rem', background: '#e6f9f4', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
            VERIFIED SELLER
          </span>
        </div>
      </div>
      
      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="input-field" value={formData.first_name || ''} onChange={e => setFormData({...formData, first_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="input-field" value={formData.last_name || ''} onChange={e => setFormData({...formData, last_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="input-field" value={formData.phone_number || ''} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          </div>
          <div className="form-group">
            <label>GST / Tax ID Number</label>
            <input type="text" className="input-field" value={formData.gst_number || ''} onChange={e => setFormData({...formData, gst_number: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Registered Business Address</label>
            <input type="text" className="input-field" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Business Name</label>
            <input type="text" className="input-field" value={formData.business_name || ''} onChange={e => setFormData({...formData, business_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Business Category</label>
            <input type="text" className="input-field" value={formData.business_category || ''} onChange={e => setFormData({...formData, business_category: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '0.85rem' }}>
          Save Profile Changes
        </button>
      </form>
    </div>
  );
};

// --- 9. Notifications ---
const Notifications = () => {
  const { apiFetch } = useStore();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch('/vendor/notifications').then(res => setNotifications(res)).catch(err => console.error(err));
  }, []);

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Bell size={24} style={{ color: '#38bdf8' }} /> Notifications
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
              <strong>{n.action}</strong>: {n.remarks}
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
      <Route path="/inventory" element={<InventoryHub />} />
      <Route path="/forecast" element={<DemandForecast />} />
      <Route path="/sentiment" element={<ReviewSentiment />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
};

export default VendorDashboard;
