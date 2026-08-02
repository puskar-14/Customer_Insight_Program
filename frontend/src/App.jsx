import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import useStore from './store';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import { Box, LogOut, Users, Settings, BarChart2, Package, Activity, PlusCircle, User, Bell } from 'lucide-react';

const SidebarLayout = ({ children, role }) => {
  const { clearAuth } = useStore();
  const location = useLocation();

  // Defines the navigation links for the Admin panel.
  // Add new admin routes here if you expand the dashboard!
  const adminNav = [
    { name: 'Vendors Directory', icon: <Users size={18}/>, path: '/admin' },
    { name: 'Vendor Activity', icon: <Activity size={18}/>, path: '/admin/activity' },
    { name: 'All Products', icon: <Package size={18}/>, path: '/admin/products' },
    { name: 'Platform Analytics', icon: <BarChart2 size={18}/>, path: '/admin/analytics' },
  ];

  const vendorNav = [
    { name: 'Dashboard Overview', icon: <Box size={18}/>, path: '/vendor' },
    { name: 'Catalog Management', icon: <Package size={18}/>, path: '/vendor/catalog' },
    { name: 'Add Product', icon: <PlusCircle size={18}/>, path: '/vendor/add-product' },
    { name: 'Analytics Engine', icon: <BarChart2 size={18}/>, path: '/vendor/analytics' },
    { name: 'Notifications', icon: <Bell size={18}/>, path: '/vendor/notifications' },
    { name: 'Vendor Profile', icon: <User size={18}/>, path: '/vendor/profile' },
  ];

  const navItems = role === 'admin' ? adminNav : vendorNav;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header text-gradient">
          {role === 'admin' ? 'ShopSense Admin' : 'ShopSense Seller'}
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
      <main className="main-content" style={{ padding: '2rem' }}>
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
  
  if (user.role === 'customer') {
    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header text-gradient">ShopSense Customer</div>
          <div style={{ marginTop: 'auto' }}>
            <button className="sidebar-item" onClick={useStore.getState().clearAuth} style={{ color: 'var(--text-muted)' }}>
              <LogOut size={18}/> Logout
            </button>
          </div>
        </aside>
        <main className="main-content" style={{ padding: '2rem' }}>
          {children}
        </main>
      </div>
    );
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
        
        {/* Customer Route (Fallback) */}
        <Route path="/" element={<PrivateRoute role="customer"><div style={{padding:'2rem',textAlign:'center'}}><h2>Customer Dashboard</h2><p>Coming soon...</p></div></PrivateRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
