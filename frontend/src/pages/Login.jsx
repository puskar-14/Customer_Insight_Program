import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Heart, 
  TrendingUp, 
  Brain, 
  BarChart3, 
  Database, 
  Layers, 
  ShoppingBag, 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Users, 
  Zap, 
  LineChart, 
  Clock, 
  X, 
  Check, 
  ChevronRight, 
  Globe, 
  Lock
} from 'lucide-react';

const Login = () => {
  // Modal visibility: null | 'login' | 'register'
  const [authModal, setAuthModal] = useState(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    businessName: '',
    businessCategory: ''
  });
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const { login, register, isLoading, error, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : (user.role === 'vendor' ? '/vendor' : '/'));
    }
  }, [user, navigate]);

  const getPasswordStrength = (pw) => {
    let strength = 0;
    if (pw.length >= 8) strength += 25;
    if (pw.match(/[A-Z]/)) strength += 25;
    if (pw.match(/[0-9]/)) strength += 25;
    if (pw.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(regData.password);
  let strengthColor = 'var(--danger)';
  if (strength >= 50) strengthColor = '#ff905a';
  if (strength >= 75) strengthColor = '#03a685';
  const getPasswordStrengthText = (score) => {
    if (!regData.password) return '';
    if (score < 50) return 'Weak';
    if (score < 100) return 'Moderate';
    return 'Strong';
  };
  const strengthText = getPasswordStrengthText(strength);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authModal === 'login') {
      await login(email, password);
    } else {
      if (regData.password !== regData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      
      const payload = {
        email: regData.email,
        password: regData.password,
        first_name: regData.firstName,
        last_name: regData.lastName,
        phone_number: regData.phone,
        address: regData.address,
        business_name: regData.role === 'vendor' ? regData.businessName : null,
        business_category: regData.role === 'vendor' ? regData.businessCategory : null,
        role: regData.role,
      };
      
      await register(payload);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const response = await fetch('http://localhost:8010/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), new_password: newPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        setForgotMessage(data.message || 'Password reset successfully.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotMessage('');
          setForgotEmail('');
          setNewPassword('');
        }, 2500);
      } else {
        setForgotMessage(`Error: ${data.detail || 'Failed to reset password.'}`);
      }
    } catch (err) {
      setForgotMessage('Error: An error occurred while resetting password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#282c3f', fontFamily: "'Assistant', sans-serif" }}>
      
      {/* 1. TOP STICKY MARKETING NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #eaeaec',
        padding: '0.85rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(40, 44, 63, 0.04)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)', letterSpacing: '-0.5px' }}>
            S
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#282c3f' }}>ShopSense</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', marginLeft: '4px', textTransform: 'uppercase' }}>STUDIO</span>
          </div>
        </div>

        {/* Feature Highlights Menu */}
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem', fontWeight: 700, color: '#535766' }}>
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ff3f6c'} onMouseLeave={e => e.target.style.color = '#535766'}>Platform Features</a>
          <a href="#ai-intelligence" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ff3f6c'} onMouseLeave={e => e.target.style.color = '#535766'}>AI Intelligence</a>
          <a href="#analytics" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ff3f6c'} onMouseLeave={e => e.target.style.color = '#535766'}>Analytics Engine</a>
          <a href="#vendors" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ff3f6c'} onMouseLeave={e => e.target.style.color = '#535766'}>For Sellers</a>
        </div>

        {/* Auth CTA Buttons (Triggers Modal Popups) */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setAuthModal('login')}
            className="btn btn-secondary"
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}
          >
            LOGIN
          </button>
          
          <button 
            onClick={() => setAuthModal('register')}
            className="btn btn-primary"
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              boxShadow: '0 4px 14px rgba(255, 63, 108, 0.35)'
            }}
          >
            SIGN UP FREE
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{
        background: 'linear-gradient(180deg, #fff5f7 0%, #ffffff 100%)',
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            border: '1px solid #fde2e7',
            padding: '0.4rem 1.1rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--primary-color)',
            boxShadow: '0 2px 8px rgba(255, 63, 108, 0.1)',
            marginBottom: '1.75rem'
          }}>
            <Sparkles size={16} /> NEXT-GEN AI E-COMMERCE & MULTI-VENDOR INTELLIGENCE
          </div>

          <h1 style={{
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            color: '#282c3f',
            marginBottom: '1.25rem'
          }}>
            Empowering Modern Retail with <span style={{ color: 'var(--primary-color)' }}>Predictive AI & Real-Time Analytics</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#535766',
            maxWidth: '760px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            From vector-powered semantic recommendations and NLP sentiment pipelines to ARIMA inventory demand forecasting. Experience full-stack commerce engineered for scale.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button 
              onClick={() => setAuthModal('register')}
              className="btn btn-primary"
              style={{
                padding: '0.9rem 2.2rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(255, 63, 108, 0.4)'
              }}
            >
              Get Started Free <ArrowRight size={18} />
            </button>

            <button 
              onClick={() => setAuthModal('login')}
              className="btn btn-secondary"
              style={{
                padding: '0.9rem 2.2rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '8px',
                background: '#ffffff'
              }}
            >
              Seller / Shopper Login
            </button>
          </div>

          {/* Trust stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            boxShadow: '0 8px 30px rgba(40, 44, 63, 0.08)',
            border: '1px solid #eaeaec'
          }}>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>99.9%</h3>
              <p style={{ fontSize: '0.85rem', color: '#535766', fontWeight: 700, margin: '0.2rem 0 0 0', textTransform: 'uppercase' }}>Data Reconciled</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#03a685', margin: 0 }}>30-Day</h3>
              <p style={{ fontSize: '0.85rem', color: '#535766', fontWeight: 700, margin: '0.2rem 0 0 0', textTransform: 'uppercase' }}>ML Demand Forecast</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ff905a', margin: 0 }}>Instant</h3>
              <p style={{ fontSize: '0.85rem', color: '#535766', fontWeight: 700, margin: '0.2rem 0 0 0', textTransform: 'uppercase' }}>Vector Recommendations</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#282c3f', margin: 0 }}>NLP LLM</h3>
              <p style={{ fontSize: '0.85rem', color: '#535766', fontWeight: 700, margin: '0.2rem 0 0 0', textTransform: 'uppercase' }}>Review Sentiment</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURE SHOWCASE GRID */}
      <section id="features" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            ENGINEERED FOR RETAIL SUCCESS
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#282c3f', letterSpacing: '-0.5px' }}>
            Everything You Need To Sell, Scale & Analyze
          </h2>
          <p style={{ color: '#535766', fontSize: '1.05rem', maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
            Built for modern vendors, store administrators, and fashion shoppers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          
          {/* Card 1: Vector Search */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #eaeaec', boxShadow: '0 4px 16px rgba(40,44,63,0.06)', transition: 'transform 0.2s' }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: '#fff1f4', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Brain size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.6rem' }}>Vector Semantic Discovery</h3>
            <p style={{ color: '#535766', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Context-aware neural embeddings matching shopper intent to personalized product rails in real-time.
            </p>
          </div>

          {/* Card 2: ML Demand Forecasting */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #eaeaec', boxShadow: '0 4px 16px rgba(40,44,63,0.06)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: '#e6f9f4', color: '#03a685', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <TrendingUp size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.6rem' }}>ML Time-Series Forecasting</h3>
            <p style={{ color: '#535766', fontSize: '0.95rem', lineHeight: 1.6 }}>
              ARIMA & exponential smoothing models project 30-day stock depletion, safety stock buffers, and reorder alerts.
            </p>
          </div>

          {/* Card 3: NLP Review Sentiment */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #eaeaec', boxShadow: '0 4px 16px rgba(40,44,63,0.06)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: '#fff5ed', color: '#ff905a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Sparkles size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.6rem' }}>NLP Sentiment Extraction</h3>
            <p style={{ color: '#535766', fontSize: '0.95rem', lineHeight: 1.6 }}>
              LLM pipeline summarizes buyer reviews into quantified polarity scores, pros, cons, and vendor action points.
            </p>
          </div>

          {/* Card 4: Multi-Dimensional Analytics */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #eaeaec', boxShadow: '0 4px 16px rgba(40,44,63,0.06)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: '#f5f5f6', color: '#282c3f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BarChart3 size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.6rem' }}>Continuous Analytics Engine</h3>
            <p style={{ color: '#535766', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Full-width order trajectories, dual revenue & profit comparative charts, category doughnut charts, and product pie splits.
            </p>
          </div>

          {/* Card 5: Inventory & Real-Time Restock */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #eaeaec', boxShadow: '0 4px 16px rgba(40,44,63,0.06)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: '#fff1f4', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Layers size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.6rem' }}>Total Stock & Stock Left</h3>
            <p style={{ color: '#535766', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Granular inventory tracking displaying total units registered, units sold, and active stock remaining with 1-click restock modals.
            </p>
          </div>

          {/* Card 6: Customer Segmentation */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #eaeaec', boxShadow: '0 4px 16px rgba(40,44,63,0.06)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: '#e6f9f4', color: '#03a685', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.6rem' }}>SQL Customer Segmentation</h3>
            <p style={{ color: '#535766', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Automated RFM classification categorizing buyers into VIP, Loyal, Potential, and At-Risk tiers for targeted campaign outreach.
            </p>
          </div>

        </div>
      </section>

      {/* 4. CALL TO ACTION FOOTER BANNER */}
      <section style={{
        background: '#282c3f',
        color: '#ffffff',
        padding: '5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to Experience the Future of Multi-Vendor Retail?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#94969f', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Join as a vendor to scale your digital storefront or create a customer account to browse verified collections.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setAuthModal('register')}
              className="btn btn-primary"
              style={{
                padding: '0.9rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '6px'
              }}
            >
              CREATE AN ACCOUNT
            </button>
            <button 
              onClick={() => setAuthModal('login')}
              className="btn btn-secondary"
              style={{
                padding: '0.9rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '6px'
              }}
            >
              LOGIN NOW
            </button>
          </div>
        </div>
      </section>

      {/* 5. POPUP MODAL FOR LOGIN & SIGNUP */}
      {authModal && (
        <div className="modal-backdrop" onClick={() => setAuthModal(null)}>
          <div 
            className="modal-dialog animate-fade-in" 
            style={{ 
              maxWidth: authModal === 'login' ? '420px' : '620px',
              padding: '2.25rem',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setAuthModal(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: '#94969f',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', width: 46, height: 46, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.5rem', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)', marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>
                S
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#282c3f', margin: 0 }}>
                {authModal === 'login' ? 'Login to ShopSense' : 'Create an Account'}
              </h2>
              <p style={{ color: '#535766', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                {authModal === 'login' ? 'Enter your credentials to access your dashboard' : 'Join as a Shopper or Verified Marketplace Seller'}
              </p>
            </div>

            {error && (
              <div style={{ background: '#fff1f4', color: 'var(--danger)', border: '1px solid #fde2e7', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {authModal === 'login' ? (
                <>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="input-field"
                      placeholder="e.g. user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="input-field"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setAuthModal(null);
                        setShowForgotModal(true);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Account Role</label>
                    <select 
                      className="input-field" 
                      value={regData.role} 
                      onChange={e => setRegData({...regData, role: e.target.value})}
                      style={{ fontWeight: 600 }}
                    >
                      <option value="customer">🛍️ Customer (Shopper)</option>
                      <option value="vendor">🏪 Vendor (Seller)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="input-field" required value={regData.firstName} onChange={e => setRegData({...regData, firstName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" className="input-field" required value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="input-field" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input type="tel" className="input-field" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Address (Optional)</label>
                    <input type="text" className="input-field" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} />
                  </div>

                  {regData.role === 'vendor' && (
                    <>
                      <div className="form-group">
                        <label>Business Name</label>
                        <input type="text" className="input-field" required value={regData.businessName} onChange={e => setRegData({...regData, businessName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <input type="text" className="input-field" required value={regData.businessCategory} onChange={e => setRegData({...regData, businessCategory: e.target.value})} />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" minLength="6" className="input-field" required value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                    {regData.password && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: strengthColor, fontWeight: 700, marginBottom: '0.2rem' }}>
                          <span>Security</span>
                          <span>{strengthText}</span>
                        </div>
                        <div style={{ height: '4px', background: '#eaeaec', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${strength}%`, background: strengthColor, transition: 'all 0.3s' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" minLength="6" className="input-field" required value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '0.05em' }} 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (authModal === 'login' ? 'LOGIN' : 'CREATE ACCOUNT')}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#535766' }}>
              {authModal === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setAuthModal(authModal === 'login' ? 'register' : 'login');
                  setRegData({...regData, password: '', confirmPassword: ''});
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '800' }}
              >
                {authModal === 'login' ? 'Create an Account' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-dialog" style={{ padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#282c3f', fontSize: '1.25rem', fontWeight: 800 }}>Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            {forgotMessage && (
              <div style={{ background: forgotMessage.includes('error') ? '#fff1f4' : '#e6f9f4', color: forgotMessage.includes('error') ? 'var(--danger)' : 'var(--success)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Account Email</label>
                <input type="email" className="input-field" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>New Password</label>
                <input type="password" minLength="6" className="input-field" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
