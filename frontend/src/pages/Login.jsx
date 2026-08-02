import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  
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
  if (strength >= 50) strengthColor = 'orange';
  if (strength >= 75) strengthColor = 'var(--primary-color)';
  const getPasswordStrengthText = (score) => {
    if (!regData.password) return '';
    if (score < 50) return 'Weak';
    if (score < 100) return 'Moderate';
    return 'Strong';
  };
  const strengthText = getPasswordStrengthText(strength);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
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
      const response = await fetch('http://localhost:8005/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: forgotEmail, new_password: newPassword })
      });
      const data = await response.json();
      setForgotMessage(data.message || 'Password reset successfully.');
      if (response.ok) {
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotMessage('');
          setForgotEmail('');
          setNewPassword('');
        }, 3000);
      }
    } catch (err) {
      setForgotMessage('An error occurred while resetting password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: isLogin ? '400px' : '600px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }} className="gradient-text">
          {isLogin ? 'Welcome Back' : 'Join Shop Sense'}
        </h2>
        
        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>I want to register as a:</label>
                <select 
                  className="input-field" 
                  value={regData.role} 
                  onChange={e => setRegData({...regData, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor (Seller)</option>
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
                <label>Phone Number (Optional)</label>
                <input type="tel" pattern="[0-9]{10,15}" title="10-15 digit phone number" className="input-field" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address (Optional)</label>
                <input type="text" className="input-field" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} />
              </div>

              {regData.role === 'vendor' && (
                <>
                  <div className="form-group">
                    <label>Business Name (Optional)</label>
                    <input type="text" className="input-field" value={regData.businessName} onChange={e => setRegData({...regData, businessName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Business Category (Optional)</label>
                    <input type="text" className="input-field" value={regData.businessCategory} onChange={e => setRegData({...regData, businessCategory: e.target.value})} />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Password</label>
                <input type="password" minLength="6" className="input-field" required value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                {regData.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: strengthColor, fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Password Strength</span>
                      <span>{strengthText}</span>
                    </div>
                    <div style={{ height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
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
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Register</>)}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setRegData({...regData, password: '', confirmPassword: ''}); // clear passwords
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }}
          >
            {isLogin ? 'Create Account' : 'Login'}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setShowForgotModal(false)}>
          <div className="glass-panel" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Reset Password</h3>
            
            {forgotMessage && (
              <div style={{ background: forgotMessage.includes('error') ? 'var(--danger)' : 'rgba(0, 255, 128, 0.2)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Account Email</label>
                <input type="email" className="input-field" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" minLength="6" className="input-field" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={forgotLoading}>
                {forgotLoading ? 'Resetting...' : 'Update Password'}
              </button>
              <button type="button" className="btn btn-dark" style={{ width: '100%' }} onClick={() => setShowForgotModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
