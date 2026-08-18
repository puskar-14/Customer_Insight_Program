import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Store, 
  X, 
  ArrowRight, 
  Star, 
  RefreshCw, 
  ShoppingBag, 
  Zap, 
  Receipt, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Tag,
  User,
  Camera,
  Edit3,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const CustomerDashboard = ({ initialTab = 'shop' }) => {
  const { apiFetch, user } = useStore();
  
  // Navigation Tabs: 'shop' | 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState(initialTab === 'cart' ? 'shop' : initialTab);
  
  // Products & Category State
  const [products, setProducts] = useState([]);
  const [semanticRecs, setSemanticRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Wishlist State (ShopSense feature)
  const [wishlist, setWishlist] = useState([]);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(initialTab === 'cart');
  const [toastMessage, setToastMessage] = useState(null);
  
  // Orders History State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [sentimentFeedback, setSentimentFeedback] = useState(null);
  
  // Checkout State
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Customer Product Details Modal State
  const [detailProduct, setDetailProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const openProductDetails = async (product) => {
    setDetailProduct(product);
    setReviewsLoading(true);
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

  // Customer Profile State
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Fetch products & recommendations from backend
  const fetchProductsAndRecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/shop/products');
      setProducts(data);

      // Fetch vector semantic recommendations
      apiFetch('/shop/recommendations/semantic?query=lifestyle%20fashion%20accessories')
        .then(res => setSemanticRecs(res))
        .catch(e => console.error(e));
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer order history
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await apiFetch('/shop/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndRecs();
    fetchOrders();
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (initialTab === 'cart') {
      setIsCartOpen(true);
      setActiveTab('shop');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      showToast('Removed from Wishlist ❤️');
    } else {
      setWishlist([...wishlist, productId]);
      showToast('Added to Wishlist ❤️');
    }
  };

  // Cart Operations
  const addToCart = (product, openDrawer = false) => {
    let addedItemTitle = product.title;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert(`Only ${product.quantity} items available in stock!`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product_id: product.id,
          title: product.title,
          price: product.price,
          discount: product.discount || 0,
          picture_url: product.picture_url,
          vendor_name: product.vendor_name,
          max_stock: product.quantity,
          quantity: 1,
        },
      ];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      showToast(`Added "${addedItemTitle}" to Bag 🛍️`);
    }
  };

  // Instant Buy Now action
  const handleBuyNow = async (product) => {
    setCheckoutLoading(true);
    try {
      const payload = [{ product_id: product.id, quantity: 1 }];
      const res = await apiFetch('/shop/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setOrderSuccess(res);
      fetchProductsAndRecs();
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.max_stock) {
              alert(`Only ${item.max_stock} units left in stock!`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const getItemPrice = (item) => {
    const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
    return discountedPrice;
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );
  
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Checkout handler
  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      const payload = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const res = await apiFetch('/shop/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setOrderSuccess(res);
      clearCart();
      setIsCartOpen(false);
      fetchProductsAndRecs();
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle Review Submission with LLM Sentiment
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    setReviewSubmitting(true);
    try {
      const res = await apiFetch('/shop/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: reviewModal.product_id || products[0]?.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      setSentimentFeedback(res.sentiment);
      setTimeout(() => {
        setReviewModal(null);
        setSentimentFeedback(null);
        setReviewComment('');
        showToast('Review & AI Sentiment recorded! ⭐');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Handle Customer Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await apiFetch('/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });
      showToast('Profile updated successfully! ✨');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Filter products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#282c3f',
            color: '#ffffff',
            padding: '0.85rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(40,44,63,0.25)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          <CheckCircle2 size={18} style={{ color: 'var(--primary-color)' }} />
          {toastMessage}
        </div>
      )}

      {/* Top ShopSense Header Navigation Bar */}
      <header 
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.75rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* Brand Logo & Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setActiveTab('shop')}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)', letterSpacing: '-0.5px' }}>
              S
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#282c3f' }}>ShopSense</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', marginLeft: '4px', textTransform: 'uppercase' }}>STUDIO</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('shop')}
              style={{
                background: activeTab === 'shop' ? '#fff1f4' : 'transparent',
                color: activeTab === 'shop' ? 'var(--primary-color)' : 'var(--text-main)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Marketplace Store
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                fetchOrders();
              }}
              style={{
                background: activeTab === 'orders' ? '#fff1f4' : 'transparent',
                color: activeTab === 'orders' ? 'var(--primary-color)' : 'var(--text-main)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Orders {orders.length > 0 && `(${orders.length})`}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                background: activeTab === 'profile' ? '#fff1f4' : 'transparent',
                color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-main)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <User size={15} /> Profile
            </button>
          </nav>
        </div>

        {/* Search Bar & Bag CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 320px', maxWidth: '560px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94969f' }} />
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#f5f5f6',
                border: '1px solid transparent',
                borderRadius: '6px',
                padding: '0.65rem 1rem 0.65rem 2.6rem',
                fontSize: '0.9rem',
                color: '#282c3f',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#d4d5d9'; }}
              onBlur={(e) => { e.target.style.background = '#f5f5f6'; e.target.style.borderColor = 'transparent'; }}
            />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: '#fff',
              border: '1px solid #eaeaec',
              borderRadius: '8px',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#282c3f',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
          >
            <ShoppingBag size={18} style={{ color: 'var(--primary-color)' }} />
            <span>Bag</span>
            {totalItemsCount > 0 && (
              <span style={{
                background: 'var(--primary-color)',
                color: '#fff',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* TAB 1: MARKETPLACE STORE */}
      {activeTab === 'shop' && (
        <>
          {/* Promotional Banner (ShopSense style) */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fef4ea 100%)',
              border: '1px solid #fde2e7',
              borderRadius: '12px',
              padding: '2rem 2.5rem',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                <Sparkles size={16} /> Grand Marketplace Carnival • FLAT 10-30% OFF
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#282c3f', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                Welcome, {user?.first_name || 'Shopper'}! Explore Curated Collections.
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                Verified seller products with 100% genuine quality assurance & instant doorstep delivery.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', color: '#535766', fontSize: '0.85rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={20} color="var(--success)" /> 100% Genuine
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={20} color="var(--primary-color)" /> Express Shipping
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={20} color="var(--warning)" /> Best Price Guaranteed
              </div>
            </div>
          </div>

          {/* AI Semantic Recommendations (ShopSense Recommended Rail) */}
          {semanticRecs.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} style={{ color: 'var(--primary-color)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recommended For You <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, marginLeft: '0.5rem' }}>AI CURATED</span>
                  </h3>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Based on your lifestyle preferences</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {semanticRecs.map(rec => (
                  <div 
                    key={rec.id} 
                    onClick={() => openProductDetails(rec)}
                    style={{ 
                      background: '#fafafa', 
                      borderRadius: '8px', 
                      padding: '1.25rem', 
                      border: '1px solid #eaeaec', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', background: '#fff1f4', color: 'var(--primary-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                        {rec.reason}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#ff905a', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                        <Star size={12} fill="#ff905a" /> {rec.rating || 4.5}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#282c3f', marginBottom: '0.25rem' }}>{rec.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>{rec.tagline || rec.category}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #eaeaec' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>${rec.price}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(rec);
                        }} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        + Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills & Catalog Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--primary-color)' : '#d4d5d9',
                    background: selectedCategory === cat ? 'var(--primary-color)' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#282c3f',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              onClick={fetchProductsAndRecs} 
              style={{ background: 'transparent', border: 'none', color: '#535766', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <RefreshCw size={14} /> Refresh Catalog
            </button>
          </div>

          {/* Loading & Empty States */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto', display: 'block', color: 'var(--primary-color)' }} />
              <p style={{ fontWeight: 600 }}>Loading latest products from verified vendors...</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#fff1f4', border: '1px solid #fde2e7', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
              <p style={{ fontWeight: 700 }}>Error: {error}</p>
              <button className="btn btn-primary" onClick={fetchProductsAndRecs} style={{ marginTop: '1rem' }}>Try Again</button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <Package size={48} style={{ color: '#94969f', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#282c3f', marginBottom: '0.5rem' }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try selecting a different category or adjusting your search keyword.</p>
            </div>
          )}

          {/* Product Grid - Pure ShopSense Product Card Style */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                gap: '1.5rem' 
              }}
            >
              {filteredProducts.map((product) => {
                const hasDiscount = product.discount > 0;
                const finalPrice = product.price * (1 - (product.discount || 0) / 100);
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <div 
                    key={product.id}
                    className="animate-fade-in"
                    style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #eaeaec',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    {/* Product Image Box */}
                    <div 
                      onClick={() => openProductDetails(product)}
                      style={{ position: 'relative', width: '100%', height: '280px', background: '#f5f5f6', overflow: 'hidden', cursor: 'pointer' }}
                    >
                      <img
                        src={product.picture_url ? `http://localhost:8010${product.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
                        }}
                      />
                      
                      {/* Wishlist Heart Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                          zIndex: 2
                        }}
                      >
                        <Heart size={16} fill={isWishlisted ? 'var(--primary-color)' : 'none'} color={isWishlisted ? 'var(--primary-color)' : '#282c3f'} />
                      </button>

                      {/* Rating Badge (Bottom Left of Image) */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        left: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#282c3f',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                      }}>
                        {product.rating && product.rating > 0 ? (
                          <>
                            <span>{product.rating.toFixed(1)}</span>
                            <Star size={12} fill="#03a685" color="#03a685" />
                            <span style={{ color: '#94969f', fontWeight: 600 }}>| {product.sales || 0} sold</span>
                          </>
                        ) : (
                          <span style={{ color: '#ff3f6c', fontWeight: 800 }}>★ NEW</span>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Brand / Vendor */}
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#282c3f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
                        {product.vendor_name}
                      </div>

                      {/* Product Title */}
                      <div 
                        onClick={() => openProductDetails(product)}
                        style={{ fontSize: '0.9rem', color: '#535766', marginBottom: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 600 }}
                        title="Click to view full product details & buyer reviews"
                      >
                        {product.title}
                      </div>

                      {/* Price Row (ShopSense Discounted Highlight) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#282c3f' }}>
                          Rs. {Math.round(finalPrice * 80)}
                        </span>
                        
                        {hasDiscount && (
                          <>
                            <span style={{ fontSize: '0.85rem', color: '#94969f', textDecoration: 'line-through' }}>
                              Rs. {Math.round(product.price * 80)}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff905a' }}>
                              ({product.discount}% OFF)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Stocks Left Indicator */}
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        {product.quantity === 0 ? (
                          <span style={{ color: '#ef4444' }}>⚠️ Out of Stock</span>
                        ) : product.quantity <= 5 ? (
                          <span style={{ color: '#ff3f6c', background: '#fff1f4', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            🔥 Only {product.quantity} left in stock!
                          </span>
                        ) : product.quantity <= 15 ? (
                          <span style={{ color: '#ff905a' }}>
                            ⚡ {product.quantity} stocks left
                          </span>
                        ) : (
                          <span style={{ color: '#03a685' }}>
                            ✓ {product.quantity} stocks available
                          </span>
                        )}
                      </div>

                      {/* 2 ShopSense Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        <button
                          onClick={() => addToCart(product, false)}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.55rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Plus size={14} /> Add To Bag
                        </button>

                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={checkoutLoading}
                          className="btn btn-primary"
                          style={{
                            padding: '0.55rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Zap size={14} /> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY ORDERS PAGE */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in" style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#282c3f', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Order History
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                Track past deliveries, view digital invoices, and submit product reviews.
              </p>
            </div>

            <button 
              onClick={fetchOrders}
              style={{ background: 'transparent', border: 'none', color: '#535766', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto', display: 'block', color: 'var(--primary-color)' }} />
              <p style={{ fontWeight: 600 }}>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Receipt size={48} style={{ color: '#94969f', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#282c3f', marginBottom: '0.5rem' }}>No orders placed yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore trending items in the marketplace!</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('shop')}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((ord) => (
                <div 
                  key={ord.id}
                  style={{
                    border: '1px solid #eaeaec',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: '#fafafa'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, color: '#282c3f', fontSize: '1rem' }}>#{ord.id}</span>
                      <span style={{ fontSize: '0.75rem', background: '#e6f9f4', color: 'var(--success)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        DELIVERED
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#282c3f', fontSize: '1.05rem' }}>{ord.product_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sold by: <strong>{ord.vendor_name}</strong> • Qty: {ord.quantity}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94969f', marginTop: '0.25rem' }}>Ordered on: {ord.created_at || 'Recently'}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94969f', fontWeight: 700 }}>TOTAL PAID</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#282c3f' }}>${ord.amount.toFixed(2)}</div>
                    </div>

                    <button
                      onClick={() => setReviewModal(ord)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Star size={14} fill="#ff905a" color="#ff905a" /> Rate & Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMER PROFILE PAGE */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in" style={{ background: '#ffffff', borderRadius: '12px', padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#fff1f4', border: '2px solid var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <User size={40} style={{ color: 'var(--primary-color)' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary-color)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit3 size={13} color="#ffffff" />
              </div>
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#282c3f', fontSize: '1.6rem' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Customer Account'}
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '0.9rem' }}>
                {user?.email} • Member since {user?.joined_date ? new Date(user.joined_date).getFullYear() : '2024'}
              </p>
              <span style={{ fontSize: '0.75rem', background: '#fff1f4', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                SHOPSENSE PRIVILEGE SHOPPER
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileForm.first_name} 
                  onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileForm.last_name} 
                  onChange={e => setProfileForm({...profileForm, last_name: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Registered Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={profileForm.email} 
                  disabled 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  placeholder="Add mobile number for delivery updates"
                  value={profileForm.phone_number} 
                  onChange={e => setProfileForm({...profileForm, phone_number: e.target.value})} 
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Default Delivery Address</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Street address, Apartment, City, State, ZIP code"
                  value={profileForm.address} 
                  onChange={e => setProfileForm({...profileForm, address: e.target.value})} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={profileSaving} 
              className="btn btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.85rem', fontWeight: 800 }}
            >
              {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Review Modal with ShopSense Clean Styling */}
      {reviewModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#282c3f' }}>
                  Review Product
                </h3>
                <p style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 700, margin: '0.25rem 0 0 0' }}>
                  {reviewModal.product_name}
                </p>
              </div>

              <button 
                onClick={() => setReviewModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {sentimentFeedback ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>
                  Sentiment Score: {sentimentFeedback.sentiment_score > 0 ? `+${sentimentFeedback.sentiment_score}` : sentimentFeedback.sentiment_score}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Pros extracted: {sentimentFeedback.pros || 'Positive quality feedback'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#535766', marginBottom: '0.5rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    Rating Score
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: reviewRating >= star ? '#fff5ed' : '#ffffff',
                          border: '1px solid',
                          borderColor: reviewRating >= star ? '#ff905a' : '#d4d5d9',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: reviewRating >= star ? '#ff905a' : '#535766',
                          fontWeight: 700
                        }}
                      >
                        <Star size={16} fill={reviewRating >= star ? '#ff905a' : 'transparent'} /> {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#535766', marginBottom: '0.5rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                    Your Review
                  </label>
                  <textarea
                    rows="3"
                    className="input-field"
                    placeholder="Describe material quality, fitting, and overall satisfaction..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setReviewModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={reviewSubmitting} className="btn btn-primary">
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Slide-out Bag / Cart Drawer */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(40, 44, 63, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div 
            style={{
              width: '100%',
              maxWidth: '420px',
              height: '100%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShoppingBag size={20} style={{ color: 'var(--primary-color)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#282c3f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Shopping Bag ({totalItemsCount})
                </h3>
              </div>
              
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94969f', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Bag Items List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94969f' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem auto' }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#282c3f' }}>Hey, your bag is empty!</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>There is nothing in your bag. Let's add some items.</p>
                </div>
              ) : (
                cart.map((item) => {
                  const finalUnitPrice = getItemPrice(item);
                  const itemSubtotal = finalUnitPrice * item.quantity;

                  return (
                    <div
                      key={item.product_id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: '#fafafa',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        src={item.picture_url ? `http://localhost:8010${item.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                        alt={item.title}
                        style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover' }}
                      />

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#282c3f', marginBottom: '0.2rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#535766', marginBottom: '0.35rem' }}>
                          Seller: {item.vendor_name}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#282c3f' }}>
                          ${finalUnitPrice.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          style={{ background: 'transparent', border: 'none', color: '#94969f', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '4px', border: '1px solid #d4d5d9' }}>
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            style={{ background: 'transparent', border: 'none', color: '#282c3f', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ padding: '0 0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            style={{ background: 'transparent', border: 'none', color: '#282c3f', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                          ${itemSubtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bag Checkout Summary */}
            {cart.length > 0 && (
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>Total MRP</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Convenience Fee</span>
                  <span>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#282c3f' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary-color)' }}>${cartSubtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCartCheckout}
                  disabled={checkoutLoading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(255, 63, 108, 0.35)'
                  }}
                >
                  {checkoutLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {orderSuccess && (
        <div className="modal-backdrop">
          <div 
            className="modal-dialog"
            style={{
              padding: '2.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#e6f9f4',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.4rem' }}>
              Order Placed Successfully! 🎉
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {orderSuccess.message}
            </p>

            <div style={{ background: '#fafafa', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left', border: '1px solid #eaeaec' }}>
              <div style={{ fontSize: '0.8rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Order Summary
              </div>
              {orderSuccess.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem' }}>
                  <span>{item.product} × {item.quantity}</span>
                  <span style={{ fontWeight: 700 }}>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #eaeaec', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-color)' }}>
                <span>Total</span>
                <span>${orderSuccess.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setOrderSuccess(null)}
                className="btn btn-secondary"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setActiveTab('orders');
                  fetchOrders();
                }}
                className="btn btn-primary"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL CUSTOMER PRODUCT DETAILS & RATINGS & REVIEWS MODAL */}
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
                  style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: '1px solid #eaeaec' }} 
                  alt="" 
                />
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#f5f5f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, color: '#535766', textTransform: 'uppercase' }}>
                      {detailProduct.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#fff1f4', color: 'var(--primary-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {detailProduct.vendor_name || 'Verified Brand'}
                    </span>
                  </div>

                  <h2 style={{ margin: '0.2rem 0', color: '#282c3f', fontSize: '1.4rem', fontWeight: 800 }}>
                    {detailProduct.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#282c3f' }}>
                      Rs. {Math.round((detailProduct.price * (1 - (detailProduct.discount || 0) / 100)) * 80)}
                    </span>
                    {detailProduct.discount > 0 && (
                      <>
                        <span style={{ fontSize: '0.9rem', color: '#94969f', textDecoration: 'line-through' }}>
                          Rs. {Math.round(detailProduct.price * 80)}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#ff905a', fontWeight: 700, background: '#fff5ed', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          ({detailProduct.discount}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => setDetailProduct(null)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Product Highlights Row */}
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
                  {detailProduct.sales || 0} total units purchased
                </div>
              </div>

              <div style={{ background: '#fafbfc', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaec' }}>
                <div style={{ fontSize: '0.75rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>AVAILABILITY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: detailProduct.quantity === 0 ? '#ef4444' : detailProduct.quantity <= 5 ? '#ff3f6c' : '#03a685', marginTop: '0.25rem' }}>
                  {detailProduct.quantity === 0 ? 'Out of Stock' : `${detailProduct.quantity} Stocks Left`}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#535766', marginTop: '0.2rem' }}>
                  {detailProduct.quantity <= 5 && detailProduct.quantity > 0 ? '🔥 Selling fast' : '✓ Ready to dispatch'}
                </div>
              </div>

              <div style={{ background: '#fafbfc', padding: '1rem', borderRadius: '8px', border: '1px solid #eaeaec' }}>
                <div style={{ fontSize: '0.75rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>SERVICE PROMISE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#282c3f', marginTop: '0.25rem' }}>
                  100% Genuine
                </div>
                <div style={{ fontSize: '0.75rem', color: '#535766', marginTop: '0.2rem' }}>
                  Free 7-Day Returns
                </div>
              </div>
            </div>

            {/* Product Description & AI Copy */}
            <div style={{ background: '#fff1f4', border: '1px solid #fde2e7', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Product Description & Highlights
              </div>
              <p style={{ margin: 0, color: '#282c3f', fontSize: '0.925rem', lineHeight: 1.5 }}>
                {detailProduct.description || "Premium catalog selection designed with top quality materials and superior comfort."}
              </p>
              {detailProduct.tagline && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#ff905a', fontWeight: 700 }}>
                  ✨ Highlights: "{detailProduct.tagline}"
                </div>
              )}
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => {
                  addToCart(detailProduct, false);
                  showToast(`Added ${detailProduct.title} to Bag 🛍️`);
                }}
                disabled={detailProduct.quantity === 0}
                className="btn btn-secondary"
                style={{ padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ShoppingBag size={18} /> ADD TO BAG
              </button>

              <button
                onClick={() => {
                  setDetailProduct(null);
                  handleBuyNow(detailProduct);
                }}
                disabled={detailProduct.quantity === 0 || checkoutLoading}
                className="btn btn-primary"
                style={{ padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Zap size={18} /> {detailProduct.quantity === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
              </button>
            </div>

            {/* CUSTOMER REVIEWS & RATINGS LIST */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#282c3f', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={18} color="#03a685" fill="#03a685" /> Customer Ratings & Reviews ({productReviews.length})
                </h4>
              </div>

              {reviewsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94969f' }}>Loading verified buyer reviews...</div>
              ) : productReviews.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fafbfc', borderRadius: '8px', border: '1px solid #eaeaec', color: '#535766' }}>
                  <Star size={24} style={{ color: '#ff905a', marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>No reviews submitted yet for this product.</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94969f' }}>
                    Be the first verified customer to purchase and share feedback!
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
