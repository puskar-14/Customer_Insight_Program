import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import useStore from './store';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import { Box, LogOut, Users, Settings, BarChart2, Package, Activity, PlusCircle, User, Bell, ShoppingBag, Store } from 'lucide-react';

const SidebarLayout = ({ children, role }) => {
  const { clearAuth } = useStore();
  const location = useLocation();

  // Defines the navigation links for the Admin panel.
  const adminNav = [
    { name: 'Vendors Directory', icon: <Users size={18}/>, path: '/admin' },
    { name: 'Vendor Activity', icon: <Activity size={18}/>, path: '/admin/activity' },
    { name: 'All Products', icon: <Package size={18}/>, path: '/admin/products' },
    { name: 'Platform Analytics', icon: <BarChart2 size={18}/>, path: '/admin/analytics' },
    { name: 'Customer Segments', icon: <Users size={18}/>, path: '/admin/segments' },
    { name: 'Stock Health', icon: <Box size={18}/>, path: '/admin/stock-health' },
  ];

  const vendorNav = [
    { name: 'Dashboard Overview', icon: <Box size={18}/>, path: '/vendor' },
    { name: 'Catalog Management', icon: <Package size={18}/>, path: '/vendor/catalog' },
    { name: 'Inventory & Alerts', icon: <Box size={18}/>, path: '/vendor/inventory' },
    { name: 'AI Demand Forecast', icon: <BarChart2 size={18}/>, path: '/vendor/forecast' },
    { name: 'Review Sentiment', icon: <Activity size={18}/>, path: '/vendor/sentiment' },
    { name: 'Add Product', icon: <PlusCircle size={18}/>, path: '/vendor/add-product' },
    { name: 'Analytics Engine', icon: <BarChart2 size={18}/>, path: '/vendor/analytics' },
    { name: 'Notifications', icon: <Bell size={18}/>, path: '/vendor/notifications' },
    { name: 'Vendor Profile', icon: <User size={18}/>, path: '/vendor/profile' },
  ];

  const customerNav = [
    { name: 'Marketplace Store', icon: <Store size={18}/>, path: '/' },
    { name: 'My Orders', icon: <Package size={18}/>, path: '/orders' },
    { name: 'Shopping Bag', icon: <ShoppingBag size={18}/>, path: '/cart' },
    { name: 'Customer Profile', icon: <User size={18}/>, path: '/profile' },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'vendor' ? vendorNav : customerNav;
  const headerTitle = role === 'admin' ? 'ShopSense Admin' : role === 'vendor' ? 'ShopSense Seller' : 'ShopSense Customer';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header text-gradient" style={{ gap: '0.6rem' }}>
          <ShoppingBag size={22} style={{ color: 'var(--primary-color)' }} />
          <span>{headerTitle}</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                {item.icon} {item.name}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="sidebar-item" onClick={clearAuth} style={{ color: 'var(--text-muted)' }}>
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>
      <main className="main-content" style={{ padding: '2rem', width: '100%', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
};

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useStore();
  
  if (!token) return <Navigate to="/login" />;
  if (!user) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (role && role !== 'customer' && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/vendor'} />;
  }
  
  return <SidebarLayout role={user.role}>{children}</SidebarLayout>;
};

function App() {
  const { token, fetchCurrentUser } = useStore();

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token, fetchCurrentUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/*" element={<PrivateRoute role="vendor"><VendorDashboard /></PrivateRoute>} />
        
        {/* Customer Routes */}
        <Route path="/" element={<PrivateRoute role="customer"><CustomerDashboard /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute role="customer"><CustomerDashboard initialTab="orders" /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute role="customer"><CustomerDashboard initialTab="cart" /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute role="customer"><CustomerDashboard initialTab="profile" /></PrivateRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
