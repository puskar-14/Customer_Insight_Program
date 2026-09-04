import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Mail,
  Bot,
  MessageSquare,
  Send,
  Maximize2,
  RotateCcw,
  RefreshCcw,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  ArrowLeft,
  ChevronRight,
  Check,
  Lock
} from 'lucide-react';
import SmartAIChatbox from '../components/SmartAIChatbox';


const CustomerDashboard = ({ initialTab = 'shop' }) => {
  const { 
    apiFetch, 
    user, 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    addToCart: storeAddToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  
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
  
  const [toastMessage, setToastMessage] = useState(null);
  const [cartStep, setCartStep] = useState('items'); // 'items' | 'payment'
  
  // Orders History State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  // Order filter / search / sort
  const [orderFilterTab, setOrderFilterTab] = useState('all'); // 'all' | 'active' | 'completed' | 'return' | 'replace'
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSort, setOrderSort] = useState('newest'); // 'newest' | 'oldest' | 'amount_high' | 'amount_low'
  // Track which orders have submitted return / replace requests or confirmed delivery with localStorage persistence
  const [returnedOrderIds, setReturnedOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_returned_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [replacedOrderIds, setReplacedOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_replaced_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [deliveredOrderIds, setDeliveredOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_delivered_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [returnReasons, setReturnReasons] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_return_reasons');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  // Track completed replacements & returns with localStorage persistence
  const [completedReplacementOrderIds, setCompletedReplacementOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_completed_replacements');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [completedReturnOrderIds, setCompletedReturnOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_completed_returns');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  // Tracking order modal
  const [trackingOrder, setTrackingOrder] = useState(null);
  // Invoice modal
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [sentimentFeedback, setSentimentFeedback] = useState(null);
  
  // Checkout State
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Payment Method & Buy Now State
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [buyNowModal, setBuyNowModal] = useState(null); // { product, quantity, paymentMethod }

  // Return / Replace State
  const [returnModal, setReturnModal] = useState(null); // { order, type: 'return'|'replace' }
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(null);

  // Customer Product Details Modal State
  const [detailProduct, setDetailProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

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
    if (location.pathname === '/orders' || initialTab === 'orders') {
      setActiveTab('orders');
      fetchOrders();
    } else if (location.pathname === '/profile' || initialTab === 'profile') {
      setActiveTab('profile');
    } else if (location.pathname === '/cart' || initialTab === 'cart') {
      setIsCartOpen(true);
      setActiveTab('shop');
    } else if (location.pathname === '/' || initialTab === 'shop') {
      if (activeTab !== 'aichat') {
        setActiveTab('shop');
      }
    }
  }, [location.pathname, initialTab]);

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
  const addToCart = (product, openDrawer = true) => {
    if (!product) return;
    setCartStep('items');
    storeAddToCart(product, openDrawer);
    showToast(`Added "${product.title || 'item'}" to Bag 🛍️`);
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setCartStep('items');
    if (location.pathname === '/cart') {
      navigate('/');
    }
  };

  // Instant Buy Now action - opens payment method & order review dialog
  const handleBuyNow = (product) => {
    if (!product || product.quantity === 0) {
      alert('This product is currently out of stock.');
      return;
    }
    setBuyNowModal({
      product,
      quantity: 1,
      paymentMethod: selectedPayment || 'upi'
    });
  };

  // Confirm and place the Buy Now order
  const handleConfirmBuyNow = async () => {
    if (!buyNowModal || !buyNowModal.product) return;
    
    setCheckoutLoading(true);
    try {
      const { product, quantity, paymentMethod } = buyNowModal;
      const payload = [{
        product_id: product.id,
        quantity: quantity || 1,
        payment_method: paymentMethod || 'upi'
      }];

      const res = await apiFetch('/shop/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSelectedPayment(paymentMethod || 'upi');
      setBuyNowModal(null);
      if (detailProduct?.id === product.id) {
        setDetailProduct(null);
      }
      setOrderSuccess({
        ...res,
        payment_method: paymentMethod || 'upi'
      });
      fetchProductsAndRecs();
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
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
        payment_method: selectedPayment || 'upi',
      }));

      const res = await apiFetch('/shop/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setOrderSuccess(res);
      clearCart();
      closeCart();
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
    
    // Accurately locate product_id either directly from order or by title
    const resolvedProductId = reviewModal.product_id || 
      products.find(p => p.title.toLowerCase() === (reviewModal.product_name || '').toLowerCase())?.id;

    try {
      const res = await apiFetch('/shop/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: resolvedProductId,
          product_name: reviewModal.product_name,
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
        fetchProductsAndRecs();
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

  // Handle Return / Replace Request
  const handleReturnRequest = async (e) => {
    e.preventDefault();
    if (!returnModal || !returnReason.trim()) return;
    setReturnSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReturnSubmitting(false);

    const ordId = returnModal.order.id;
    const reqType = returnModal.type; // 'return' | 'replace'
    const reasonText = returnReason;
    const reqId = `${reqType === 'return' ? 'RET' : 'REP'}-${Date.now().toString().slice(-6)}`;

    // Update Set and persist to localStorage
    if (reqType === 'return') {
      setReturnedOrderIds(prev => {
        const next = new Set([...prev, ordId]);
        try { localStorage.setItem('shopsense_returned_orders', JSON.stringify([...next])); } catch {}
        return next;
      });
    } else {
      setReplacedOrderIds(prev => {
        const next = new Set([...prev, ordId]);
        try { localStorage.setItem('shopsense_replaced_orders', JSON.stringify([...next])); } catch {}
        return next;
      });
    }

    // Save reason with timestamp
    setReturnReasons(prev => {
      const next = { ...prev, [ordId]: { type: reqType, reason: reasonText, reqId, date: new Date().toISOString() } };
      try { localStorage.setItem('shopsense_return_reasons', JSON.stringify(next)); } catch {}
      return next;
    });

    // Notify backend and update order status in database
    try {
      await apiFetch(`/shop/orders/${ordId}/return-replace`, {
        method: 'POST',
        body: JSON.stringify({ type: reqType, reason: reasonText })
      });
    } catch (e) {
      console.error('Failed to sync return/replace with backend:', e);
    }

    setReturnSuccess({
      type: reqType,
      order: returnModal.order,
      reason: reasonText,
      reqId
    });
    setReturnModal(null);
    setReturnReason('');
  };

  // Helper: get product image URL for an order
  const getOrderImage = (ord) => {
    if (ord?.picture_url) {
      return ord.picture_url.startsWith('http') ? ord.picture_url : `http://localhost:8010${ord.picture_url}`;
    }
    const matched = products.find(p => p.title?.toLowerCase() === ord?.product_name?.toLowerCase());
    if (matched?.picture_url) {
      return matched.picture_url.startsWith('http') ? matched.picture_url : `http://localhost:8010${matched.picture_url}`;
    }
    return null;
  };

  // Helper: compute delivery date, 7-day window expiry, and current order status
  const getOrderDates = (ord) => {
    let orderDate;
    if (ord?.created_at_iso) {
      orderDate = new Date(ord.created_at_iso);
    } else if (ord?.created_at && ord.created_at !== 'Recently') {
      orderDate = new Date(ord.created_at);
      if (isNaN(orderDate.getTime())) {
        orderDate = new Date(ord.created_at.replace(/(\d+)\s(\w+)\s(\d+)/, '$2 $1, $3'));
      }
    }
    if (!orderDate || isNaN(orderDate?.getTime())) {
      orderDate = new Date();
    }
    const now = new Date();

    // Estimated delivery = order date + 2 days (automatically completes within 2 days)
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 2);

    // 7-day return/replace window starts from delivery date
    const windowExpiry = new Date(deliveryDate);
    windowExpiry.setDate(windowExpiry.getDate() + 7);

    const isManuallyDelivered = deliveredOrderIds.has(ord?.id) || 
      deliveredOrderIds.has(ord?.display_order_id) || 
      deliveredOrderIds.has(ord?.order_group_id) ||
      (ord?.items || []).some(it => deliveredOrderIds.has(it.id));
    const isDelivered = isManuallyDelivered || now >= deliveryDate; // Automatically completes delivery in 2 days
    const isCompleted = isDelivered;
    const isWindowExpired = !isManuallyDelivered && now > windowExpiry;
    const withinWindow = isDelivered && (isManuallyDelivered || now <= windowExpiry);
    const daysLeft = isManuallyDelivered ? 7 : Math.max(0, Math.ceil((windowExpiry - now) / (1000 * 60 * 60 * 24)));
    const daysUntilDelivery = Math.max(0, Math.ceil((deliveryDate - now) / (1000 * 60 * 60 * 24)));

    // ── REPLACEMENT LIFECYCLE ──
    const isReplaced = replacedOrderIds.has(ord?.id) || 
      replacedOrderIds.has(ord?.display_order_id) || 
      ord?.status === 'Replaced' || 
      (ord?.items || []).some(it => replacedOrderIds.has(it.id) || it.status === 'Replaced');
    let replaceDate = null;
    let replaceDeliveryDate = null;
    let isReplacementCompleted = false;
    let daysUntilReplaceDelivery = 0;

    if (isReplaced) {
      let savedReq = returnReasons[ord?.id] || returnReasons[String(ord?.id)] || returnReasons[ord?.display_order_id];
      if (!savedReq && ord?.items) {
        for (const it of ord.items) {
          if (returnReasons[it.id] || returnReasons[String(it.id)]) {
            savedReq = returnReasons[it.id] || returnReasons[String(it.id)];
            break;
          }
        }
      }
      if (savedReq?.date) {
        replaceDate = new Date(savedReq.date);
      }
      if (!replaceDate || isNaN(replaceDate.getTime())) {
        replaceDate = new Date();
      }
      // Replacement delivery SLA: arrives strictly within 2 days after replacement is issued
      replaceDeliveryDate = new Date(replaceDate);
      replaceDeliveryDate.setDate(replaceDeliveryDate.getDate() + 2);

      const isManuallyReplacementCompleted = completedReplacementOrderIds.has(ord?.id) || 
        (ord?.items || []).some(it => completedReplacementOrderIds.has(it.id));
      // Automatically completes replacement 2 days after replacement was issued
      isReplacementCompleted = isManuallyReplacementCompleted || now >= replaceDeliveryDate;
      daysUntilReplaceDelivery = Math.max(0, Math.ceil((replaceDeliveryDate - now) / (1000 * 60 * 60 * 24)));
    }

    // ── RETURN LIFECYCLE ──
    const isReturned = returnedOrderIds.has(ord?.id) || 
      returnedOrderIds.has(ord?.display_order_id) || 
      ord?.status === 'Returned' || 
      (ord?.items || []).some(it => returnedOrderIds.has(it.id) || it.status === 'Returned');
    let returnDate = null;
    let returnRefundDate = null;
    let isReturnCompleted = false;

    if (isReturned) {
      let savedReq = returnReasons[ord?.id] || returnReasons[String(ord?.id)] || returnReasons[ord?.display_order_id];
      if (!savedReq && ord?.items) {
        for (const it of ord.items) {
          if (returnReasons[it.id] || returnReasons[String(it.id)]) {
            savedReq = returnReasons[it.id] || returnReasons[String(it.id)];
            break;
          }
        }
      }
      if (savedReq?.date) {
        returnDate = new Date(savedReq.date);
      }
      if (!returnDate || isNaN(returnDate.getTime())) {
        returnDate = new Date();
      }
      returnRefundDate = new Date(returnDate);
      returnRefundDate.setDate(returnRefundDate.getDate() + 2);

      const isManuallyReturnCompleted = completedReturnOrderIds.has(ord?.id) || 
        (ord?.items || []).some(it => completedReturnOrderIds.has(it.id));
      isReturnCompleted = isManuallyReturnCompleted || now >= returnRefundDate;
    }

    // Compute readable status
    const hoursSinceOrder = (now - orderDate) / (1000 * 60 * 60);
    let orderStatus;
    if (isReplaced) {
      orderStatus = isReplacementCompleted ? 'Replacement Delivered' : 'Replacement Dispatched';
    } else if (isReturned) {
      orderStatus = isReturnCompleted ? 'Refund Credited' : 'Return In Progress';
    } else if (isWindowExpired) {
      orderStatus = 'Completed';
    } else if (isDelivered) {
      orderStatus = 'Delivered';
    } else if (hoursSinceOrder < 6) {
      orderStatus = 'Processing';
    } else if (daysUntilDelivery <= 1) {
      orderStatus = 'Out for Delivery';
    } else {
      orderStatus = 'In Transit';
    }

    return { 
      orderDate, 
      deliveryDate, 
      windowExpiry, 
      isDelivered, 
      isCompleted, 
      withinWindow, 
      daysLeft, 
      daysUntilDelivery, 
      orderStatus,
      isReplaced,
      replaceDate,
      replaceDeliveryDate,
      isReplacementCompleted,
      daysUntilReplaceDelivery,
      isReturned,
      returnDate,
      returnRefundDate,
      isReturnCompleted
    };
  };

  // Invoice print function
  const printInvoice = (ord) => {
    const { orderDate, deliveryDate, isDelivered, orderStatus } = getOrderDates(ord);
    const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const custName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Valued Customer';
    const custAddr = user?.address || 'Registered Delivery Address on File';
    const custEmail = user?.email || 'customer@shopsense.com';
    const custPhone = user?.phone_number || '+91 98765 43210';
    const items = ord.items && ord.items.length > 0 ? ord.items : [ord];
    const totalQty = ord.total_quantity || items.reduce((s, it) => s + (it.quantity || 1), 0);
    const totalAmt = ord.total_amount || ord.amount || items.reduce((s, it) => s + (it.amount || 0), 0);
    const displayId = ord.display_order_id || ord.order_group_id || `#${ord.id}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ShopSense Invoice ${displayId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #282c3f; background: #fff; padding: 2.5rem; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1.5rem; border-bottom: 3px solid #ff3f6c; margin-bottom: 1.5rem; }
    .brand { font-size: 2rem; font-weight: 900; color: #ff3f6c; letter-spacing: -1px; }
    .brand span { color: #282c3f; font-size: 0.9rem; font-weight: 600; display: block; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 1.5rem; font-weight: 800; color: #282c3f; }
    .invoice-title p { color: #94969f; font-size: 0.85rem; margin-top: 0.2rem; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .info-box { background: #fafafa; border: 1px solid #eaeaec; border-radius: 8px; padding: 1rem; }
    .info-box h4 { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: #94969f; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .info-box p { font-size: 0.88rem; color: #282c3f; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    thead tr { background: #282c3f; color: #fff; }
    th { padding: 0.65rem 1rem; font-size: 0.8rem; text-align: left; font-weight: 700; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #eaeaec; font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    .total-row { background: #fff1f4; font-weight: 800; font-size: 1rem; }
    .total-row td { color: #ff3f6c; }
    .policies { margin-top: 1.5rem; background: #f5f5f6; border-radius: 8px; padding: 1rem 1.25rem; }
    .policies h4 { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #535766; margin-bottom: 0.75rem; }
    .policies ul { list-style: none; }
    .policies li { font-size: 0.82rem; color: #535766; padding: 0.3rem 0; }
    .policies li::before { content: '✓  '; color: #03a685; font-weight: 700; }
    .footer { margin-top: 2rem; text-align: center; font-size: 0.78rem; color: #94969f; border-top: 1px solid #eaeaec; padding-top: 1rem; }
    .status-badge { display: inline-block; background: #e6f9f4; color: #03a685; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 800; }
    .status-badge-transit { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 800; }
    @media print { body { padding: 1rem; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ShopSense <span>STUDIO</span></div>
      <p style="font-size:0.8rem;color:#535766;margin-top:0.4rem;">India's Trusted Marketplace</p>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <p>Invoice No: INV-${displayId.replace('#', '')}</p>
      <p>Invoice Date: ${fmtDate(orderDate)}</p>
    </div>
  </div>

  <div class="grid2">
    <div class="info-box">
      <h4>Billed To</h4>
      <p>
        <strong>${custName}</strong><br/>
        ${custAddr}<br/>
        Email: ${custEmail}<br/>
        Phone: ${custPhone}
      </p>
    </div>
    <div class="info-box">
      <h4>Order & Delivery Info</h4>
      <p>
        <strong>Order ID:</strong> ${displayId}<br/>
        <strong>Order Date:</strong> ${fmtDate(orderDate)}<br/>
        <strong>${isDelivered ? 'Delivered On' : 'Expected Delivery'}:</strong> ${fmtDate(deliveryDate)}<br/>
        <strong>Total Items:</strong> ${totalQty} units (${items.length} product${items.length !== 1 ? 's' : ''})<br/>
        <strong>Status:</strong> <span class="${isDelivered ? 'status-badge' : 'status-badge-transit'}">${orderStatus.toUpperCase()}</span><br/>
        <strong>Payment Mode:</strong> ${ord.payment_method === 'cod' ? 'Cash on Delivery (Doorstep Collection)' : ord.payment_method === 'card' ? 'Debit/Credit Card (Online)' : 'UPI / Online Transfer'}<br/>
        <strong>Seller(s):</strong> ${ord.vendor_name || 'Verified Sellers'}
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th>Category</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((it, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${it.product_name}</strong><br/><span style="font-size:0.75rem;color:#6b7280;">Seller: ${it.vendor_name || 'Verified Seller'}</span></td>
          <td>${it.category || 'General Merchandise'}</td>
          <td><strong>${it.quantity}</strong></td>
          <td>₹${(it.amount / it.quantity).toFixed(2)}</td>
          <td>₹${it.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr>
        <td colspan="5" style="text-align:right;font-weight:600;color:#535766;">Doorstep Delivery Charges</td>
        <td style="color:#03a685;font-weight:700;">FREE</td>
      </tr>
      <tr class="total-row">
        <td colspan="5" style="text-align:right;">Grand Total Paid (${totalQty} units across ${items.length} product${items.length !== 1 ? 's' : ''})</td>
        <td>₹${totalAmt.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="policies">
    <h4>📋 ShopSense Customer Policies & Guidelines</h4>
    <ul>
      <li><strong>Guaranteed Delivery:</strong> Orders automatically arrive within 2 business days from order placement.</li>
      <li><strong>7-Day Window:</strong> Free 7-day return and replacement policy applies starting from the confirmed delivery date.</li>
      <li><strong>Doorstep Pickup:</strong> For returns and replacements, reverse pickup is scheduled at your address within 24–48 hours.</li>
      <li><strong>Hassle-Free Refund:</strong> Full refund is credited back to your original payment method within 3–5 business days.</li>
      <li><strong>Replacement Dispatch:</strong> Fresh replacement units are dispatched via express logistics upon pickup.</li>
      <li><strong>Genuine Guarantee:</strong> All products are 100% authentic and covered by verified seller warranty.</li>
      <li><strong>Window Expiry:</strong> Return and replacement requests cannot be accepted after 7 days from the delivery date.</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>Thank you for shopping with ShopSense Studio!</strong></p>
    <p style="margin-top:0.3rem;">This is a computer-generated tax invoice. No signature required. | Need help? Contact support@shopsense.com</p>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert('Please allow popups to download and print your tax invoice.');
    }
  };


  // Standard marketplace categories
  const STANDARD_CATEGORIES = [
    '📱 Electronics',
    '👕 Fashion',
    '🏠 Home & Living',
    '💄 Beauty & Personal Care',
    '🎮 Gaming',
    '⚽ Sports & Fitness'
  ];

  // Filter products: include Standard categories plus any active product categories
  const dynamicCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const combinedCategories = Array.from(new Set([...STANDARD_CATEGORIES, ...dynamicCategories]));
  const categories = ['All', ...combinedCategories];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.vendor_name && p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => { setActiveTab('shop'); navigate('/'); }}>
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
              onClick={() => {
                setActiveTab('shop');
                navigate('/');
              }}
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
                navigate('/orders');
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
              onClick={() => {
                setActiveTab('profile');
                navigate('/profile');
              }}
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
            <button
              onClick={() => setActiveTab('aichat')}
              style={{
                background: activeTab === 'aichat' ? '#eff6ff' : 'transparent',
                color: activeTab === 'aichat' ? '#0284c7' : 'var(--text-main)',
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
              <Bot size={15} /> AI Chat
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
                      <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>₹{rec.price.toFixed(2)}</span>
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

          {/* Dedicated Instant Product Search Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
              <input
                type="text"
                placeholder="Search products by title, category, brand, or vendor (e.g., 'watch', 'laptop', 'sofa')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f5f5f6',
                  border: '1.5px solid transparent',
                  borderRadius: '8px',
                  padding: '0.75rem 2.75rem 0.75rem 2.85rem',
                  fontSize: '0.95rem',
                  color: '#282c3f',
                  outline: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--primary-color)'; }}
                onBlur={(e) => { e.target.style.background = '#f5f5f6'; e.target.style.borderColor = 'transparent'; }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94969f',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {searchTerm && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Showing <strong style={{ color: 'var(--primary-color)' }}>{filteredProducts.length}</strong> result{filteredProducts.length === 1 ? '' : 's'}
                </span>
              )}
              <button 
                onClick={fetchProductsAndRecs} 
                style={{
                  background: '#f5f5f6',
                  border: '1px solid #eaeaec',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  color: '#535766',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={14} /> Refresh Catalog
              </button>
            </div>
          </div>

          {/* Category Filter Pills & Catalog Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.25rem' }}>
                Category:
              </span>
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
                          ₹{finalPrice.toFixed(2)}
                        </span>
                        
                        {hasDiscount && (
                          <>
                            <span style={{ fontSize: '0.85rem', color: '#94969f', textDecoration: 'line-through' }}>
                              ₹{product.price.toFixed(2)}
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
                          onClick={() => addToCart(product, true)}
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
      {activeTab === 'orders' && (() => {
        // --- Compute filtered+sorted order list ---
        const fmtDate = (d) => d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently';
        let visibleOrders = [...orders];

        // Helper classifications for each order
        // Active: orders still delivering within the 2-day delivery window OR ongoing replacements in transit
        const isOrderActive = (o) => {
          const od = getOrderDates(o);
          if (od.isReplaced) return !od.isReplacementCompleted;
          return !od.isDelivered;
        };
        // Completed: all orders whose delivery is complete (>= 2 days), even when return/replace is active!
        const isOrderCompleted = (o) => getOrderDates(o).isDelivered;
        const isOrderReturned = (o) => {
          if (returnedOrderIds.has(o.id) || returnedOrderIds.has(o.display_order_id) || returnedOrderIds.has(o.order_group_id)) return true;
          return (o.items || []).some(it => returnedOrderIds.has(it.id) || it.status === 'Returned');
        };
        const isOrderReplaced = (o) => {
          if (replacedOrderIds.has(o.id) || replacedOrderIds.has(o.display_order_id) || replacedOrderIds.has(o.order_group_id)) return true;
          return (o.items || []).some(it => replacedOrderIds.has(it.id) || it.status === 'Replaced');
        };

        // Filter by tab
        if (orderFilterTab === 'active') {
          visibleOrders = visibleOrders.filter(isOrderActive);
        } else if (orderFilterTab === 'completed') {
          visibleOrders = visibleOrders.filter(isOrderCompleted);
        } else if (orderFilterTab === 'return') {
          visibleOrders = visibleOrders.filter(isOrderReturned);
        } else if (orderFilterTab === 'replace') {
          visibleOrders = visibleOrders.filter(isOrderReplaced);
        }

        // Search
        if (orderSearch.trim()) {
          const q = orderSearch.toLowerCase();
          visibleOrders = visibleOrders.filter(o =>
            (o.product_name || '').toLowerCase().includes(q) ||
            (o.vendor_name || '').toLowerCase().includes(q) ||
            (o.category || '').toLowerCase().includes(q) ||
            String(o.id).includes(q) ||
            String(o.display_order_id || '').toLowerCase().includes(q) ||
            String(o.order_group_id || '').toLowerCase().includes(q) ||
            (o.items || []).some(it =>
              (it.product_name || '').toLowerCase().includes(q) ||
              (it.vendor_name || '').toLowerCase().includes(q) ||
              String(it.id).includes(q)
            )
          );
        }

        // Sort
        if (orderSort === 'newest') {
          visibleOrders.sort((a, b) => {
            const da = getOrderDates(a).orderDate.getTime();
            const db = getOrderDates(b).orderDate.getTime();
            return db - da || b.id - a.id;
          });
        } else if (orderSort === 'oldest') {
          visibleOrders.sort((a, b) => {
            const da = getOrderDates(a).orderDate.getTime();
            const db = getOrderDates(b).orderDate.getTime();
            return da - db || a.id - b.id;
          });
        } else if (orderSort === 'amount_high') {
          visibleOrders.sort((a, b) => (b.total_amount || b.amount) - (a.total_amount || a.amount));
        } else if (orderSort === 'amount_low') {
          visibleOrders.sort((a, b) => (a.total_amount || a.amount) - (b.total_amount || b.amount));
        }

        const FILTER_TABS = [
          { id: 'all', label: '📋 All Orders', count: orders.length },
          { id: 'active', label: '⏳ Active', count: orders.filter(isOrderActive).length },
          { id: 'completed', label: '🏁 Completed', count: orders.filter(isOrderCompleted).length },
          { id: 'return', label: '🔴 Returns', count: orders.filter(isOrderReturned).length },
          { id: 'replace', label: '🔵 Replacements', count: orders.filter(isOrderReplaced).length },
        ];

        return (
          <div className="animate-fade-in" style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#282c3f', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  My Orders
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Track 2-day deliveries, download GST invoices, and manage 7-day returns or replacements.
                </p>
              </div>
              <button onClick={fetchOrders} style={{ background: 'transparent', border: 'none', color: '#535766', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
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
                <button className="btn btn-primary" onClick={() => { setActiveTab('shop'); navigate('/'); }}>Start Shopping</button>
              </div>
            ) : (
              <>
                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {FILTER_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilterTab(tab.id)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '6px',
                        border: `1.5px solid ${orderFilterTab === tab.id ? 'var(--primary-color)' : '#eaeaec'}`,
                        background: orderFilterTab === tab.id ? '#fff1f4' : '#fafafa',
                        color: orderFilterTab === tab.id ? 'var(--primary-color)' : '#535766',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      {tab.label}
                      <span style={{ background: orderFilterTab === tab.id ? 'var(--primary-color)' : '#e0e0e6', color: orderFilterTab === tab.id ? '#fff' : '#535766', borderRadius: '9999px', padding: '0 0.45rem', fontSize: '0.72rem', fontWeight: 800 }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search + Sort Row */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94969f' }} />
                    <input
                      type="text"
                      placeholder="Search by product, seller, category, order ID..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '6px', border: '1.5px solid #eaeaec', fontSize: '0.85rem', outline: 'none', background: '#fafafa', color: '#282c3f' }}
                    />
                  </div>
                  <select
                    value={orderSort}
                    onChange={e => setOrderSort(e.target.value)}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1.5px solid #eaeaec', fontSize: '0.85rem', fontWeight: 600, color: '#282c3f', background: '#fafafa', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="amount_high">Sort: Amount (High → Low)</option>
                    <option value="amount_low">Sort: Amount (Low → High)</option>
                  </select>
                  {(orderSearch || orderFilterTab !== 'all') && (
                    <button onClick={() => { setOrderSearch(''); setOrderFilterTab('all'); }}
                      style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1.5px solid #eaeaec', background: '#fff', color: '#535766', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <X size={12} /> Clear
                    </button>
                  )}
                </div>

                {/* Order Cards */}
                {visibleOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#fafafa', borderRadius: '10px', border: '1px dashed #eaeaec' }}>
                    <Receipt size={42} style={{ opacity: 0.35, marginBottom: '0.85rem', color: 'var(--primary-color)' }} />
                    <p style={{ fontWeight: 800, color: '#282c3f', fontSize: '1.05rem', margin: 0 }}>
                      {orderSearch ? `No orders match "${orderSearch}"` :
                       orderFilterTab === 'active' ? 'No active orders in transit' :
                       orderFilterTab === 'return' ? 'No return requests placed' :
                       orderFilterTab === 'replace' ? 'No replacement requests placed' :
                       orderFilterTab === 'completed' ? 'No completed orders yet' : 'No orders found'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#94969f', marginTop: '0.35rem' }}>
                      {orderSearch ? 'Try checking for typos or clear your search query.' :
                       orderFilterTab === 'active' ? 'All placed orders have safely completed delivery! Explore trending products.' :
                       orderFilterTab === 'return' ? 'You have not submitted any return requests.' :
                       orderFilterTab === 'replace' ? 'You have not submitted any replacement requests.' :
                       'Explore top deals and start shopping today!'}
                    </p>
                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                      {orderSearch || orderFilterTab !== 'all' ? (
                        <button
                          onClick={() => { setOrderSearch(''); setOrderFilterTab('all'); }}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700 }}
                        >
                          View All Orders
                        </button>
                      ) : null}
                      <button
                        onClick={() => { setActiveTab('shop'); navigate('/'); }}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700 }}
                      >
                        Browse Marketplace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {visibleOrders.map((ord) => {
                      const {
                        orderDate,
                        deliveryDate,
                        windowExpiry,
                        isDelivered,
                        isCompleted,
                        withinWindow,
                        daysLeft,
                        daysUntilDelivery,
                        orderStatus,
                        isReplaced,
                        replaceDate,
                        replaceDeliveryDate,
                        isReplacementCompleted,
                        daysUntilReplaceDelivery,
                        isReturned,
                        returnDate,
                        returnRefundDate,
                        isReturnCompleted
                      } = getOrderDates(ord);

                      const items = ord.items && ord.items.length > 0 ? ord.items : [ord];
                      const totalUnits = ord.total_quantity || items.reduce((s, it) => s + (it.quantity || 1), 0);
                      const totalAmount = ord.total_amount || ord.amount || items.reduce((s, it) => s + (it.amount || 0), 0);
                      const displayId = ord.display_order_id || ord.order_group_id || `#${ord.id}`;
                      const hasRequest = isReturned || isReplaced;
                      const reqInfo = returnReasons[ord.id];

                      // Status badge config
                      const statusConfig = {
                        'Processing':             { bg: '#fff7ed', color: '#c2410c', text: '⏳ Processing' },
                        'In Transit':             { bg: '#eff6ff', color: '#1d4ed8', text: '🚛 In Transit' },
                        'Out for Delivery':       { bg: '#fef9c3', color: '#a16207', text: '🛵 Out for Delivery' },
                        'Delivered':              { bg: '#e6f9f4', color: '#03a685', text: '✅ Delivered' },
                        'Completed':              { bg: '#f0fdf4', color: '#16a34a', text: '🏁 Completed' },
                        'Replacement Dispatched': { bg: '#eff6ff', color: '#0284c7', text: '🔵 Replacement Dispatched' },
                        'Replacement Delivered':  { bg: '#f0fdf4', color: '#16a34a', text: '🏁 Replacement Delivered' },
                        'Return In Progress':     { bg: '#fff1f4', color: 'var(--primary-color)', text: '🔴 Return In Progress' },
                        'Refund Credited':        { bg: '#f0fdf4', color: '#16a34a', text: '🏁 Refund Credited' },
                        'Partial Return':         { bg: '#fff1f4', color: '#be123c', text: '↩️ Partial Return' },
                      };
                      const sc = statusConfig[orderStatus] || (isDelivered ? statusConfig['Delivered'] : statusConfig['In Transit']);

                      // Card border/bg based on state
                      const cardBorder = isReturned ? '#fde2e7' : isReplaced ? (isReplacementCompleted ? '#d1fae5' : '#bae6fd') : isCompleted ? '#d1fae5' : '#eaeaec';

                      return (
                        <div
                          key={ord.order_group_id || ord.id}
                          style={{
                            border: `1.5px solid ${cardBorder}`,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            background: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* ── TOP ORDER HEADER BAR ── */}
                          <div style={{
                            background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            padding: '0.9rem 1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.85rem'
                          }}>
                            {/* Left: Master Order ID, Date, Total Units & Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.96rem', letterSpacing: '0.02em' }}>
                                Order {displayId}
                              </span>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                Placed on <strong>{fmtDate(orderDate)}</strong>
                              </span>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span style={{
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '0.15rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                border: '1px solid #e2e8f0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                📦 {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} ({items.length} {items.length === 1 ? 'product' : 'products'})
                              </span>
                              <span style={{ fontSize: '0.74rem', background: sc.bg, color: sc.color, padding: '0.18rem 0.55rem', borderRadius: '4px', fontWeight: 700 }}>
                                {sc.text}
                              </span>
                            </div>

                            {/* Right: Total Amount, Payment Method & Invoice / Track Order */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
                                  ₹{totalAmount.toFixed(2)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', marginTop: '0.1rem' }}>
                                  {ord.payment_method === 'cod' ? (
                                    <span style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.08rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                                      💵 Cash on Delivery
                                    </span>
                                  ) : ord.payment_method === 'card' ? (
                                    <span style={{ color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.08rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                                      💳 Card
                                    </span>
                                  ) : (
                                    <span style={{ color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.08rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                                      ⚡ UPI
                                    </span>
                                  )}
                                  <span style={{ fontSize: '0.7rem', color: '#03a685', fontWeight: 700 }}>• Free Delivery</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                {/* Unified Tax Invoice button */}
                                <button
                                  onClick={() => printInvoice(ord)}
                                  style={{
                                    padding: '0.45rem 0.8rem',
                                    fontSize: '0.78rem',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    background: '#ffffff',
                                    color: '#282c3f',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                  }}
                                  title="Download Complete Tax Invoice for All Items in this Order"
                                >
                                  <Receipt size={13} color="var(--primary-color)" /> Tax Invoice
                                </button>

                                {/* Master Track Package button */}
                                {!isDelivered && (
                                  <button
                                    onClick={() => setTrackingOrder(ord)}
                                    style={{
                                      padding: '0.45rem 0.8rem',
                                      fontSize: '0.78rem',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      background: '#eff6ff',
                                      color: '#1d4ed8',
                                      border: '1px solid #bfdbfe',
                                      cursor: 'pointer',
                                      fontWeight: 700
                                    }}
                                  >
                                    <Truck size={13} /> Track Package
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ── PRODUCT LINE ITEMS IN THIS ORDER ── */}
                          <div style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {items.map((item, itemIdx) => {
                              const itemImg = getOrderImage(item);
                              const isItemReturned = returnedOrderIds.has(item.id) || item.status === 'Returned';
                              const isItemReplaced = replacedOrderIds.has(item.id) || item.status === 'Replaced';
                              const itemReqInfo = returnReasons[item.id] || (hasRequest ? reqInfo : null);

                              return (
                                <div
                                  key={item.id || itemIdx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    paddingTop: itemIdx > 0 ? '1rem' : '0',
                                    borderTop: itemIdx > 0 ? '1px dashed #e2e8f0' : 'none'
                                  }}
                                >
                                  {/* Left: Thumbnail & Details */}
                                  <div style={{ display: 'flex', gap: '0.9rem', flex: '1 1 340px', alignItems: 'flex-start' }}>
                                    <div style={{
                                      width: '72px',
                                      height: '72px',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                    }}>
                                      {itemImg ? (
                                        <img
                                          src={itemImg}
                                          alt={item.product_name}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                      ) : (
                                        <Package size={28} color="#94a3b8" />
                                      )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.98rem' }}>
                                          {item.product_name}
                                        </span>
                                        {item.category && (
                                          <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                                            {item.category}
                                          </span>
                                        )}
                                        {isItemReturned && (
                                          <span style={{ fontSize: '0.7rem', background: '#fff1f4', color: 'var(--primary-color)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                            🔴 Returned
                                          </span>
                                        )}
                                        {isItemReplaced && (
                                          <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#0284c7', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                            🔵 Replaced
                                          </span>
                                        )}
                                      </div>

                                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.35rem' }}>
                                        <strong style={{ color: '#0f172a', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', marginRight: '0.35rem' }}>
                                          Qty: {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                                        </strong>
                                        Unit Price: ₹{(item.amount / item.quantity).toFixed(2)} &nbsp;•&nbsp; Sold by: <strong>{item.vendor_name || 'Verified Seller'}</strong>
                                      </div>

                                      {/* Delivery / Status Dates */}
                                      {isItemReplaced ? (
                                        <div style={{ fontSize: '0.78rem', color: isReplacementCompleted ? '#03a685' : '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                          🔄 <strong>{isReplacementCompleted ? 'Replacement Delivered On:' : 'Replacement Expected:'}</strong> {fmtDate(replaceDeliveryDate)}
                                          {!isReplacementCompleted && (
                                            <span style={{ fontSize: '0.68rem', background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.08rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>
                                              {daysUntilReplaceDelivery > 0 ? `${daysUntilReplaceDelivery} days away` : 'Arriving today'}
                                            </span>
                                          )}
                                        </div>
                                      ) : isItemReturned ? (
                                        <div style={{ fontSize: '0.78rem', color: isReturnCompleted ? '#03a685' : 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                          ↩️ <strong>{isReturnCompleted ? 'Refund Credited On:' : 'Estimated Refund By:'}</strong> {fmtDate(returnRefundDate)}
                                        </div>
                                      ) : (
                                        <div style={{ fontSize: '0.78rem', color: isDelivered ? '#03a685' : '#d97706', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                          🚚 <strong>{isDelivered ? 'Delivered On:' : 'Expected Delivery:'}</strong> {fmtDate(deliveryDate)}
                                          {!isDelivered && daysUntilDelivery > 0 && (
                                            <span style={{ fontSize: '0.68rem', background: '#fef9c3', color: '#a16207', padding: '0.08rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>
                                              {daysUntilDelivery} days away
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {/* Return/Replace Reason Alert */}
                                      {itemReqInfo && (isItemReturned || isItemReplaced) && (
                                        <div style={{
                                          background: isItemReturned ? '#fff1f4' : '#eff6ff',
                                          border: `1px solid ${isItemReturned ? '#fde2e7' : '#bae6fd'}`,
                                          borderRadius: '6px',
                                          padding: '0.4rem 0.65rem',
                                          fontSize: '0.74rem',
                                          color: isItemReturned ? '#be123c' : '#0369a1',
                                          marginTop: '0.35rem',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '0.1rem'
                                        }}>
                                          <div><strong>{isItemReturned ? 'Return' : 'Replacement'} Reason:</strong> {itemReqInfo.reason}</div>
                                          <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                            📦 Doorstep reverse pickup scheduled within 24–48 hours from your address.
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Item Subtotal & Action Buttons */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                    <div style={{ textAlign: 'right' }}>
                                      <div style={{ fontSize: '0.7rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>Subtotal</div>
                                      <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>₹{item.amount.toFixed(2)}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                      {/* Rate & Review */}
                                      {isDelivered && (
                                        <button
                                          onClick={() => setReviewModal(item)}
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        >
                                          <Star size={12} fill="#ff905a" color="#ff905a" /> Review
                                        </button>
                                      )}

                                      {/* Track Return */}
                                      {isItemReturned && (
                                        <button
                                          onClick={() => setTrackingOrder({ ...item, trackingType: 'return' })}
                                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px', background: '#fff1f4', color: 'var(--primary-color)', border: '1px solid #fde2e7', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          title="Track Return & Refund status"
                                        >
                                          <Truck size={12} /> Track Return
                                        </button>
                                      )}

                                      {/* Track Replacement */}
                                      {isItemReplaced && (
                                        <button
                                          onClick={() => setTrackingOrder({ ...item, trackingType: 'replace' })}
                                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px', background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          title="Track Replacement dispatch status"
                                        >
                                          <Truck size={12} /> Track Replacement
                                        </button>
                                      )}

                                      {/* Replace Button for this item */}
                                      {!isItemReplaced && !isItemReturned && withinWindow && (
                                        <button
                                          onClick={() => { setReturnModal({ order: item, type: 'replace' }); setReturnReason(''); }}
                                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px', background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          title={`Request replacement for ${item.product_name}`}
                                        >
                                          <RefreshCcw size={12} /> Replace ({item.quantity})
                                        </button>
                                      )}

                                      {/* Return Button for this item */}
                                      {!isItemReturned && !isItemReplaced && withinWindow && (
                                        <button
                                          onClick={() => { setReturnModal({ order: item, type: 'return' }); setReturnReason(''); }}
                                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px', background: '#fff1f4', color: 'var(--primary-color)', border: '1px solid #fde2e7', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                          title={`Request return and refund for ${item.product_name}`}
                                        >
                                          <RotateCcw size={12} /> Return ({item.quantity})
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}


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

      {/* TAB 4: AI CHAT */}
      {activeTab === 'aichat' && (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 160px)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(2,132,199,0.1)', border: '1px solid #e2e8f0' }}>
          <SmartAIChatbox isFullPage={true} isVendor={false} />
        </div>
      )}

      {/* Slide-out Bag / Cart Drawer with 2-Step Checkout Flow */}
      {isCartOpen && (
        <div 
          onClick={closeCart}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 100000,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '1.2rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {cartStep === 'payment' && (
                    <button
                      onClick={() => setCartStep('items')}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.35rem 0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#334155',
                        transition: 'all 0.15s'
                      }}
                      title="Back to Review Items"
                    >
                      <ArrowLeft size={15} />
                      <span>Back</span>
                    </button>
                  )}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 63, 108, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color)'
                  }}>
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                      {cartStep === 'items' ? 'Shopping Bag' : 'Payment Option'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                  </div>
                </div>

                <button 
                  onClick={closeCart}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title="Close Cart"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 2-Step Navigation Pills */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                background: '#f1f5f9',
                padding: '0.3rem',
                borderRadius: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setCartStep('items')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: cartStep === 'items' ? '#ffffff' : 'transparent',
                    color: cartStep === 'items' ? 'var(--primary-color)' : '#64748b',
                    boxShadow: cartStep === 'items' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: cartStep === 'items' ? 'var(--primary-color)' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}>1</span>
                  <span>Review Items</span>
                </button>

                <button
                  type="button"
                  onClick={() => cart.length > 0 && setCartStep('payment')}
                  disabled={cart.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    background: cartStep === 'payment' ? '#ffffff' : 'transparent',
                    color: cartStep === 'payment' ? 'var(--primary-color)' : '#94a3b8',
                    boxShadow: cartStep === 'payment' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    opacity: cart.length === 0 ? 0.6 : 1
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: cartStep === 'payment' ? 'var(--primary-color)' : '#94a3b8',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}>2</span>
                  <span>Payment Option</span>
                </button>
              </div>
            </div>

            {/* STEP 1: REVIEW ITEMS (SPACIOUS CART CONTENT) */}
            {cartStep === 'items' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: '#94a3b8' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem auto',
                        color: '#94a3b8'
                      }}>
                        <ShoppingBag size={38} />
                      </div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>Hey, your bag is empty!</h4>
                      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        There is nothing in your bag right now. Browse our store to discover amazing deals.
                      </p>
                      <button
                        onClick={closeCart}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700 }}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Free Delivery Banner */}
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        padding: '0.65rem 0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.82rem',
                        color: '#166534'
                      }}>
                        <Truck size={17} style={{ flexShrink: 0, color: '#16a34a' }} />
                        <span><strong>Free Express Delivery</strong> applied on this order. Delivered in 2-3 business days.</span>
                      </div>

                      {/* Items List */}
                      {cart.map((item) => {
                        const finalUnitPrice = getItemPrice(item);
                        const itemSubtotal = finalUnitPrice * item.quantity;
                        const hasDiscount = item.discount && item.discount > 0;

                        return (
                          <div
                            key={item.product_id}
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              padding: '1.1rem',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                              position: 'relative'
                            }}
                          >
                            <img
                              src={item.picture_url ? (item.picture_url.startsWith('http') ? item.picture_url : `http://localhost:8010${item.picture_url}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                              alt={item.title}
                              style={{
                                width: '74px',
                                height: '74px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid #e2e8f0',
                                flexShrink: 0
                              }}
                            />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.35 }}>
                                  {item.title}
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.product_id)}
                                  title="Remove item"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '0.2rem',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.15s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Seller: <span style={{ fontWeight: 600, color: '#475569' }}>{item.vendor_name || 'Verified Merchant'}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                                  ₹{finalUnitPrice.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                  <>
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                      ₹{Number(item.price).toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                      {item.discount}% OFF
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Quantity and Subtotal Row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                  <button
                                    onClick={() => updateQuantity(item.product_id, -1)}
                                    title="Decrease quantity"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#1e293b',
                                      padding: '0.3rem 0.55rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product_id, 1)}
                                    title="Increase quantity"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#1e293b',
                                      padding: '0.3rem 0.55rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '0.3rem' }}>Subtotal:</span>
                                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                                    ₹{itemSubtotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Step 1 Footer: Price Summary & Proceed Button */}
                {cart.length > 0 && (
                  <div style={{
                    padding: '1.25rem 1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#64748b', fontSize: '0.88rem' }}>
                      <span>Total MRP ({totalItemsCount} {totalItemsCount === 1 ? 'unit' : 'units'})</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', color: '#16a34a', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Delivery Fee</span>
                      <span>FREE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.15rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      <span>Total Payable</span>
                      <span style={{ color: 'var(--primary-color)' }}>₹{cartSubtotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => setCartStep('payment')}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(255, 63, 108, 0.35)'
                      }}
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: PAYMENT OPTION & ORDER CONFIRMATION */}
            {cartStep === 'payment' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {/* Order Preview Compact Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📦 Order Preview ({cart.length} {cart.length === 1 ? 'Product' : 'Products'} • {totalItemsCount} Units)
                      </div>
                      <button
                        onClick={() => setCartStep('items')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary-color)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Edit Items
                      </button>
                    </div>

                    {/* Compact Item Thumbnails Rail */}
                    <div style={{
                      display: 'flex',
                      gap: '0.6rem',
                      overflowX: 'auto',
                      paddingBottom: '0.4rem'
                    }}>
                      {cart.map((item) => (
                        <div
                          key={item.product_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.4rem 0.6rem',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={item.picture_url ? (item.picture_url.startsWith('http') ? item.picture_url : `http://localhost:8010${item.picture_url}`) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={item.title}
                            style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Qty: <strong>{item.quantity}</strong> • ₹{(getItemPrice(item) * item.quantity).toFixed(0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <MapPin size={16} color="var(--primary-color)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Delivery Address
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Customer'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                      {profileForm.address ? profileForm.address : 'Standard Delivery Point (Update in Profile tab if needed)'}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        💳 Select Payment Method
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                        <Lock size={12} />
                        <span>100% Secure</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {[
                        { 
                          id: 'upi', 
                          label: 'UPI / Google Pay / PhonePe / Paytm', 
                          icon: <Smartphone size={20} color="#16a34a" />, 
                          sub: 'Instant payment with 0 transaction fee', 
                          badge: 'FASTEST', 
                          badgeColor: '#16a34a', 
                          badgeBg: '#dcfce7',
                          info: 'Pay using any UPI App (Google Pay, PhonePe, Paytm, BHIM, CRED).'
                        },
                        { 
                          id: 'card', 
                          label: 'Debit / Credit Card', 
                          icon: <CreditCard size={20} color="#0284c7" />, 
                          sub: 'Visa, MasterCard, RuPay, Amex', 
                          badge: 'SECURE', 
                          badgeColor: '#0284c7', 
                          badgeBg: '#e0f2fe',
                          info: 'Safe 256-bit encrypted card checkout with instant OTP.'
                        },
                        { 
                          id: 'cod', 
                          label: 'Cash on Delivery', 
                          icon: <Banknote size={20} color="#f59e0b" />, 
                          sub: 'Pay at doorstep via cash or UPI', 
                          badge: 'NO ADVANCE', 
                          badgeColor: '#b45309', 
                          badgeBg: '#fef3c7',
                          info: 'Hand over cash or scan QR when your package is delivered.'
                        },
                      ].map(opt => {
                        const isSelected = selectedPayment === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedPayment(opt.id)}
                            style={{
                              borderRadius: '10px',
                              border: `2px solid ${isSelected ? 'var(--primary-color)' : '#e2e8f0'}`,
                              background: isSelected ? '#fff5f7' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              padding: '0.9rem 1rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <input
                                type="radio"
                                name="payment_step2"
                                value={opt.id}
                                checked={isSelected}
                                onChange={() => setSelectedPayment(opt.id)}
                                style={{ accentColor: 'var(--primary-color)', width: 18, height: 18, flexShrink: 0 }}
                              />
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: isSelected ? '#ffffff' : '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {opt.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{opt.label}</span>
                                  {opt.badge && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, background: opt.badgeBg, color: opt.badgeColor, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{opt.sub}</div>
                              </div>
                            </div>
                            {isSelected && (
                              <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px dashed #fecdd3', fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Check size={14} color="var(--primary-color)" />
                                <span>{opt.info}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={16} color="#16a34a" />
                      <span>100% Genuine</span>
                    </div>
                    <div style={{ width: '1px', height: '14px', background: '#cbd5e1' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RotateCcw size={15} color="#0284c7" />
                      <span>7-Day Return/Replace</span>
                    </div>
                    <div style={{ width: '1px', height: '14px', background: '#cbd5e1' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Lock size={14} color="#64748b" />
                      <span>Encrypted SSL</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 Footer: Final Action */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Final Payable</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                        ₹{cartSubtotal.toFixed(2)}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      No Hidden Fees
                    </span>
                  </div>

                  <button
                    onClick={handleCartCheckout}
                    disabled={checkoutLoading}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.95rem',
                      borderRadius: '8px',
                      fontSize: '1.02rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 14px rgba(255, 63, 108, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {checkoutLoading ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <span>Place Order via {selectedPayment === 'upi' ? 'UPI' : selectedPayment === 'card' ? 'Card' : 'Cash on Delivery'}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setCartStep('items')}
                    type="button"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginTop: '0.65rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    ← Review Items in Bag
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* ── BUY NOW INSTANT CHECKOUT / PAYMENT METHOD MODAL ── */}
      {buyNowModal && buyNowModal.product && (() => {
        const prod = buyNowModal.product;
        const qty = buyNowModal.quantity || 1;
        const unitPrice = prod.price * (1 - (prod.discount || 0) / 100);
        const totalPrice = unitPrice * qty;
        const imgUrl = prod.picture_url ? (prod.picture_url.startsWith('http') ? prod.picture_url : `http://localhost:8010${prod.picture_url}`) : null;

        const PAYMENT_OPTIONS = [
          {
            id: 'upi',
            label: 'UPI / Google Pay / PhonePe',
            sub: 'Instant transfer via UPI app or ID • 0 convenience fee',
            icon: <Smartphone size={20} color="#16a34a" />,
            badge: '⚡ FASTEST & POPULAR',
            badgeBg: '#dcfce7',
            badgeColor: '#16a34a'
          },
          {
            id: 'card',
            label: 'Debit / Credit Card / ATM',
            sub: 'Visa, MasterCard, RuPay, Maestro & Amex accepted',
            icon: <CreditCard size={20} color="#0284c7" />,
            badge: 'SECURE',
            badgeBg: '#e0f2fe',
            badgeColor: '#0284c7'
          },
          {
            id: 'cod',
            label: 'Cash on Delivery (COD)',
            sub: 'Pay with cash or QR scanner upon doorstep delivery',
            icon: <Banknote size={20} color="#d97706" />,
            badge: 'VERIFIED',
            badgeBg: '#fef3c7',
            badgeColor: '#d97706'
          }
        ];

        return (
          <div className="modal-backdrop animate-fade-in" onClick={() => !checkoutLoading && setBuyNowModal(null)} style={{ zIndex: 9999 }}>
            <div
              className="modal-dialog animate-fade-in"
              style={{ width: '540px', maxWidth: '95%', padding: '2rem', maxHeight: '92vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #eaeaec', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#282c3f', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Zap size={20} color="var(--primary-color)" fill="var(--primary-color)" /> Instant Checkout
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Select your payment method to confirm and place your order
                  </p>
                </div>
                <button
                  onClick={() => !checkoutLoading && setBuyNowModal(null)}
                  style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.3rem', padding: '0.2rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Item Card Overview */}
              <div style={{ display: 'flex', gap: '1rem', padding: '0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '6px', background: '#fff', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <Package size={28} color="#94a3b8" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prod.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {prod.category} • Sold by <strong>{prod.vendor_name || 'Verified Seller'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      ₹{unitPrice.toFixed(2)}
                    </span>
                    {prod.discount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{prod.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity adjuster */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setBuyNowModal(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }))}
                    disabled={qty <= 1 || checkoutLoading}
                    style={{ background: 'none', border: 'none', padding: '0.4rem 0.6rem', cursor: qty > 1 ? 'pointer' : 'default', color: qty > 1 ? '#0f172a' : '#cbd5e1' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (qty < (prod.quantity || 999)) {
                        setBuyNowModal(prev => ({ ...prev, quantity: (prev.quantity || 1) + 1 }));
                      } else {
                        showToast(`Only ${prod.quantity} units in stock!`);
                      }
                    }}
                    disabled={qty >= (prod.quantity || 999) || checkoutLoading}
                    style={{ background: 'none', border: 'none', padding: '0.4rem 0.6rem', cursor: qty < (prod.quantity || 999) ? 'pointer' : 'default', color: qty < (prod.quantity || 999) ? '#0f172a' : '#cbd5e1' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Delivery info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#166534' }}>
                <Truck size={16} color="#16a34a" />
                <div>
                  <strong>Guaranteed 2-Day Delivery</strong> • Free Express Doorstep Shipping
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION SECTION */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  💳 Select Payment Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {PAYMENT_OPTIONS.map(opt => {
                    const isSelected = (buyNowModal.paymentMethod || 'upi') === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setBuyNowModal(prev => ({ ...prev, paymentMethod: opt.id }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          border: `2px solid ${isSelected ? 'var(--primary-color)' : '#e2e8f0'}`,
                          background: isSelected ? '#fff1f4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(255, 63, 108, 0.12)' : 'none'
                        }}
                      >
                        <input
                          type="radio"
                          name="buyNowPayment"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => setBuyNowModal(prev => ({ ...prev, paymentMethod: opt.id }))}
                          style={{ accentColor: 'var(--primary-color)', width: 18, height: 18, cursor: 'pointer' }}
                        />
                        <span style={{ flexShrink: 0 }}>{opt.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: isSelected ? 'var(--primary-color)' : '#1e293b' }}>
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, background: opt.badgeBg, color: opt.badgeColor, padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {opt.sub}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '1rem 1.15rem', border: '1px solid #eaeaec', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  <span>Price ({qty} {qty === 1 ? 'item' : 'items'})</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <span>Delivery Charges</span>
                  <span>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', borderTop: '1px solid #eaeaec', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span>Total Payable</span>
                  <span style={{ color: 'var(--primary-color)' }}>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setBuyNowModal(null)}
                  disabled={checkoutLoading}
                  className="btn btn-secondary"
                  style={{ padding: '0.85rem', fontWeight: 700, borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBuyNow}
                  disabled={checkoutLoading}
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(255, 63, 108, 0.35)'
                  }}
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Pay ₹{totalPrice.toFixed(2)} via {buyNowModal.paymentMethod === 'cod' ? 'Cash on Delivery' : buyNowModal.paymentMethod === 'card' ? 'Card' : 'UPI'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}


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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94969f', fontWeight: 700, textTransform: 'uppercase' }}>
                  Order Summary
                </div>
                {(orderSuccess.payment_method || orderSuccess.paymentMethod) && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                    {(orderSuccess.payment_method || orderSuccess.paymentMethod) === 'cod' ? '💵 Cash on Delivery' : (orderSuccess.payment_method || orderSuccess.paymentMethod) === 'card' ? '💳 Card Payment' : '⚡ UPI Payment'}
                  </span>
                )}
              </div>
              {orderSuccess.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem' }}>
                  <span>{item.product} × {item.quantity}</span>
                  <span style={{ fontWeight: 700 }}>₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #eaeaec', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-color)' }}>
                <span>Total</span>
                <span>₹{orderSuccess.total.toFixed(2)}</span>
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
                  navigate('/orders');
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

      {/* ── TRACK ORDER / RETURN / REPLACEMENT MODAL ── */}
      {trackingOrder && (() => {
        const {
          orderDate,
          deliveryDate,
          orderStatus,
          isReplaced,
          replaceDate,
          replaceDeliveryDate,
          isReplacementCompleted,
          daysUntilReplaceDelivery,
          isReturned,
          returnDate,
          returnRefundDate,
          isReturnCompleted
        } = getOrderDates(trackingOrder);
        const fmtDate = (d) => d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently';

        const isReturnTrack = trackingOrder.trackingType === 'return';
        const isReplaceTrack = trackingOrder.trackingType === 'replace';

        // Customized steps per tracking type
        let modalTitle = 'Live Order Tracking';
        let modalIcon = <Truck size={20} color="#0284c7" />;
        let bannerStatus = orderStatus;
        let bannerRightLabel = 'EXPECTED DELIVERY';
        let bannerRightValue = fmtDate(deliveryDate);
        let bannerBg = '#eff6ff';
        let bannerBorder = '#bfdbfe';
        let bannerTextColor = '#1e3a8a';
        let steps = [];

        if (isReturnTrack) {
          modalTitle = 'Return & Refund Tracking';
          modalIcon = <RotateCcw size={20} color="var(--primary-color)" />;
          bannerStatus = isReturnCompleted ? 'Refund Credited to Original Payment' : 'Return In Progress (Pickup Scheduled)';
          bannerRightLabel = isReturnCompleted ? 'REFUND CREDITED' : 'ESTIMATED REFUND';
          bannerRightValue = `₹${trackingOrder.amount.toFixed(2)}`;
          bannerBg = isReturnCompleted ? '#f0fdf4' : '#fff1f4';
          bannerBorder = isReturnCompleted ? '#bbf7d0' : '#fde2e7';
          bannerTextColor = isReturnCompleted ? '#15803d' : '#be123c';
          steps = [
            { title: 'Return Request Approved', desc: `Request RET-${trackingOrder.id} confirmed on ${fmtDate(returnDate)}`, done: true },
            { title: 'Doorstep Pickup Scheduled', desc: `Pickup partner assigned. Collection within 24–48 hours from ${user?.address || 'your address'}`, done: true },
            { title: 'Item Collected by Courier', desc: 'Driver inspected package and collected return parcel', done: true },
            { title: 'Quality Verification at Hub', desc: isReturnCompleted ? 'Product passed warehouse quality inspection' : 'Hub inspection in progress', done: isReturnCompleted },
            { title: 'Refund Credited to Original Payment', desc: isReturnCompleted ? `₹${trackingOrder.amount.toFixed(2)} credited to your account` : `₹${trackingOrder.amount.toFixed(2)} transferred within 2 days (${fmtDate(returnRefundDate)})`, done: isReturnCompleted },
          ];
        } else if (isReplaceTrack) {
          modalTitle = 'Replacement Order Tracking';
          modalIcon = <RefreshCcw size={20} color="#0284c7" />;
          bannerStatus = isReplacementCompleted ? 'Replacement Delivered & Completed' : 'Replacement Unit Dispatched';
          bannerRightLabel = isReplacementCompleted ? 'DELIVERED ON' : 'EXPECTED ARRIVAL';
          bannerRightValue = fmtDate(replaceDeliveryDate);
          bannerBg = isReplacementCompleted ? '#f0fdf4' : '#f0f9ff';
          bannerBorder = isReplacementCompleted ? '#bbf7d0' : '#bae6fd';
          bannerTextColor = isReplacementCompleted ? '#15803d' : '#0369a1';
          steps = [
            { title: 'Replacement Request Approved', desc: `Request REP-${trackingOrder.id} confirmed on ${fmtDate(replaceDate)}`, done: true },
            { title: 'Doorstep Pickup Scheduled for Defective Item', desc: 'Delivery partner assigned to collect original product from your doorstep', done: true },
            { title: 'Exchange Handover Complete', desc: 'Defective product received and verified by courier agent', done: true },
            { title: 'Fresh Replacement Unit Dispatched', desc: 'Shipped via Express Priority Logistics', done: true },
            { 
              title: isReplacementCompleted ? 'Replacement Delivered at Doorstep' : 'Replacement Delivered at Doorstep', 
              desc: isReplacementCompleted 
                ? `Replacement unit safely delivered to your doorstep on ${fmtDate(replaceDeliveryDate)}`
                : `Expected replacement delivery within 2 days (${fmtDate(replaceDeliveryDate)})`, 
              done: isReplacementCompleted 
            },
          ];
        } else {
          // Standard delivery tracking
          steps = [
            { title: 'Order Confirmed', desc: `Placed on ${fmtDate(orderDate)}`, done: true },
            { title: 'Packed & Dispatched', desc: 'Handed to courier partner (BlueDart Express)', done: orderStatus !== 'Processing' },
            { title: 'In Transit', desc: 'Departed sorting facility to destination hub', done: orderStatus === 'In Transit' || orderStatus === 'Out for Delivery' || orderStatus === 'Delivered' || orderStatus === 'Completed' },
            { title: 'Out for Delivery', desc: 'Delivery executive assigned for doorstep delivery', done: orderStatus === 'Out for Delivery' || orderStatus === 'Delivered' || orderStatus === 'Completed' },
            { title: 'Delivered', desc: `Expected delivery within 2 days (${fmtDate(deliveryDate)})`, done: orderStatus === 'Delivered' || orderStatus === 'Completed' },
          ];
        }

        return (
          <div className="modal-backdrop" onClick={() => setTrackingOrder(null)}>
            <div
              className="modal-dialog animate-fade-in"
              style={{ width: '520px', maxWidth: '94%', padding: '2rem' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #eaeaec', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#282c3f', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {modalIcon} {modalTitle}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Order {trackingOrder.display_order_id || trackingOrder.order_group_id || `#${trackingOrder.id}`}
                    {trackingOrder.items && trackingOrder.items.length > 1
                      ? ` • ${trackingOrder.items.length} items (${trackingOrder.total_quantity || trackingOrder.items.reduce((s, it) => s + (it.quantity || 1), 0)} units)`
                      : ` — ${trackingOrder.product_name || (trackingOrder.items && trackingOrder.items[0]?.product_name)}`}
                  </p>
                </div>
                <button onClick={() => setTrackingOrder(null)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>

              {/* Status Banner */}
              <div style={{ background: bannerBg, border: `1px solid ${bannerBorder}`, borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: bannerTextColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CURRENT STATUS</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: bannerTextColor, marginTop: '0.15rem' }}>{bannerStatus}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 700 }}>{bannerRightLabel}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: bannerTextColor }}>{bannerRightValue}</div>
                </div>
              </div>

              {/* Package contents breakdown if multi-item */}
              {trackingOrder.items && trackingOrder.items.length > 1 && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 800, color: '#334155', marginBottom: '0.45rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Package size={14} color="#64748b" /> Package Contents ({trackingOrder.items.length} Products, {trackingOrder.total_quantity || trackingOrder.items.reduce((s, it) => s + (it.quantity || 1), 0)} Units)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {trackingOrder.items.map((it, idx) => (
                      <div key={it.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: '0.82rem', padding: '0.2rem 0', borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{it.product_name}</span>
                          <span style={{ marginLeft: '0.4rem', color: '#64748b', fontSize: '0.78rem' }}>× {it.quantity || 1}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{(it.amount || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem', paddingLeft: '0.5rem' }}>
                {steps.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', position: 'relative' }}>
                    {/* Circle */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: s.done ? '#03a685' : '#e5e7eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      zIndex: 2,
                    }}>
                      {s.done ? '✓' : idx + 1}
                    </div>
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '24px',
                        width: '2px',
                        height: 'calc(100% + 4px)',
                        background: s.done && steps[idx + 1].done ? '#03a685' : '#e5e7eb',
                        zIndex: 1,
                      }} />
                    )}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: s.done ? '#282c3f' : '#9ca3af' }}>{s.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.1rem' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!isReturnTrack && !isReplaceTrack && (
                  <button
                    type="button"
                    onClick={() => {
                      const ordId = trackingOrder.id;
                      const idsToAdd = [ordId];
                      if (trackingOrder.order_group_id) idsToAdd.push(trackingOrder.order_group_id);
                      if (trackingOrder.display_order_id) idsToAdd.push(trackingOrder.display_order_id);
                      if (trackingOrder.items) {
                        trackingOrder.items.forEach(it => {
                          if (it.id) idsToAdd.push(it.id);
                        });
                      }
                      setDeliveredOrderIds(prev => {
                        const next = new Set([...prev, ...idsToAdd]);
                        try { localStorage.setItem('shopsense_delivered_orders', JSON.stringify([...next])); } catch {}
                        return next;
                      });
                      setTrackingOrder(null);
                      showToast(`🎉 Order ${trackingOrder.display_order_id || trackingOrder.order_group_id || `#${ordId}`} marked as Delivered! Return/Replace window is now open.`);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#03a685' }}
                  >
                    <CheckCircle2 size={16} /> Confirm Delivery / Received
                  </button>
                )}

                {isReplaceTrack && !isReplacementCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      const ordId = trackingOrder.id;
                      setCompletedReplacementOrderIds(prev => {
                        const next = new Set([...prev, ordId]);
                        try { localStorage.setItem('shopsense_completed_replacements', JSON.stringify([...next])); } catch {}
                        return next;
                      });
                      setTrackingOrder(null);
                      showToast(`🎉 Replacement for Order #${ordId} confirmed as Delivered & Completed!`);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#0284c7' }}
                  >
                    <CheckCircle2 size={16} /> Confirm Replacement Received
                  </button>
                )}

                {isReturnTrack && !isReturnCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      const ordId = trackingOrder.id;
                      setCompletedReturnOrderIds(prev => {
                        const next = new Set([...prev, ordId]);
                        try { localStorage.setItem('shopsense_completed_returns', JSON.stringify([...next])); } catch {}
                        return next;
                      });
                      setTrackingOrder(null);
                      showToast(`🎉 Return & Refund for Order #${ordId} completed!`);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'var(--primary-color)' }}
                  >
                    <CheckCircle2 size={16} /> Confirm Return & Refund
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setTrackingOrder(null)}
                  className="btn btn-secondary"
                  style={{ flex: (!isReturnTrack && !isReplaceTrack) || (isReplaceTrack && !isReplacementCompleted) || (isReturnTrack && !isReturnCompleted) ? 'none' : 1, padding: '0.75rem 1.25rem', fontWeight: 700 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── RETURN / REPLACE REQUEST MODAL ── */}
      {returnModal && (
        <div className="modal-backdrop" onClick={() => setReturnModal(null)}>
          <div
            className="modal-dialog animate-fade-in"
            style={{ width: '480px', maxWidth: '92%', padding: '2rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#282c3f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {returnModal.type === 'return' ? <><RotateCcw size={20} color="var(--primary-color)" /> Return Request</> : <><RefreshCcw size={20} color="#0284c7" /> Replace Request</>}
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order #{returnModal.order.id} — {returnModal.order.product_name}</p>
              </div>
              <button onClick={() => setReturnModal(null)} style={{ background: 'none', border: 'none', color: '#94969f', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Policy Info */}
            <div style={{ background: returnModal.type === 'return' ? '#fff1f4' : '#eff6ff', border: `1px solid ${returnModal.type === 'return' ? '#fde2e7' : '#bae6fd'}`, borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#535766' }}>
              {returnModal.type === 'return' ? (
                <>🔄 <strong>Free 7-Day Return Policy:</strong> Once confirmed, our pickup partner will collect the item from your doorstep within 24 hours. Refund is credited in 3–5 business days.</>
              ) : (
                <>📦 <strong>Free Replacement Policy:</strong> We'll dispatch a fresh replacement unit within 2–3 business days after doorstep pickup of the defective item.</>
              )}
            </div>

            <form onSubmit={handleReturnRequest}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#282c3f', display: 'block', marginBottom: '0.4rem' }}>
                  Reason for {returnModal.type === 'return' ? 'Return' : 'Replacement'} *
                </label>
                <select
                  className="input-field"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">— Select a reason —</option>
                  <option value="Defective / Damaged product">Defective / Damaged product</option>
                  <option value="Wrong product received">Wrong product received</option>
                  <option value="Product not as described">Product not as described</option>
                  <option value="Missing parts / accessories">Missing parts / accessories</option>
                  <option value="Quality not satisfactory">Quality not satisfactory</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Better price found elsewhere">Better price found elsewhere</option>
                </select>
              </div>

              <div style={{ background: '#f5f5f6', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#535766' }}>
                📍 <strong>Pickup Address:</strong> {user?.address || 'Your registered delivery address (update in Profile)'}<br />
                🕐 <strong>Pickup Window:</strong> Within 24–48 hours of request confirmation
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setReturnModal(null)}
                  className="btn btn-secondary"
                  style={{ fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting || !returnReason}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 700,
                    background: returnModal.type === 'return' ? 'var(--primary-color)' : '#0284c7',
                    boxShadow: returnModal.type === 'return' ? '0 4px 12px rgba(255,63,108,0.3)' : '0 4px 12px rgba(2,132,199,0.3)'
                  }}
                >
                  {returnSubmitting ? 'Submitting...' : `Confirm ${returnModal.type === 'return' ? 'Return' : 'Replacement'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RETURN / REPLACE SUCCESS MODAL ── */}
      {returnSuccess && (
        <div className="modal-backdrop">
          <div className="modal-dialog animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', width: '420px', maxWidth: '92%' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: returnSuccess.type === 'return' ? '#fff1f4' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              {returnSuccess.type === 'return'
                ? <RotateCcw size={30} color="var(--primary-color)" />
                : <RefreshCcw size={30} color="#0284c7" />}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#282c3f', marginBottom: '0.4rem' }}>
              {returnSuccess.type === 'return' ? 'Return Request Placed! 🎉' : 'Replacement Request Placed! 🎉'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Your <strong>{returnSuccess.type}</strong> request for <strong>{returnSuccess.order.product_name}</strong> has been submitted.
            </p>
            <div style={{ background: '#fafafa', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', textAlign: 'left', border: '1px solid #eaeaec', fontSize: '0.85rem', color: '#535766' }}>
              <div style={{ marginBottom: '0.3rem' }}>📋 <strong>Request ID:</strong> RET-{Date.now().toString().slice(-6)}</div>
              <div style={{ marginBottom: '0.3rem' }}>📦 <strong>Product:</strong> {returnSuccess.order.product_name}</div>
              <div style={{ marginBottom: '0.3rem' }}>💬 <strong>Reason:</strong> {returnSuccess.reason}</div>
              <div>🚚 <strong>Pickup:</strong> Our agent will contact you within 24–48 hrs</div>
            </div>
            <button
              onClick={() => setReturnSuccess(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
            >
              Done
            </button>
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
                <div 
                  style={{ position: 'relative', cursor: 'zoom-in' }}
                  title="Click to view full image"
                  onClick={() => setFullScreenImage({
                    url: detailProduct.picture_url ? `http://localhost:8010${detailProduct.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    title: detailProduct.title
                  })}
                >
                  <img 
                    src={detailProduct.picture_url ? `http://localhost:8010${detailProduct.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'} 
                    style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: '2px solid #eaeaec', transition: 'transform 0.2s' }} 
                    alt="" 
                  />
                  <div style={{ position: 'absolute', bottom: 3, right: 3, background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Maximize2 size={11} color="#ffffff" />
                  </div>
                </div>
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
                      ₹{(detailProduct.price * (1 - (detailProduct.discount || 0) / 100)).toFixed(2)}
                    </span>
                    {detailProduct.discount > 0 && (
                      <>
                        <span style={{ fontSize: '0.9rem', color: '#94969f', textDecoration: 'line-through' }}>
                          ₹{detailProduct.price.toFixed(2)}
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
                  setDetailProduct(null);
                  addToCart(detailProduct, true);
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
    </div>
  );
};

export default CustomerDashboard;
