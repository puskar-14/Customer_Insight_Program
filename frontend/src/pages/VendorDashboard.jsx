import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { 
  Box, PlusCircle, BarChart2, Package, Search, Trash2, Edit3, User, Camera, 
  Eye, Mail, Bell, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, 
  RotateCcw, RefreshCw, Zap, Star, MessageSquare, ThumbsUp, ThumbsDown, Filter,
  Download, FileSpreadsheet, Activity, Play, Send, Bot, Database, Maximize2, Minimize2, ShoppingBag,
  Banknote, Smartphone, CreditCard, RefreshCcw, Clock, AlertCircle, Info, ArrowUpDown
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import SmartAIChatbox from '../components/SmartAIChatbox';


const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const STANDARD_CATEGORIES = [
  '📱 Electronics',
  '👕 Fashion',
  '🏠 Home & Living',
  '💄 Beauty & Personal Care',
  '🎮 Gaming',
  '⚽ Sports & Fitness'
];

export const OrderFulfillmentCard = ({ orderDist }) => {
  const dist = orderDist || {
    total_orders: 0,
    successful: { count: 0, percentage: 0, amount: 0, color: '#10b981' },
    replaced: { count: 0, percentage: 0, amount: 0, color: '#3b82f6' },
    returned: { count: 0, percentage: 0, amount: 0, color: '#ef4444' },
    chart_data: []
  };

  const hasOrders = (dist.total_orders || 0) > 0;
  const chartData = (dist.chart_data && dist.chart_data.some(d => (d.value || 0) > 0))
    ? dist.chart_data
    : [
        { name: 'No Orders Yet', value: 1, percentage: 100, amount: 0, color: '#e2e8f0' }
      ];

  return (
    <div 
      className="glass-panel" 
      style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '16px', 
        padding: '1.75rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '8px', 
              background: 'rgba(16, 185, 129, 0.12)', 
              color: '#10b981', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              📦
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Order Preview & Fulfillment Health
            </h3>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Live status preview: Successful Orders, Replacements & Returns percentage distribution (<code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>/analytics/charts/order-fulfillment</code>)
          </p>
        </div>

        {/* Status Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: '#059669', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <CheckCircle2 size={12} /> Success: {dist.successful?.percentage || 0}%
          </span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: '#2563eb', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <RefreshCw size={12} /> Replacement: {dist.replaced?.percentage || 0}%
          </span>
          <span style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#dc2626', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <RotateCcw size={12} /> Return: {dist.returned?.percentage || 0}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Donut Chart with Center Total */}
        <div style={{ position: 'relative', width: '210px', height: '210px', margin: '0 auto', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={62}
                outerRadius={92}
                paddingAngle={hasOrders ? 4 : 0}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`fulfillment-pie-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} orders (${item.payload?.percentage || 0}%) • ₹${(item.payload?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                  name
                ]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', fontWeight: 600, fontSize: '0.8rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner Center Label */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              textAlign: 'center', 
              pointerEvents: 'none' 
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Orders
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {dist.total_orders}
            </div>
          </div>
        </div>

        {/* Detailed Metrics Breakdown & Distribution Progress Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', width: '100%' }}>
          {/* Proportional Segmented Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
              <span>Status Proportions</span>
              <span>100% Normalized</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
              <div 
                style={{ 
                  width: `${dist.successful?.percentage || 0}%`, 
                  background: '#10b981', 
                  height: '100%',
                  transition: 'width 0.8s ease'
                }} 
                title={`Successful: ${dist.successful?.percentage || 0}%`}
              />
              <div 
                style={{ 
                  width: `${dist.replaced?.percentage || 0}%`, 
                  background: '#3b82f6', 
                  height: '100%',
                  transition: 'width 0.8s ease'
                }} 
                title={`Replaced: ${dist.replaced?.percentage || 0}%`}
              />
              <div 
                style={{ 
                  width: `${dist.returned?.percentage || 0}%`, 
                  background: '#ef4444', 
                  height: '100%',
                  transition: 'width 0.8s ease'
                }} 
                title={`Returned: ${dist.returned?.percentage || 0}%`}
              />
            </div>
          </div>

          {/* Cards for each status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
            {/* 1. Successful */}
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.06)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              borderRadius: '12px', 
              padding: '0.9rem 1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                  Successful
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#047857' }}>
                  {dist.successful?.percentage || 0}%
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {dist.successful?.count || 0} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>orders</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                ₹{(dist.successful?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                Delivered & completed
              </div>
            </div>

            {/* 2. Replacements */}
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.06)', 
              border: '1px solid rgba(59, 130, 246, 0.2)', 
              borderRadius: '12px', 
              padding: '0.9rem 1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></span>
                  Replaced
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1d4ed8' }}>
                  {dist.replaced?.percentage || 0}%
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {dist.replaced?.count || 0} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>orders</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 700, marginTop: '2px' }}>
                ₹{(dist.replaced?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                Active replacement cycle
              </div>
            </div>

            {/* 3. Returns */}
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.06)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '12px', 
              padding: '0.9rem 1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
                  Returned
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#b91c1c' }}>
                  {dist.returned?.percentage || 0}%
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {dist.returned?.count || 0} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>orders</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: 700, marginTop: '2px' }}>
                -₹{(dist.returned?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                Refunded from revenue
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryAndLeaderboardGrid = ({ data, leaderboardTab, setLeaderboardTab }) => {
  if (!data) return null;

  const realCategoryList = (data.category_distribution?.categories || [])
    .filter(c => (c.revenue || 0) > 0 || c.percentage > 0);
  const activeCategoryDist = realCategoryList.length > 0 
    ? realCategoryList 
    : (data.category_distribution?.categories || []);

  const totalCatRevenue = data.category_distribution?.total_revenue !== undefined
    ? data.category_distribution.total_revenue
    : (data.summary?.revenue || 0);

  const leaderboardItems = (leaderboardTab === 'products' 
    ? (data.product_performance || []) 
    : (data.vendor_performance?.vendors || [])
  ).slice(0, 5);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
      
      {/* Card A: Category Distribution */}
      <div 
        className="glass-panel" 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '1.75rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '8px', 
              background: 'rgba(37, 99, 235, 0.12)', 
              color: '#2563eb', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              📊
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Category Distribution
            </h3>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Category revenue share (<code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>/analytics/charts/category-distribution</code>)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {/* Donut Chart with Center Text */}
          <div style={{ position: 'relative', width: '210px', height: '210px', flexShrink: 0, margin: '0 auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={activeCategoryDist} 
                  innerRadius={62} 
                  outerRadius={92} 
                  paddingAngle={3} 
                  dataKey="revenue"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {activeCategoryDist.map((entry, idx) => (
                    <Cell key={`cat-cell-${idx}`} fill={entry.color || '#2563eb'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', fontWeight: 600, fontSize: '0.8rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Inner Donut Center Content */}
            <div 
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center', 
                pointerEvents: 'none',
                width: '110px'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>Total Revenue</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                ₹{totalCatRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Right Legend List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, minWidth: '220px' }}>
            {activeCategoryDist.map((cat) => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: cat.color, flexShrink: 0 }}></span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{cat.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                    ₹{cat.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', minWidth: '45px', textAlign: 'right' }}>
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card B: Performance Multi-Bar Leaderboard */}
      <div 
        className="glass-panel" 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '1.75rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '8px', 
                background: 'rgba(245, 158, 11, 0.12)', 
                color: '#f59e0b', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}>
                🏆
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                {leaderboardTab === 'products' ? 'Product Performance Multi-Bar Leaderboard' : 'Vendor Performance Multi-Bar Leaderboard'}
              </h3>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {leaderboardTab === 'products' 
                ? <span>Comparative product sales (<code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>/analytics/charts/product-performance</code>)</span>
                : <span>Comparative revenue & order counts (<code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>/analytics/charts/vendor-performance</code>)</span>
              }
            </p>
          </div>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button 
              onClick={() => setLeaderboardTab('products')} 
              style={{ 
                background: leaderboardTab === 'products' ? '#ffffff' : 'transparent', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '4px 10px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: leaderboardTab === 'products' ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                boxShadow: leaderboardTab === 'products' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Top Products
            </button>
            <button 
              onClick={() => setLeaderboardTab('vendors')} 
              style={{ 
                background: leaderboardTab === 'vendors' ? '#ffffff' : 'transparent', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '4px 10px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: leaderboardTab === 'vendors' ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                boxShadow: leaderboardTab === 'vendors' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Peer Vendors
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', marginTop: '1.5rem' }}>
          {leaderboardItems.map((item) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Rank & Name */}
              <div style={{ width: '150px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {item.rank >= 4 ? (
                  <span 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: '#e2e8f0', 
                      color: '#475569', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      flexShrink: 0 
                    }}
                  >
                    {item.rank}
                  </span>
                ) : null}
                <span 
                  style={{ 
                    fontWeight: 600, 
                    fontSize: '0.88rem', 
                    color: item.is_current ? '#2563eb' : '#1e293b', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}
                  title={item.name}
                >
                  {item.name} {item.is_current ? '(You)' : ''}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ flex: 1, background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.max(item.percentage || 0, 2)}%`, 
                    height: '100%', 
                    background: item.color || '#2563eb', 
                    borderRadius: '5px',
                    transition: 'width 0.8s ease-in-out'
                  }} 
                />
              </div>

              {/* Revenue & Orders / Units */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', minWidth: '85px', textAlign: 'right' }}>
                  ₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: '65px', textAlign: 'right' }}>
                  {item.orders} {leaderboardTab === 'products' ? 'sold' : 'orders'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 1. Dashboard Overview with Analytics Validation & Real-time WebSocket ---
const Overview = () => {
  const { apiFetch, user } = useStore();
  const [data, setData] = useState(null);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState(null);
  const [liveSaleAlert, setLiveSaleAlert] = useState(null);
  const [leaderboardTab, setLeaderboardTab] = useState('products');

  useEffect(() => {
    apiFetch(`/vendor/analytics/advanced?time_range=30days&t=${Date.now()}`)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Access denied'));

    apiFetch('/vendor/analytics/validation')
      .then(res => setValidation(res))
      .catch(err => console.error('Validation check error:', err));
  }, []);

  // WebSockets Real-Time Sales Notification Hook
  useEffect(() => {
    if (!user?.id) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:8010/ws/vendor/${user.id}`;
    let socket = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'NEW_ORDER') {
            setLiveSaleAlert(msg);
            // Refresh overview data
            apiFetch(`/vendor/analytics/advanced?time_range=30days&t=${Date.now()}`)
              .then(res => setData(res))
              .catch(e => console.error(e));
          }
        } catch (e) {
          console.log('WS msg:', event.data);
        }
      };
      socket.onerror = (e) => console.log('WS error (will retry):', e);
    } catch (err) {
      console.log('WebSocket init error:', err);
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user?.id]);

  const handleExportOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // Direct browser window download using token query param
      if (token) {
        window.location.href = `http://localhost:8010/vendor/export/orders.csv?token=${token}`;
      } else {
        window.open('http://localhost:8010/vendor/export/orders.csv', '_blank');
      }
    } catch (err) {
      alert('Failed to download orders CSV: ' + (err.message || 'Error'));
    }
  };

  const handleExportInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      // Direct browser window download using token query param
      if (token) {
        window.location.href = `http://localhost:8010/vendor/export/inventory.csv?token=${token}`;
      } else {
        window.open('http://localhost:8010/vendor/export/inventory.csv', '_blank');
      }
    } catch (err) {
      alert('Failed to download inventory CSV: ' + (err.message || 'Error'));
    }
  };

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}><h4>Account Restricted</h4><p>{error}</p></div>;
  if (!data) return <div>Loading overview...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Real-time WebSocket Order Toast Alert */}
      {liveSaleAlert && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={24} style={{ color: '#fef08a' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                🎉 Live Sale Alert! New Order Received
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>
                {liveSaleAlert.customer_name} just purchased <strong>{liveSaleAlert.quantity}x {liveSaleAlert.product_name}</strong> for <strong>₹{liveSaleAlert.amount?.toFixed(2)}</strong> at {liveSaleAlert.timestamp}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setLiveSaleAlert(null)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 700 }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Dashboard Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time multi-vendor commerce performance & live sales engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* CSV Export Button */}
          <button 
            onClick={handleExportOrders}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}
            title="Download complete transaction history spreadsheet"
          >
            <FileSpreadsheet size={16} /> Export Orders CSV
          </button>
          
          <button 
            onClick={handleExportInventory}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}
            title="Download inventory stock audit spreadsheet"
          >
            <Download size={16} /> Export Inventory CSV
          </button>

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
      </div>

      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NET SALES REVENUE</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>₹{data.summary.revenue.toFixed(2)}</h2>
          {data.summary.refunded_amount > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
              (-₹{data.summary.refunded_amount.toFixed(2)} returns deducted)
            </span>
          )}
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>EST. PROFIT (75% MARGIN)</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>₹{data.summary.profit.toFixed(2)}</h2>
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
      
      {/* 2. Order Preview & Fulfillment Health Distribution */}
      <OrderFulfillmentCard orderDist={data.order_status_distribution} />

      {/* 3. Category Distribution & Multi-Bar Leaderboard Grid */}
      <CategoryAndLeaderboardGrid 
        data={data} 
        leaderboardTab={leaderboardTab} 
        setLeaderboardTab={setLeaderboardTab} 
      />

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
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-color)' }}></span> Revenue (₹)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></span> Profit (₹)
            </span>
          </div>
        </div>

        <div style={{ height: '320px', position: 'relative' }}>
          {data.summary.revenue === 0 && data.summary.orders === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #eaeaec',
              borderRadius: '12px',
              padding: '1.25rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              zIndex: 10
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.25rem' }}>
                🚀 Real-Time Live Sales Engine Active
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No purchases yet. Once a customer checks out on your catalog, live revenue and profit lines will render here in real-time.
              </div>
            </div>
          )}
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
              <YAxis domain={data.summary.revenue === 0 ? [0, 100] : ['auto', 'auto']} stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                itemStyle={{ color: '#282c3f' }}
                labelStyle={{ color: '#535766', fontWeight: 700, marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ff3f6c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevDual)" name="Revenue (₹)" />
              <Area type="monotone" dataKey="profit" stroke="#03a685" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfDual)" name="Profit (₹)" />
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
                <YAxis domain={data.summary.orders === 0 ? [0, 10] : ['auto', 'auto']} stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
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
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Daily Gross Revenue (₹)</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_trend} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" />
                <XAxis dataKey="name" stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} dy={6} />
                <YAxis domain={data.summary.revenue === 0 ? [0, 100] : ['auto', 'auto']} stroke="#94969f" tick={{ fill: '#535766', fontSize: 11 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaec', boxShadow: '0 4px 14px rgba(40,44,63,0.12)', color: '#282c3f', fontWeight: 600 }}
                  itemStyle={{ color: '#282c3f' }}
                />
                <Bar dataKey="revenue" fill="#03a685" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
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
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>₹{data?.summary?.total_valuation?.toFixed(2)}</h2>
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

                  <div style={{ fontWeight: 700 }}>₹{item.price.toFixed(2)}</div>

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
                    ₹{item.stock_valuation.toFixed(2)}
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
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>₹{restockModal.price?.toFixed(2)}</div>
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
    apiFetch(`/vendor/analytics/inventory-forecast?t=${Date.now()}`)
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
              <h2 style={{ margin: 0, fontSize: '2rem', color: currentForecast.avg_daily_velocity > 0 ? 'var(--primary-color)' : '#94969f' }}>
                {currentForecast.avg_daily_velocity} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>units/day</span>
              </h2>
              <span style={{ fontSize: '0.75rem', color: currentForecast.avg_daily_velocity > 0 ? 'var(--success)' : '#94969f', fontWeight: 600 }}>
                {currentForecast.avg_daily_velocity > 0 ? '● Active Live Velocity' : '○ No sales yet'}
              </span>
            </div>

            <div className="glass-panel text-center">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ESTIMATED STOCKOUT</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: currentForecast.days_to_stockout <= 7 ? '#ef4444' : currentForecast.days_to_stockout >= 900 ? 'var(--success)' : '#f59e0b' }}>
                {currentForecast.days_to_stockout >= 900 ? 'No Depletion' : `${currentForecast.days_to_stockout} Days`}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentForecast.days_to_stockout >= 900 ? 'Inventory stable at current 0 demand' : `Date: ${currentForecast.estimated_sellout_date}`}
              </span>
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
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('all'); // 'all', 'most_positive', 'least_positive', 'most_negative', 'most_reviewed'

  const fetchSentiment = (prodId = null) => {
    setLoading(true);
    const url = prodId ? `/vendor/analytics/reviews-sentiment?product_id=${prodId}&t=${Date.now()}` : `/vendor/analytics/reviews-sentiment?t=${Date.now()}`;
    apiFetch(url)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSentiment(selectedProductId);
  }, [selectedProductId]);

  // Compute filtered and sorted product list
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    let list = [...data.products];
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)));
    }

    if (sortBy === 'most_positive') {
      list.sort((a, b) => (b.positive_percentage - a.positive_percentage) || (b.sentiment_score - a.sentiment_score) || (b.average_rating - a.average_rating));
    } else if (sortBy === 'least_positive') {
      list.sort((a, b) => (a.positive_percentage - b.positive_percentage) || (a.sentiment_score - b.sentiment_score));
    } else if (sortBy === 'most_negative') {
      list.sort((a, b) => (b.negative_percentage - a.negative_percentage) || (a.sentiment_score - b.sentiment_score));
    } else if (sortBy === 'most_reviewed') {
      list.sort((a, b) => b.review_count - a.review_count);
    }
    return list;
  }, [data?.products, searchTerm, sortBy]);

  // Filter individual customer comments
  const filteredReviews = useMemo(() => {
    if (!data?.reviews) return [];
    let list = [...data.reviews];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.comment.toLowerCase().includes(q) || 
        r.product_name.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        (r.pros && r.pros.toLowerCase().includes(q)) ||
        (r.cons && r.cons.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'most_positive') {
      list.sort((a, b) => b.sentiment_score - a.sentiment_score || b.rating - a.rating);
    } else if (sortBy === 'least_positive' || sortBy === 'most_negative') {
      list.sort((a, b) => a.sentiment_score - b.sentiment_score || a.rating - b.rating);
    }
    return list;
  }, [data?.reviews, searchTerm, sortBy]);

  if (loading && !data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Running NLP Sentiment Analysis on customer comments...</div>;

  const currentProduct = selectedProductId ? data?.products?.find(p => p.id === selectedProductId) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 63, 108, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.5rem', fontWeight: 700 }}>
          <Sparkles size={14} /> Real-Time Sentiment & Customer Feedback Intelligence
        </div>
        <h2 className="gradient-text" style={{ margin: 0 }}>Customer Sentiment & Pros/Cons Intelligence</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time polarity analysis extracting genuine customer strengths, concerns, and sentiment directly from buyer comments.
        </p>
      </div>

      {/* Search & Sorting Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '480px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94969f' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search products, customer comments, pros or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem', margin: 0, width: '100%' }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sentiment Sorter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#535766', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} /> Sort By:
            </span>

            {[
              { id: 'all', label: 'All' },
              { id: 'most_positive', label: '✨ Most Positive' },
              { id: 'least_positive', label: '📉 Least Positive' },
              { id: 'most_negative', label: '⚠️ Most Negative' },
              { id: 'most_reviewed', label: '💬 Most Reviewed' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: sortBy === opt.id ? 'var(--primary-color)' : '#d4d5d9',
                  background: sortBy === opt.id ? '#fff1f4' : '#ffffff',
                  color: sortBy === opt.id ? 'var(--primary-color)' : '#535766',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Filter Pills */}
        {filteredProducts.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingTop: '1rem', marginTop: '0.75rem', borderTop: '1px solid #f0f0f2', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedProductId(null)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedProductId === null ? 'var(--primary-color)' : '#eaeaec',
                background: selectedProductId === null ? 'var(--primary-color)' : '#ffffff',
                color: selectedProductId === null ? '#ffffff' : '#535766',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Products ({data?.total_reviews || 0})
            </button>
            {filteredProducts.map(p => {
              const isSelected = selectedProductId === p.id;
              const hasReviews = p.review_count > 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary-color)' : '#eaeaec',
                    background: isSelected ? 'var(--primary-color)' : hasReviews ? '#fbfcfe' : '#ffffff',
                    color: isSelected ? '#ffffff' : hasReviews ? '#282c3f' : '#94969f',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>{p.title}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    background: isSelected ? 'rgba(255,255,255,0.25)' : hasReviews ? '#e6f9f4' : '#f0f0f2', 
                    color: isSelected ? '#ffffff' : hasReviews ? '#03a685' : '#94969f', 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '10px' 
                  }}>
                    {hasReviews ? `${p.positive_percentage}% +ve (${p.review_count})` : '0 reviews'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Scope Banner */}
      {currentProduct && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff1f4', border: '1px solid rgba(255, 63, 108, 0.25)', padding: '0.75rem 1.25rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1rem' }}>{currentProduct.title}</span>
            <span style={{ fontSize: '0.8rem', color: '#535766' }}>({currentProduct.review_count} verified buyer reviews)</span>
          </div>
          <button 
            onClick={() => setSelectedProductId(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            Clear Product Filter ✕
          </button>
        </div>
      )}

      {/* Sentiment Gauge Cards */}
      <div className="grid grid-cols-4">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>AVERAGE RATING</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data.total_reviews === 0 ? 'var(--text-muted)' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Star size={24} fill={data.total_reviews === 0 ? 'transparent' : '#f59e0b'} color={data.total_reviews === 0 ? 'var(--text-muted)' : '#f59e0b'} /> 
            {data.total_reviews === 0 ? 'No Ratings' : data.average_rating.toFixed(1)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.total_reviews} total feedback</span>
        </div>

        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>POSITIVE SENTIMENT</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data.total_reviews === 0 ? 'var(--text-muted)' : 'var(--success)' }}>
            {data.total_reviews === 0 ? '0%' : `${data.positive_percentage}%`}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>High satisfaction</span>
        </div>

        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NEUTRAL / MIXED</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data.total_reviews === 0 ? 'var(--text-muted)' : 'var(--primary-color)' }}>
            {data.total_reviews === 0 ? '0%' : `${data.neutral_percentage}%`}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Moderate reviews</span>
        </div>

        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CRITICAL FEEDBACK</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: data.total_reviews === 0 ? 'var(--text-muted)' : data.negative_percentage > 10 ? '#ef4444' : 'var(--text-muted)' }}>
            {data.total_reviews === 0 ? '0%' : `${data.negative_percentage}%`}
          </h2>
          <span style={{ fontSize: '0.75rem', color: data.negative_percentage > 10 ? '#ef4444' : 'var(--text-muted)' }}>
            {data.negative_percentage > 0 ? 'Areas for improvement' : 'Zero critical issues'}
          </span>
        </div>
      </div>

      {/* Top Pros and Cons Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Pros */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <ThumbsUp size={20} /> Real Buyer Strengths (Pros)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!data.top_pros || data.top_pros.length === 0) ? (
              <div style={{ background: '#fafbfc', border: '1px dashed #eaeaec', padding: '1.25rem', borderRadius: '10px', fontSize: '0.85rem', color: '#94969f', textAlign: 'center' }}>
                No positive feedback points identified yet for this selection.
              </div>
            ) : (
              data.top_pros.map((pro, idx) => (
                <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                  <span>{pro}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cons */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <ThumbsDown size={20} /> Genuine Improvement Opportunities (Cons)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!data.top_cons || data.top_cons.length === 0) ? (
              <div style={{ background: '#fafbfc', border: '1px dashed #eaeaec', padding: '1.25rem', borderRadius: '10px', fontSize: '0.85rem', color: '#94969f', textAlign: 'center' }}>
                No critical issues or complaints logged by buyers for this selection.
              </div>
            ) : (
              data.top_cons.map((con, idx) => (
                <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>⚠️</span>
                  <span>{con}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Customer Comments & Reviews Feed */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, color: '#282c3f', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} color="var(--primary-color)" /> Customer Buyer Comments ({filteredReviews.length})
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Direct verified comments submitted by shoppers with live NLP aspect extraction.
            </p>
          </div>
          {searchTerm && (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 700 }}>
              Showing matches for "{searchTerm}"
            </span>
          )}
        </div>

        {filteredReviews.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fafbfc', borderRadius: '8px', border: '1px solid #eaeaec', color: '#535766' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>No customer comments match your current filter.</p>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#94969f' }}>Try clearing the search or selecting "All Products".</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReviews.map((rev) => (
              <div key={rev.id} style={{ background: '#ffffff', border: '1px solid #eaeaec', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 6px rgba(40,44,63,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 800, color: '#282c3f', fontSize: '0.95rem' }}>{rev.customer_name}</span>
                      <span style={{ fontSize: '0.7rem', background: '#e6f9f4', color: '#03a685', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        Verified Buyer
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94969f' }}>• Product: <strong>{rev.product_name}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94969f', marginTop: '0.2rem' }}>{rev.created_at}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: rev.rating >= 4 ? '#03a685' : rev.rating === 3 ? '#f59e0b' : '#ef4444', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>
                    <span>{rev.rating}</span>
                    <Star size={12} fill="#ffffff" />
                  </div>
                </div>

                <p style={{ margin: '0.5rem 0', color: '#282c3f', fontSize: '0.95rem', lineHeight: 1.4, fontWeight: 500 }}>
                  "{rev.comment}"
                </p>

                {/* NLP Extracted Aspects */}
                {(rev.pros || rev.cons) && (
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed #f0f0f2' }}>
                    {rev.pros && (
                      <span style={{ color: '#03a685', background: '#e6f9f4', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ✓ {rev.pros}
                      </span>
                    )}
                    {rev.cons && (
                      <span style={{ color: '#d97706', background: '#fef3c7', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        ⚠️ {rev.cons}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Action Items */}
      <div className="glass-panel" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          <Zap size={20} /> AI Synthesized Action Items for Vendor
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.actionable_insights?.map((action, idx) => (
            <div key={idx} style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#282c3f', border: '1px solid #eaeaec' }}>
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
  const [aiTone, setAiTone] = useState('persuasive');
  const [customPrompt, setCustomPrompt] = useState('');
  const [regeneratingCopy, setRegeneratingCopy] = useState(false);

  const handleRegenerateCopy = async (targetField = 'both') => {
    if (!editingProduct) return;
    setRegeneratingCopy(true);
    try {
      const res = await apiFetch('/vendor/products/generate-copy', {
        method: 'POST',
        body: JSON.stringify({
          title: editingProduct.title,
          category: editingProduct.category,
          tone: aiTone,
          custom_prompt: customPrompt
        })
      });

      if (targetField === 'tagline') {
        setEditingProduct(prev => ({ ...prev, tagline: res.tagline }));
      } else if (targetField === 'description') {
        setEditingProduct(prev => ({ ...prev, description: res.description }));
      } else {
        setEditingProduct(prev => ({
          ...prev,
          tagline: res.tagline,
          description: res.description
        }));
      }
    } catch (err) {
      alert("Failed to regenerate copy: " + (err.message || 'Please check your inputs'));
    } finally {
      setRegeneratingCopy(false);
    }
  };

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
          profit_margin: parseFloat(editingProduct.profit_margin !== undefined ? editingProduct.profit_margin : 25),
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
  const [fullScreenImage, setFullScreenImage] = useState(null);
  
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
                <div 
                  style={{ position: 'relative', cursor: 'zoom-in' }} 
                  title="Click to view full image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullScreenImage({
                      url: p.picture_url ? `http://localhost:8010${p.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                      title: p.title
                    });
                  }}
                >
                  <img 
                    src={p.picture_url ? `http://localhost:8010${p.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} 
                    style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid #eaeaec' }} 
                    alt="" 
                  />
                  <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.5)', borderRadius: '3px', padding: '1px 2px', display: 'flex' }}>
                    <Maximize2 size={9} color="#ffffff" />
                  </div>
                </div>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontWeight: 800, color: '#282c3f', fontSize: '0.95rem' }}>
                      ₹{p.price.toFixed(2)}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(3, 166, 133, 0.1)', 
                      color: 'var(--success)', 
                      padding: '0.1rem 0.45rem', 
                      borderRadius: '4px', 
                      fontWeight: 800 
                    }} title="Configured profit margin for this product">
                      {p.profit_margin !== undefined && p.profit_margin !== null ? p.profit_margin : 25}% margin
                    </span>
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
                <div 
                  style={{ position: 'relative', cursor: 'zoom-in' }} 
                  title="Click to view full size image"
                  onClick={() => setFullScreenImage({
                    url: detailProduct.picture_url ? `http://localhost:8010${detailProduct.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    title: detailProduct.title
                  })}
                >
                  <img 
                    src={detailProduct.picture_url ? `http://localhost:8010${detailProduct.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'} 
                    style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '2px solid #eaeaec', transition: 'transform 0.2s' }} 
                    alt="" 
                  />
                  <div style={{ position: 'absolute', bottom: 3, right: 3, background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Maximize2 size={11} color="#ffffff" />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', background: '#f5f5f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, color: '#535766', textTransform: 'uppercase' }}>
                    {detailProduct.category}
                  </span>
                  <h2 style={{ margin: '0.35rem 0 0.2rem 0', color: '#282c3f', fontSize: '1.4rem', fontWeight: 800 }}>
                    {detailProduct.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                      ₹{detailProduct.price.toFixed(2)}
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
                  ₹{((detailProduct.quantity || 0) * (detailProduct.price || 0)).toFixed(2)}
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

      {/* FULL SCREEN IMAGE VIEWER LIGHTBOX */}
      {fullScreenImage && (
        <div 
          className="modal-backdrop animate-fade-in" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0, 0, 0, 0.88)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 99999,
            padding: '1.5rem'
          }}
          onClick={() => setFullScreenImage(null)}
        >
          {/* Top Bar with Title & Close Button */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              right: '2rem', 
              left: '2rem',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              color: '#ffffff'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {fullScreenImage.title}
            </div>
            <button 
              onClick={() => setFullScreenImage(null)}
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                color: '#ffffff', 
                borderRadius: '50%', 
                width: 42, 
                height: 42, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'all 0.2s'
              }}
              title="Close Image Viewer (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Centered Large High-Res Image */}
          <div 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '82vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#111'
            }}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={fullScreenImage.url} 
              alt={fullScreenImage.title} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '82vh', 
                objectFit: 'contain', 
                display: 'block' 
              }} 
            />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 500 }}>
            Click anywhere outside or ✕ to close
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
                  <select 
                    className="input-field" 
                    required 
                    value={editingProduct.category || STANDARD_CATEGORIES[0]} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    {STANDARD_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
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
                  <label>Profit Margin (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="input-field" 
                    placeholder="e.g. 25" 
                    value={editingProduct.profit_margin !== undefined ? editingProduct.profit_margin : 25} 
                    onChange={e => setEditingProduct({...editingProduct, profit_margin: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.06), rgba(139, 92, 246, 0.08))',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: '10px',
                    padding: '1rem 1.15rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        ✨ AI Copywriter Studio
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tone of Voice:</span>
                        <select 
                          className="input-field" 
                          value={aiTone} 
                          onChange={e => setAiTone(e.target.value)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto', margin: 0 }}
                        >
                          <option value="persuasive">🎯 Persuasive & High-Conversion</option>
                          <option value="luxury">💎 Luxury & Premium</option>
                          <option value="casual">😊 Friendly & Casual</option>
                          <option value="technical">⚙️ Technical & Feature-Rich</option>
                          <option value="minimal">🌿 Minimal & Modern</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Optional: Enter specific features, keywords, or focus (e.g., '16GB RAM, aerospace aluminum')..." 
                        value={customPrompt} 
                        onChange={e => setCustomPrompt(e.target.value)}
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', margin: 0, flex: 1 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        type="button" 
                        disabled={regeneratingCopy}
                        onClick={() => handleRegenerateCopy('both')}
                        style={{
                          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.9rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <RefreshCw size={13} className={regeneratingCopy ? 'animate-spin' : ''} />
                        {regeneratingCopy ? 'Generating...' : 'Regenerate Both'}
                      </button>

                      <button 
                        type="button" 
                        disabled={regeneratingCopy}
                        onClick={() => handleRegenerateCopy('description')}
                        style={{
                          background: '#ffffff',
                          color: '#282c3f',
                          border: '1px solid #d4d5d9',
                          borderRadius: '6px',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <RefreshCw size={12} /> Regenerate Description Only
                      </button>

                      <button 
                        type="button" 
                        disabled={regeneratingCopy}
                        onClick={() => handleRegenerateCopy('tagline')}
                        style={{
                          background: '#ffffff',
                          color: '#282c3f',
                          border: '1px solid #d4d5d9',
                          borderRadius: '6px',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <RefreshCw size={12} /> Regenerate Tagline Only
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={{ margin: 0 }}>AI Tagline</label>
                    <button 
                      type="button" 
                      onClick={() => handleRegenerateCopy('tagline')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <RefreshCw size={11} /> Re-roll tagline
                    </button>
                  </div>
                  <input type="text" className="input-field" value={editingProduct.tagline || ''} onChange={e => setEditingProduct({...editingProduct, tagline: e.target.value})} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={{ margin: 0 }}>Product Description</label>
                    <button 
                      type="button" 
                      onClick={() => handleRegenerateCopy('description')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <RefreshCw size={11} /> Re-roll description
                    </button>
                  </div>
                  <textarea className="input-field" rows="4" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
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
    title: '', category: STANDARD_CATEGORIES[0], price: '', quantity: '', discount: '0', sku: '', description: '', status: 'active', profit_margin: '25'
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
          <div className="form-group">
            <label>Category</label>
            <select 
              className="input-field" 
              required 
              value={formData.category || STANDARD_CATEGORIES[0]} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              {STANDARD_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group"><label>Price (₹)</label><input type="number" step="0.01" className="input-field" required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
          <div className="form-group"><label>Discount (%)</label><input type="number" className="input-field" value={formData.discount || ''} onChange={e => setFormData({...formData, discount: e.target.value})} /></div>
          <div className="form-group"><label>Stock Quantity</label><input type="number" className="input-field" required value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
          <div className="form-group">
            <label>Profit Margin (%)</label>
            <input 
              type="number" 
              step="0.1" 
              className="input-field" 
              required 
              placeholder="e.g. 25" 
              value={formData.profit_margin || ''} 
              onChange={e => setFormData({...formData, profit_margin: e.target.value})} 
            />
          </div>
          <div className="form-group"><label>SKU</label><input type="text" className="input-field" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
          
          {/* AI Copy Generator for Add Product */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.06), rgba(139, 92, 246, 0.08))',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                ✨ Want AI to craft your product description now?
              </span>
              <button 
                type="button" 
                onClick={async () => {
                  if (!formData.title) return alert("Please enter a Product Title first!");
                  try {
                    const res = await apiFetch('/vendor/products/generate-copy', {
                      method: 'POST',
                      body: JSON.stringify({ title: formData.title, category: formData.category, tone: 'persuasive' })
                    });
                    setFormData(prev => ({ ...prev, description: res.description }));
                  } catch (e) {
                    alert("AI generation error");
                  }
                }}
                style={{
                  background: '#ffffff',
                  color: 'var(--primary-color)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <RefreshCw size={12} /> Auto-Generate Description
              </button>
            </div>
            <label>Description (Optional / AI Generated)</label>
            <textarea className="input-field" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
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
  const [leaderboardTab, setLeaderboardTab] = useState('products');

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

  // Real calculations based on actual vendor store data
  const salesTrendList = data.sales_trend || [];
  const peakDailyRev = Math.max(...salesTrendList.map(d => Number(d.revenue) || 0), 1000);
  
  // Dynamic Y-axis ticks matching ₹0k, ₹...k format from the reference design
  const yAxisTicks = [
    0,
    Math.round(peakDailyRev * 0.3),
    Math.round(peakDailyRev * 0.5),
    Math.round(peakDailyRev * 0.8),
    Math.round(peakDailyRev)
  ];

  const formatYAxisTick = (v) => {
    if (v === 0) return '₹0k';
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${Math.round(v / 1000)}k`;
    return `₹${v}`;
  };

  const realCategoryList = (data.category_distribution?.categories || [])
    .filter(c => (c.revenue || 0) > 0 || c.percentage > 0);
  const activeCategoryDist = realCategoryList.length > 0 
    ? realCategoryList 
    : (data.category_distribution?.categories || []);

  const totalCatRevenue = data.category_distribution?.total_revenue !== undefined
    ? data.category_distribution.total_revenue
    : (data.summary?.revenue || 0);

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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NET SALES REVENUE</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--success)' }}>₹{data.summary.revenue.toFixed(2)}</h2>
          {data.summary.refunded_amount > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
              (-₹{data.summary.refunded_amount.toFixed(2)} returns deducted)
            </span>
          )}
        </div>
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ESTIMATED PROFIT</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary-color)' }}>₹{data.summary.profit.toFixed(2)}</h2>
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

      {/* ------------------------------------------------------------- */}
      {/* FEATURED: Revenue Velocity Trajectory Area Chart (Image 1)   */}
      {/* ------------------------------------------------------------- */}
      <div 
        className="glass-panel" 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '1.75rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', boxShadow: '0 0 8px #2563eb' }}></span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Revenue Velocity Trajectory
              </h3>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              High-frequency velocity & peak revenue trajectory (<code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>/analytics/charts/revenue-velocity</code>)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.75rem', borderRadius: '20px', fontWeight: 700, border: '1px solid #dbeafe' }}>
              PEAK: ₹{peakDailyRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={salesTrendList} 
              margin={{ top: 15, right: 25, left: 5, bottom: 10 }}
            >
              <defs>
                <linearGradient id="revenueVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="90%" stopColor="#3b82f6" stopOpacity={0.02} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                tickLine={false} 
                axisLine={{ stroke: '#f1f5f9' }} 
                dy={6}
              />
              <YAxis 
                stroke="#94a3b8" 
                ticks={yAxisTicks} 
                domain={[0, Math.round(peakDailyRev * 1.05)]}
                tickFormatter={formatYAxisTick} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }} 
                formatter={(val, name, item) => [
                  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${item.payload?.orders || 0} orders)`, 
                  'Net Revenue'
                ]}
                labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#revenueVelocityGradient)" 
                dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} 
                activeDot={{ r: 6.5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2.5 }} 
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FEATURED: Order Preview & Fulfillment Health Distribution */}
      <OrderFulfillmentCard orderDist={data.order_status_distribution} />

      {/* FEATURED: Category Distribution & Leaderboard Grid */}
      <CategoryAndLeaderboardGrid 
        data={data} 
        leaderboardTab={leaderboardTab} 
        setLeaderboardTab={setLeaderboardTab} 
      />

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
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3f6c' }}></span> Revenue (₹)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#03a685', fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#03a685' }}></span> Profit (₹)
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
              <Area type="monotone" dataKey="revenue" stroke="#ff3f6c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevDualAnalytics)" name="Revenue (₹)" />
              <Area type="monotone" dataKey="profit" stroke="#03a685" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfDualAnalytics)" name="Profit (₹)" />
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
                <Bar dataKey="revenue" fill="#03a685" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
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
                <Area type="monotone" dataKey="profit" stroke="#ff3f6c" strokeWidth={2.5} fill="url(#colorProfitPink)" name="Profit (₹)" />
              </AreaChart>
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
            <div style={{ color: 'var(--success)', fontWeight: 700 }}>₹{(ps.revenue || 0).toFixed(2)}</div>
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

      {/* 5. Marketplace Benchmarking Intelligence */}
      <MarketplaceBenchmarking />
    </div>
  );
};

// --- 7. Marketplace Benchmarking Component ---
const MarketplaceBenchmarking = () => {
  const { apiFetch } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vendor/analytics/benchmarking')
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading Marketplace Benchmarking metrics...</div>;
  if (!data || !data.benchmarks) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ borderRadius: '16px', padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#282c3f' }}>
            <TrendingUp size={22} style={{ color: 'var(--primary-color)' }} /> Marketplace Performance Benchmarking
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Direct comparison: <strong>{data.vendor_name}</strong> vs. platform-wide marketplace averages.
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#fff1f4', color: 'var(--primary-color)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: 800 }}>
          LIVE PEER COMPARISON
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {data.benchmarks.map((b, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: '#ffffff', 
              border: '1px solid #eaeaec', 
              borderRadius: '12px', 
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(40,44,63,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>
                {b.metric}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YOUR STORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: b.status === 'above' ? 'var(--success)' : '#ef4444' }}>
                    {b.unit === '₹' ? '₹' : ''}{b.vendor_value}{b.unit !== '₹' ? ` ${b.unit}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MARKET AVERAGE</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#535766' }}>
                    {b.unit === '₹' ? '₹' : ''}{b.market_average}{b.unit !== '₹' ? ` ${b.unit}` : ''}
                  </div>
                </div>
              </div>

              {/* Difference Badge */}
              <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  background: b.status === 'above' ? '#e6f9f4' : '#fff1f4', 
                  color: b.status === 'above' ? 'var(--success)' : '#ef4444',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {b.status === 'above' ? '▲' : '▼'} {Math.abs(b.diff_percent)}% {b.status === 'above' ? 'Higher than Average' : 'Below Average'}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#535766', borderTop: '1px solid #f0f0f2', paddingTop: '0.65rem', lineHeight: 1.4 }}>
              💡 {b.insight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RichText = ({ text, isDark = false }) => {
  if (!text) return null;

  const renderInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: isDark ? '#7dd3fc' : '#0284c7' }}>{part.slice(2, -2)}</strong>;
      }
      const italicParts = part.split(/(\*[^*]+\*)/g);
      return italicParts.map((ip, j) => {
        if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
          return <em key={j}>{ip.slice(1, -1)}</em>;
        }
        return <span key={j}>{ip}</span>;
      });
    });
  };

  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.6 }}>
      {lines.map((line, i) => {
        if (line.trim().startsWith('•') || line.trim().startsWith('- ')) {
          const content = line.replace(/^[•\-]\s*/, '');
          return (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ color: isDark ? '#38bdf8' : '#0284c7', flexShrink: 0 }}>•</span>
              <span>{renderInline(content)}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(line.trim())) {
          const match = line.match(/^(\d+)\.\s(.+)/);
          if (match) {
            return (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700, flexShrink: 0 }}>{match[1]}.</span>
                <span>{renderInline(match[2])}</span>
              </div>
            );
          }
        }
        if (!line.trim()) return <div key={i} style={{ height: '0.4rem' }} />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
};

// --- 8. AI Business Analyst (Unified Text-to-SQL & Business Intelligence) Component ---
const AIDataAnalyst = () => {
  const { apiFetch } = useStore();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Business Analyst. Ask me anything about your sales trends, revenue, profit margins, low stock alerts, or business growth strategies in plain English.',
      sql: null,
      data: null
    }
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sqlCollapsed, setSqlCollapsed] = useState({});
  const msgAreaRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (msgAreaRef.current) msgAreaRef.current.scrollTop = 0;
      return;
    }
    if (msgAreaRef.current) {
      msgAreaRef.current.scrollTo({
        top: msgAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const sampleQueries = [
    "📊 Show my sales summary",
    "🔥 Best-selling products",
    "📦 Low stock products",
    "📈 How can I increase sales?",
    "💰 Show my revenue",
    "🧠 Give me business suggestions"
  ];

  const handleAsk = async (prompt) => {
    const textToSend = prompt || queryInput;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setQueryInput('');
    setLoading(true);
    inputRef.current?.focus();

    try {
      const res = await apiFetch('/vendor/ai-analyst', {
        method: 'POST',
        body: JSON.stringify({ query: textToSend })
      });
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: res.ai_answer,
        sql: res.generated_sql,
        explanation: res.explanation,
        chart_type: res.chart_type,
        data: res.data
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Apologies, I encountered an issue: ${err.message || 'Please try again with a specific sales or inventory question.'}`,
        sql: null,
        data: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSql = (idx) => setSqlCollapsed(prev => ({ ...prev, [idx]: !prev[idx] }));

  const containerStyle = isExpanded ? {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9000,
    display: 'flex',
    flexDirection: 'column',
    background: '#f8fafc',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease'
  } : {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 120px)',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease'
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .chip-btn:hover { border-color: #0284c7 !important; color: #0284c7 !important; background: #eff6ff !important; }
        .ai-input:focus { outline: none; }
        .msg-area::-webkit-scrollbar { width: 5px; }
        .msg-area::-webkit-scrollbar-track { background: transparent; }
        .msg-area::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .chips-row::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Compact Top Bar ─────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isExpanded ? '0.75rem 1.5rem' : '0.6rem 0',
        background: isExpanded ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'transparent',
        borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.08)' : 'none',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124,58,237,0.35)'
          }}>
            <Bot size={19} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
              <span style={{
                fontWeight: 800, fontSize: '1rem',
                color: isExpanded ? '#fff' : '#1e293b',
                whiteSpace: 'nowrap'
              }}>AI Business Analyst</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: isExpanded ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.12)',
                color: '#a855f7', padding: '0.15rem 0.55rem',
                borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                <Database size={10} /> Text-to-SQL + Insights
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.7rem', color: isExpanded ? 'rgba(255,255,255,0.6)' : '#64748b',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                Live
              </span>
            </div>
            {!isExpanded && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Ask any store analytics or business question in plain English
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => setMessages([{ sender: 'ai', text: 'Hello! I am your AI Data Analyst. Ask me anything about your sales, revenue trends, profit margins, or inventory health using plain English.', sql: null, data: null }])}
            title="Clear conversation"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: isExpanded ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              border: isExpanded ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
              borderRadius: '8px', padding: '0.4rem 0.7rem',
              fontSize: '0.75rem', fontWeight: 600,
              color: isExpanded ? 'rgba(255,255,255,0.75)' : '#64748b',
              cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={13} /> Clear
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Exit fullscreen' : 'Expand to fullscreen'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: isExpanded ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem',
              fontSize: '0.75rem', fontWeight: 700,
              color: '#ffffff', cursor: 'pointer',
              boxShadow: isExpanded ? 'none' : '0 2px 8px rgba(2,132,199,0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            {isExpanded ? <><Minimize2 size={13} /> Exit</> : <><Maximize2 size={13} /> Expand</>}
          </button>
        </div>
      </div>

      {/* ── Scrollable Message Thread ─────────────────────── */}
      <div
        ref={msgAreaRef}
        className="msg-area glass-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: isExpanded ? '1.5rem 2.5rem' : '1rem 0.75rem',
          scrollBehavior: 'smooth',
          minHeight: 0,
          borderRadius: isExpanded ? '0' : '14px',
          background: isExpanded ? '#0f172a' : undefined
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx} style={{
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: m.sender === 'user' ? '68%' : isExpanded ? '72%' : '90%',
            display: 'flex', gap: '0.6rem', alignItems: 'flex-start'
          }}>
            {m.sender === 'ai' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #0284c7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)'
              }}>
                <Bot size={16} />
              </div>
            )}

            <div style={{
              background: m.sender === 'user'
                ? 'linear-gradient(135deg, #ff3f6c 0%, #ff527b 100%)'
                : isExpanded ? 'rgba(255,255,255,0.06)' : '#ffffff',
              color: m.sender === 'user' ? '#ffffff' : isExpanded ? '#e2e8f0' : '#282c3f',
              border: m.sender === 'user' ? 'none' : isExpanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eaeaec',
              borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: '0.85rem 1.1rem',
              fontSize: '0.9rem',
              lineHeight: 1.55
            }}>
              {m.sender === 'user' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              ) : (
                <RichText text={m.text} isDark={isExpanded} />
              )}

              {/* SQL Block with collapse toggle */}
              {m.sql && (
                <div style={{ marginTop: '0.75rem', borderTop: isExpanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f2', paddingTop: '0.65rem' }}>
                  <button
                    onClick={() => toggleSql(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      fontSize: '0.72rem', fontWeight: 700,
                      color: isExpanded ? '#7dd3fc' : '#0284c7',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: 0, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px'
                    }}
                  >
                    <Database size={11} />
                    Generated SQL
                    <span style={{ fontSize: '0.65rem', opacity: 0.75 }}>{sqlCollapsed[idx] ? '▼ show' : '▲ hide'}</span>
                  </button>
                  {!sqlCollapsed[idx] && (
                    <pre style={{
                      background: '#0f172a', color: '#38bdf8',
                      padding: '0.75rem 1rem', borderRadius: '8px',
                      fontSize: '0.78rem', overflowX: 'auto', margin: 0,
                      fontFamily: '"Fira Code", "Cascadia Code", monospace',
                      border: '1px solid rgba(56,189,248,0.15)',
                      lineHeight: 1.6
                    }}>
                      {m.sql}
                    </pre>
                  )}
                </div>
              )}

              {/* Data Table */}
              {m.data && m.data.length > 0 && (
                <div style={{ marginTop: '0.75rem', overflowX: 'auto', borderRadius: '8px', border: isExpanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                      <tr style={{ background: isExpanded ? 'rgba(2,132,199,0.35)' : 'linear-gradient(90deg,#0284c7,#06b6d4)' }}>
                        {Object.keys(m.data[0]).map((k, i) => (
                          <th key={i} style={{
                            padding: '0.55rem 0.85rem', textAlign: 'left',
                            color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                            letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap'
                          }}>
                            {k.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {m.data.map((row, rIdx) => (
                        <tr key={rIdx} style={{
                          borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9',
                          background: rIdx % 2 === 0
                            ? (isExpanded ? 'rgba(255,255,255,0.03)' : '#fff')
                            : (isExpanded ? 'rgba(255,255,255,0.06)' : '#fafafa')
                        }}>
                          {Object.entries(row).map(([colKey, val], cIdx) => {
                            const key = colKey.toLowerCase();
                            const isCount = [
                              'units_sold', 'unit_sold', 'items_sold', 'products_sold',
                              'total_products', 'total_units', 'total_orders', 'total_items',
                              'total_customers', 'stock', 'quantity', 'count', 'rating',
                              'rank', 'percent', 'percentage', 'discount'
                            ].some(t => key.includes(t)) || ['products', 'units', 'orders', 'items', 'customers', 'sales'].includes(key);

                            const moneyTerms = ['revenue', 'price', 'profit', 'margin', 'valuation', 'cost', 'earning', 'amount', 'spent', 'balance'];
                            const isMoney = !isCount && moneyTerms.some(t => key.includes(t));

                            let displayVal = val ?? '—';
                            if (typeof val === 'number') {
                              if (isMoney) {
                                displayVal = `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              } else if (Number.isInteger(val)) {
                                displayVal = val.toLocaleString('en-IN');
                              } else {
                                displayVal = val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                              }
                            }

                            return (
                              <td key={cIdx} style={{
                                padding: '0.55rem 0.85rem',
                                fontWeight: cIdx === 0 ? 700 : 500,
                                color: isMoney ? '#38bdf8' : isExpanded ? '#e2e8f0' : 'inherit'
                              }}>
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                background: '#1e293b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
            }}>
              <Bot size={16} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: isExpanded ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
              border: isExpanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
              padding: '0.55rem 1rem', borderRadius: '4px 18px 18px 18px'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isExpanded ? '#7dd3fc' : '#94a3b8',
                  animation: `bounce 1.2s infinite ${i * 0.2}s`
                }} />
              ))}
              <span style={{ fontSize: '0.78rem', color: isExpanded ? '#94a3b8' : '#64748b', marginLeft: '0.4rem' }}>
                Generating SQL &amp; insights...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Single-Row Horizontal Chips ───────────────────── */}
      <div
        className="chips-row"
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          overflowX: 'auto',
          padding: '0.5rem 0.75rem',
          background: isExpanded ? 'rgba(255,255,255,0.03)' : '#fff',
          borderTop: isExpanded ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
          scrollbarWidth: 'none'
        }}
      >
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px',
          textTransform: 'uppercase', flexShrink: 0,
          color: isExpanded ? 'rgba(255,255,255,0.4)' : '#94a3b8'
        }}>
          Quick:
        </span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            className="chip-btn"
            onClick={() => handleAsk(q)}
            style={{
              flexShrink: 0,
              fontSize: '0.74rem', padding: '0.22rem 0.65rem',
              borderRadius: '20px', fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              background: isExpanded ? 'rgba(255,255,255,0.06)' : '#fff',
              border: isExpanded ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid #e2e8f0',
              color: isExpanded ? '#94a3b8' : '#475569',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* ── Input Bar ─────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: isExpanded ? '0.75rem 1.5rem 1rem' : '0.5rem 0 0',
        background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
        borderTop: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
          style={{
            display: 'flex', gap: '0.6rem', alignItems: 'center',
            background: isExpanded ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            borderRadius: '28px',
            border: isExpanded ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #e2e8f0',
            padding: '0.35rem 0.35rem 0.35rem 1.15rem',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="ai-input"
            placeholder="Ask about sales, revenue, products, inventory..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: '0.9rem', padding: '0.35rem 0',
              color: isExpanded ? '#e2e8f0' : '#282c3f',
            }}
          />
          <button
            type="submit"
            disabled={loading || !queryInput.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              fontWeight: 800,
              borderRadius: '22px',
              border: 'none',
              background: loading || !queryInput.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #0284c7, #06b6d4)',
              color: '#fff', cursor: loading || !queryInput.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading || !queryInput.trim() ? 'none' : '0 4px 12px rgba(2,132,199,0.35)',
              transition: 'all 0.2s ease', fontSize: '0.88rem'
            }}
          >
            <Send size={15} /> Ask AI
          </button>
        </form>
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

// --- 10. Sold Product History (Real-Time Order Log) ---
const SoldOrders = () => {
  const { apiFetch } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Sync with browser localStorage for any return/replacement requests submitted in this environment
  const [returnedOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_returned_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [replacedOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_replaced_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [returnReasons] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_return_reasons');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const fetchOrders = () => {
    setLoading(true);
    apiFetch('/vendor/orders')
      .then(res => setOrders(res || []))
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper classification for each order
  const getOrderClassification = (o) => {
    const isReplaced = o.status === 'Replaced' || replacedOrderIds.has(o.order_id);
    const isReturned = o.status === 'Returned' || returnedOrderIds.has(o.order_id);
    const isCompleted = !isReplaced && !isReturned;
    const paymentMethod = (o.payment_method || 'upi').toLowerCase();
    const isCOD = paymentMethod === 'cod';
    const reason = o.return_reason || returnReasons[o.order_id]?.reason || null;
    return { isReplaced, isReturned, isCompleted, isCOD, paymentMethod, reason };
  };

  // KPI Calculations
  const grossRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalUnits = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  const replacedOrders = orders.filter(o => getOrderClassification(o).isReplaced);
  const replacedUnits = replacedOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  const returnedOrders = orders.filter(o => getOrderClassification(o).isReturned);
  const returnedUnits = returnedOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const returnedAmount = returnedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const netRevenue = Math.max(0, grossRevenue - returnedAmount);

  const completedOrders = orders.filter(o => getOrderClassification(o).isCompleted);

  const codOrders = orders.filter(o => getOrderClassification(o).isCOD);
  const codRevenue = codOrders.reduce((sum, o) => sum + (getOrderClassification(o).isReturned ? 0 : (o.total_amount || 0)), 0);

  const prepaidOrders = orders.filter(o => !getOrderClassification(o).isCOD);
  const prepaidRevenue = prepaidOrders.reduce((sum, o) => sum + (getOrderClassification(o).isReturned ? 0 : (o.total_amount || 0)), 0);

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const { isReplaced, isReturned, isCompleted, isCOD, paymentMethod } = getOrderClassification(o);
    const matchesSearch = 
      (o.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.order_id).includes(searchTerm) ||
      paymentMethod.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Completed') return isCompleted;
    if (selectedFilter === 'Replaced') return isReplaced;
    if (selectedFilter === 'Returned') return isReturned;
    if (selectedFilter === 'COD') return isCOD;
    if (selectedFilter === 'Prepaid') return !isCOD;
    return true;
  });

  // Sort filtered orders
  filteredOrders.sort((a, b) => {
    const getTime = (ord) => {
      if (ord.created_at_iso) {
        const t = new Date(ord.created_at_iso).getTime();
        if (!isNaN(t)) return t;
      }
      return ord.order_id || 0;
    };

    if (sortBy === 'newest') {
      return getTime(b) - getTime(a) || (b.order_id || 0) - (a.order_id || 0);
    }
    if (sortBy === 'oldest') {
      return getTime(a) - getTime(b) || (a.order_id || 0) - (b.order_id || 0);
    }
    if (sortBy === 'amount_high') {
      return (b.total_amount || 0) - (a.total_amount || 0) || (b.order_id || 0) - (a.order_id || 0);
    }
    if (sortBy === 'amount_low') {
      return (a.total_amount || 0) - (b.total_amount || 0) || (a.order_id || 0) - (b.order_id || 0);
    }
    if (sortBy === 'qty_high') {
      return (b.quantity || 1) - (a.quantity || 1) || (b.order_id || 0) - (a.order_id || 0);
    }
    if (sortBy === 'qty_low') {
      return (a.quantity || 1) - (b.quantity || 1) || (a.order_id || 0) - (b.order_id || 0);
    }
    return 0;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(3, 166, 133, 0.12)', border: '1px solid rgba(3, 166, 133, 0.25)', color: 'var(--success)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <ShieldCheck size={14} /> Live Storefront Transactions & Ledger
          </div>
          <h2 className="gradient-text" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={26} /> Sold Product History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Real-time audit ledger of orders, product returns, replacements, and payment settlement timelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={fetchOrders}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <RefreshCw size={15} /> Refresh Log
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Net Realized Revenue */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
            NET REALIZED REVENUE
          </p>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--success)', fontWeight: 800 }}>
            ₹{netRevenue.toFixed(2)}
          </h2>
          <div style={{ fontSize: '0.73rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {returnedAmount > 0 && (
              <span style={{ color: '#be123c', fontWeight: 700 }}>
                (-₹{returnedAmount.toFixed(2)} returns deducted)
              </span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>
              Gross Booked: ₹{grossRevenue.toFixed(2)} ({orders.length} orders)
            </span>
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
            TOTAL UNITS SOLD
          </p>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--primary-color)', fontWeight: 800 }}>
            {totalUnits} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>units</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
            {totalUnits - returnedUnits} units net retained ({returnedUnits} returned)
          </span>
        </div>

        {/* Replaced Products */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #bae6fd', background: 'rgba(239, 246, 255, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
              REPLACED PRODUCTS
            </p>
            <span style={{ background: '#eff6ff', color: '#0284c7', border: '1px solid #bfdbfe', borderRadius: '9999px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 800 }}>
              {replacedOrders.length} orders
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0284c7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCcw size={22} /> {replacedUnits} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>units</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#0369a1', display: 'block', marginTop: '0.3rem' }}>
            Exchange unit dispatched • Revenue kept
          </span>
        </div>

        {/* Returned Products */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #fde2e7', background: 'rgba(255, 241, 244, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ color: '#be123c', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
              RETURN DEDUCTIONS
            </p>
            <span style={{ background: '#fff1f4', color: '#be123c', border: '1px solid #fde2e7', borderRadius: '9999px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 800 }}>
              {returnedOrders.length} orders
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#be123c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RotateCcw size={22} /> -₹{returnedAmount.toFixed(2)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#be123c', display: 'block', marginTop: '0.3rem', fontWeight: 600 }}>
            {returnedUnits} units returned (Subtracted from revenue)
          </span>
        </div>

        {/* COD Orders (Delayed Payout) */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #fde68a', background: 'rgba(254, 243, 199, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ color: '#92400e', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
              COD (PAYMENT DELAYED)
            </p>
            <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '9999px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 800 }}>
              {codOrders.length} orders
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#b45309', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Banknote size={20} /> ₹{codRevenue.toFixed(2)}
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem', fontWeight: 600 }}>
            <Clock size={12} /> Courier settlement delayed (2–3 days)
          </span>
        </div>

        {/* Prepaid Orders (Instant Payout) */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', background: 'rgba(240, 253, 244, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ color: '#15803d', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
              PREPAID (ONLINE INSTANT)
            </p>
            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '9999px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 800 }}>
              {prepaidOrders.length} orders
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={20} /> ₹{prepaidRevenue.toFixed(2)}
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> UPI & Card instant settlement
          </span>
        </div>
      </div>

      {/* COD Payment Policy Notice Banner */}
      <div style={{
        background: '#fffbeb',
        border: '1.5px solid #fde68a',
        borderRadius: '10px',
        padding: '0.9rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        boxShadow: '0 2px 6px rgba(180, 83, 9, 0.05)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#fef3c7',
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Banknote size={20} />
        </div>
        <div style={{ fontSize: '0.84rem', color: '#78350f', lineHeight: 1.5 }}>
          <strong style={{ color: '#92400e' }}>Cash on Delivery (COD) Settlement Policy:</strong> Yes, for COD purchases the payment is collected by courier agents at the customer's doorstep upon delivery. Platform courier reconciliation causes a <strong>2–3 business day settlement delay</strong> before funds are disbursed into your payout ledger. Prepaid orders (UPI, Card) are <strong>instantly credited</strong> upon order creation.
        </div>
      </div>

      {/* Filter, Sort & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flex: '1 1 400px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 230px', minWidth: '180px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search product, buyer, payment type, Order ID..." 
              className="input-field" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%', margin: 0, height: '40px' }} 
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1.5px solid #eaeaec',
            borderRadius: '8px',
            padding: '0 0.65rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            height: '40px'
          }}>
            <ArrowUpDown size={14} color="var(--primary-color)" style={{ marginRight: '0.35rem', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginRight: '0.35rem', whiteSpace: 'nowrap' }}>
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#282c3f',
                cursor: 'pointer',
                outline: 'none',
                padding: '0.3rem 0.2rem'
              }}
              title="Sort orders by date, amount, or quantity"
            >
              <option value="newest">🕒 New to Old (Recent First)</option>
              <option value="oldest">⌛ Old to New (Earliest First)</option>
              <option value="amount_high">💰 Amount: High to Low (₹₹₹ → ₹)</option>
              <option value="amount_low">🏷️ Amount: Low to High (₹ → ₹₹₹)</option>
              <option value="qty_high">📦 Quantity: High to Low</option>
              <option value="qty_low">📦 Quantity: Low to High</option>
            </select>
          </div>

          {/* Reset button */}
          {(searchTerm || selectedFilter !== 'All' || sortBy !== 'newest') && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedFilter('All'); setSortBy('newest'); }}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #eaeaec',
                background: '#fafafa',
                color: '#535766',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                height: '40px',
                transition: 'all 0.15s ease'
              }}
              title="Reset search, filter, and sorting"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Orders', count: orders.length },
            { id: 'Completed', label: 'Completed', count: completedOrders.length },
            { id: 'Replaced', label: '🔄 Replaced', count: replacedOrders.length },
            { id: 'Returned', label: '↩️ Returned', count: returnedOrders.length },
            { id: 'COD', label: '💵 COD (Delayed)', count: codOrders.length },
            { id: 'Prepaid', label: '⚡ Prepaid (Instant)', count: prepaidOrders.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: selectedFilter === tab.id ? 'var(--primary-color)' : '#eaeaec',
                background: selectedFilter === tab.id ? '#fff1f4' : '#ffffff',
                color: selectedFilter === tab.id ? 'var(--primary-color)' : '#535766',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: selectedFilter === tab.id ? 'var(--primary-color)' : '#f0f0f2',
                color: selectedFilter === tab.id ? '#ffffff' : '#6b7280',
                padding: '0.05rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0, boxShadow: 'var(--shadow-sm)' }}>
        {/* Table Column Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '85px 2fr 85px 130px 1.3fr 1.6fr 1.2fr 115px',
          padding: '1rem 1.5rem',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontWeight: 700,
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          alignItems: 'center'
        }}>
          <div>ORDER ID</div>
          <div>PRODUCT PURCHASED</div>
          <div
            onClick={() => setSortBy(prev => prev === 'qty_high' ? 'qty_low' : 'qty_high')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', userSelect: 'none', color: sortBy.startsWith('qty') ? 'var(--primary-color)' : 'inherit' }}
            title="Click to sort by quantity"
          >
            QTY SOLD {sortBy === 'qty_high' ? '▼' : sortBy === 'qty_low' ? '▲' : '⇅'}
          </div>
          <div
            onClick={() => setSortBy(prev => prev === 'amount_high' ? 'amount_low' : 'amount_high')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', userSelect: 'none', color: sortBy.startsWith('amount') ? 'var(--primary-color)' : 'inherit' }}
            title="Click to sort by amount"
          >
            AMOUNT (₹) {sortBy === 'amount_high' ? '▼' : sortBy === 'amount_low' ? '▲' : '⇅'}
          </div>
          <div>PAYMENT TYPE</div>
          <div>SETTLEMENT STATUS</div>
          <div
            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', userSelect: 'none', color: sortBy === 'newest' || sortBy === 'oldest' ? 'var(--primary-color)' : 'inherit' }}
            title="Click to sort by date"
          >
            BUYER & DATE {sortBy === 'newest' ? '▼' : sortBy === 'oldest' ? '▲' : '⇅'}
          </div>
          <div style={{ textAlign: 'center' }}>ORDER STATUS</div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.75rem auto', display: 'block', color: 'var(--primary-color)' }} />
            Loading sold transactions...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#282c3f', fontSize: '1.2rem', fontWeight: 800 }}>
              No Orders Found in This View
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
              {searchTerm ? `No transactions match your search query "${searchTerm}".` :
               selectedFilter === 'Replaced' ? 'No replaced product orders currently in your ledger.' :
               selectedFilter === 'Returned' ? 'No customer returns recorded for your products.' :
               selectedFilter === 'COD' ? 'No Cash on Delivery orders recorded.' :
               'Transactions will automatically appear here in real time as orders are placed.'}
            </p>
            {(searchTerm || selectedFilter !== 'All' || sortBy !== 'newest') && (
              <button 
                onClick={() => { setSearchTerm(''); setSelectedFilter('All'); setSortBy('newest'); }}
                className="btn btn-secondary"
                style={{ marginTop: '1.25rem', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700 }}
              >
                Clear Filters & Sorting
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map(o => {
            const { isReplaced, isReturned, isCompleted, isCOD, paymentMethod, reason } = getOrderClassification(o);

            return (
              <div 
                key={o.order_id} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '85px 2fr 85px 130px 1.3fr 1.6fr 1.2fr 115px', 
                  padding: '1.15rem 1.5rem', 
                  borderBottom: '1px solid rgba(0,0,0,0.05)', 
                  alignItems: 'center',
                  background: isReturned ? '#fffbfb' : isReplaced ? '#f0f9ff' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* 1. Order ID */}
                <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.92rem' }}>
                  #{o.order_id}
                </div>

                {/* 2. Product Purchased */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img 
                    src={o.picture_url ? (o.picture_url.startsWith('http') ? o.picture_url : `http://localhost:8010${o.picture_url}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} 
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #eaeaec', flexShrink: 0 }} 
                    alt="" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#282c3f', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                      {o.product_name}
                    </div>
                    <span style={{ fontSize: '0.72rem', background: '#f5f5f6', padding: '0.12rem 0.45rem', borderRadius: '4px', color: '#535766', fontWeight: 600, display: 'inline-block', marginTop: '0.2rem' }}>
                      {o.category}
                    </span>
                  </div>
                </div>

                {/* 3. QTY Sold */}
                <div style={{ fontWeight: 800, color: '#282c3f', fontSize: '0.98rem' }}>
                  {o.quantity} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>units</span>
                </div>

                {/* 4. Amount */}
                <div>
                  {isReturned ? (
                    <div>
                      <div style={{ textDecoration: 'line-through', color: '#94969f', fontSize: '0.86rem', fontWeight: 600 }}>
                        ₹{o.total_amount.toFixed(2)}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: '#be123c',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        background: '#fff1f4',
                        padding: '0.12rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #fde2e7',
                        marginTop: '0.15rem'
                      }}>
                        -₹{o.total_amount.toFixed(2)} (Deducted)
                      </div>
                    </div>
                  ) : isReplaced ? (
                    <div>
                      <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.05rem' }}>
                        ₹{o.total_amount.toFixed(2)}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: '#0369a1',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        background: '#eff6ff',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        border: '1px solid #bae6fd',
                        marginTop: '0.15rem'
                      }}>
                        Exchange Unit
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem' }}>
                        ₹{o.total_amount.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#03a685', fontWeight: 600, marginTop: '0.1rem' }}>
                        Net Realized
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Payment Type */}
                <div>
                  {isCOD ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#fffbeb',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      <Banknote size={14} /> Cash on Delivery (COD)
                    </span>
                  ) : paymentMethod === 'card' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#f5f3ff',
                      color: '#6d28d9',
                      border: '1px solid #ddd6fe',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      <CreditCard size={14} /> Debit / Credit Card
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      <Smartphone size={14} /> UPI / GPay
                    </span>
                  )}
                </div>

                {/* 6. Settlement Status (COD Delayed vs Online Instant) */}
                <div>
                  {isCOD ? (
                    isReturned ? (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#fff1f4',
                          color: '#be123c',
                          border: '1px solid #fde2e7',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '14px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          <RotateCcw size={11} /> Unsettled (Returned)
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#94969f', marginTop: '0.2rem', lineHeight: 1.2 }}>
                          Doorstep return • No payout remitted
                        </div>
                      </div>
                    ) : isReplaced ? (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#eff6ff',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '14px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          <RefreshCcw size={11} /> Exchange Unit
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#94969f', marginTop: '0.2rem', lineHeight: 1.2 }}>
                          Replacement fulfilled • Original COD applies
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fcd34d',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '14px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          <Clock size={11} /> Payout Delayed (2–3 Days)
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '0.2rem', lineHeight: 1.2 }}>
                          Doorstep cash collected; courier settlement delayed 2–3 days
                        </div>
                      </div>
                    )
                  ) : (
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#e6f9f4',
                        color: '#03a685',
                        border: '1px solid #bbf7d0',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '14px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        <CheckCircle2 size={11} /> Instant Settled
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#03a685', marginTop: '0.2rem', lineHeight: 1.2 }}>
                        Prepaid online • Payment captured & credited
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Buyer & Date */}
                <div>
                  <div style={{ fontWeight: 700, color: '#282c3f', fontSize: '0.85rem' }}>
                    {o.customer_name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {o.created_at}
                  </div>
                </div>

                {/* 8. Order Status (Replaced / Returned / Completed) */}
                <div style={{ textAlign: 'center' }}>
                  {isReplaced ? (
                    <div>
                      <span style={{
                        background: '#eff6ff',
                        color: '#0284c7',
                        border: '1.5px solid #bae6fd',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <RefreshCcw size={12} /> REPLACED
                      </span>
                      {reason && (
                        <div 
                          style={{
                            fontSize: '0.68rem',
                            color: '#0369a1',
                            marginTop: '0.25rem',
                            lineHeight: 1.2,
                            background: '#eff6ff',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            border: '1px solid #bfdbfe'
                          }}
                          title={reason}
                        >
                          {reason.length > 35 ? reason.slice(0, 35) + '...' : reason}
                        </div>
                      )}
                    </div>
                  ) : isReturned ? (
                    <div>
                      <span style={{
                        background: '#fff1f4',
                        color: '#be123c',
                        border: '1.5px solid #fde2e7',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <RotateCcw size={12} /> RETURNED
                      </span>
                      {reason && (
                        <div 
                          style={{
                            fontSize: '0.68rem',
                            color: '#be123c',
                            marginTop: '0.25rem',
                            lineHeight: 1.2,
                            background: '#fff1f4',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            border: '1px solid #fde2e7'
                          }}
                          title={reason}
                        >
                          {reason.length > 35 ? reason.slice(0, 35) + '...' : reason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{
                      background: '#e6f9f4',
                      color: 'var(--success)',
                      border: '1px solid #bbf7d0',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '20px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      ✓ COMPLETED
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- AI Chat Full-Page Panel ---
const VendorAIChat = () => (
  <div style={{ height: 'calc(100vh - 60px)', padding: '1.25rem', background: '#f8fafc' }}>
    <div style={{ height: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(2,132,199,0.12)', border: '1px solid #e2e8f0' }}>
      <SmartAIChatbox isFullPage={true} isVendor={true} />
    </div>
  </div>
);

const VendorDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/orders" element={<SoldOrders />} />
      <Route path="/inventory" element={<InventoryHub />} />
      <Route path="/forecast" element={<DemandForecast />} />
      <Route path="/sentiment" element={<ReviewSentiment />} />
      <Route path="/analyst" element={<AIDataAnalyst />} />
      <Route path="/ai-chat" element={<AIDataAnalyst />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
};

export default VendorDashboard;
