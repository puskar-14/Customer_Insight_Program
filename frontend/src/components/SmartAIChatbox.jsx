import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, RotateCcw, Zap, ShoppingBag,
  TrendingUp, HelpCircle, Package, CreditCard, Search,
  MessageSquare, Lightbulb, BarChart2, Star, Tag
} from 'lucide-react';
import useStore from '../store';

// ─── Markdown-like renderer (bold, bullet, header) ────────────────────────────
const RichText = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.6 }}>
      {lines.map((line, i) => {
        // Table row — render as styled table row
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          const cells = line.split('|').filter((c) => c.trim() !== '');
          const isSep = cells.every((c) => /^[-:\s]+$/.test(c));
          if (isSep) return null;
          const isHeader = i > 0 && lines[i - 1]?.trim().startsWith('|') === false;
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                background: isHeader ? '#0284c7' : i % 2 === 0 ? '#f8fafc' : '#fff',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {cells.map((c, ci) => (
                <div
                  key={ci}
                  style={{
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: isHeader ? 700 : 500,
                    color: isHeader ? '#fff' : '#334155',
                  }}
                >
                  {renderInline(c.trim())}
                </div>
              ))}
            </div>
          );
        }

        // Bullet
        if (line.trim().startsWith('•') || line.trim().startsWith('- ')) {
          const content = line.replace(/^[•\-]\s*/, '');
          return (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ color: '#0284c7', marginTop: '0.05rem', flexShrink: 0 }}>•</span>
              <span>{renderInline(content)}</span>
            </div>
          );
        }

        // Numbered
        if (/^\d+\.\s/.test(line.trim())) {
          const match = line.match(/^(\d+)\.\s(.+)/);
          if (match) {
            return (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ color: '#0284c7', fontWeight: 700, flexShrink: 0 }}>{match[1]}.</span>
                <span>{renderInline(match[2])}</span>
              </div>
            );
          }
        }

        // Empty line = spacing
        if (!line.trim()) return <div key={i} style={{ height: '0.5rem' }} />;

        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
};

function renderInline(text) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Italic *text*
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((ip, j) => {
      if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
        return <em key={j}>{ip.slice(1, -1)}</em>;
      }
      return <span key={j}>{ip}</span>;
    });
  });
}

// ─── Category quick prompts config ────────────────────────────────────────────
const CUSTOMER_PROMPTS = [
  { icon: <Zap size={13} />, label: '🔥 Best deals today', color: '#f97316' },
  { icon: <Sparkles size={13} />, label: '🛍️ Recommend products for me', color: '#a855f7' },
  { icon: <Package size={13} />, label: '📦 Track my order', color: '#0284c7' },
  { icon: <CreditCard size={13} />, label: '💳 Payment help', color: '#16a34a' },
  { icon: <RotateCcw size={13} />, label: '🔄 Return a product', color: '#dc2626' },
  { icon: <Star size={13} />, label: '⭐ Best rated products', color: '#eab308' },
  { icon: <Tag size={13} />, label: '🎁 Gift under ₹2000', color: '#ec4899' },
  { icon: <Search size={13} />, label: 'Show me electronics products', color: '#0891b2' },
  { icon: <ShoppingBag size={13} />, label: 'Products under ₹1000', color: '#059669' },
  { icon: <Search size={13} />, label: 'I need a gaming laptop under ₹70,000', color: '#7c3aed' },
  { icon: <Tag size={13} />, label: 'Suggest me furniture', color: '#92400e' },
  { icon: <Sparkles size={13} />, label: 'Recently added products', color: '#0284c7' },
];

const VENDOR_PROMPTS = [
  { icon: <BarChart2 size={13} />, label: '📊 Show my sales summary', color: '#0284c7' },
  { icon: <TrendingUp size={13} />, label: '🔥 Best-selling products', color: '#f97316' },
  { icon: <Package size={13} />, label: '📦 Low stock products', color: '#dc2626' },
  { icon: <Lightbulb size={13} />, label: '📈 How can I increase sales?', color: '#16a34a' },
  { icon: <BarChart2 size={13} />, label: '💰 Show my revenue', color: '#0891b2' },
  { icon: <Sparkles size={13} />, label: '🧠 Give me business suggestions', color: '#a855f7' },
  { icon: <HelpCircle size={13} />, label: 'Why are my sales decreasing?', color: '#dc2626' },
  { icon: <Package size={13} />, label: 'Which products should I restock soon?', color: '#f97316' },
  { icon: <HelpCircle size={13} />, label: 'How do I add a new product?', color: '#0284c7' },
  { icon: <TrendingUp size={13} />, label: 'Show my top customers', color: '#7c3aed' },
];

// ─── Table renderer for SQL data ───────────────────────────────────────────────
const DataTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  const cols = Object.keys(data[0]);

  return (
    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(90deg, #0284c7, #06b6d4)', color: '#fff' }}>
            {cols.map((c, i) => (
              <th key={i} style={{ padding: '0.55rem 0.8rem', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.75rem', letterSpacing: '0.3px' }}>
                {c.replace(/_/g, ' ').toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {cols.map((col, ci) => {
                const key = col.toLowerCase();
                const isCount = [
                  'units_sold', 'unit_sold', 'items_sold', 'products_sold',
                  'total_products', 'total_units', 'total_orders', 'total_items',
                  'total_customers', 'stock', 'quantity', 'count', 'rating',
                  'rank', 'percent', 'percentage', 'discount'
                ].some(t => key.includes(t)) || ['products', 'units', 'orders', 'items', 'customers', 'sales'].includes(key);

                const moneyTerms = ['revenue', 'price', 'profit', 'margin', 'valuation', 'cost', 'earning', 'amount', 'spent', 'balance'];
                const isMoney = !isCount && moneyTerms.some(t => key.includes(t));

                const val = row[col];
                let display = val ?? '—';
                if (typeof val === 'number') {
                  if (isMoney) {
                    display = `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  } else if (Number.isInteger(val)) {
                    display = val.toLocaleString('en-IN');
                  } else {
                    display = val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                  }
                }

                return (
                  <td key={ci} style={{ padding: '0.5rem 0.8rem', fontWeight: ci === 0 ? 700 : 400, color: isMoney ? '#0284c7' : '#334155' }}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Product card ─────────────────────────────────────────────────────────────
const ProductCard = ({ p }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
    padding: '0.7rem 0.85rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.15s',
    cursor: 'pointer'
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(2,132,199,0.12)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'}
  >
    <img
      src={p.picture_url ? `http://localhost:8010${p.picture_url}` : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
      alt={p.title}
      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.05rem' }}>{p.category}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0284c7' }}>₹{p.price?.toFixed(2)}</span>
        {p.discount > 0 && <span style={{ fontSize: '0.72rem', color: '#ff905a', fontWeight: 700 }}>({p.discount}% OFF)</span>}
        {p.rating && <span style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: 600 }}>⭐ {p.rating}</span>}
      </div>
    </div>
  </div>
);

// ─── Chat bubble ───────────────────────────────────────────────────────────────
const ChatBubble = ({ msg, isFullPage }) => {
  const isUser = msg.sender === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ff3f6c, #ff6b9d)',
          color: '#fff',
          borderRadius: '18px 18px 4px 18px',
          padding: '0.7rem 1rem',
          maxWidth: isFullPage ? '70%' : '85%',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          boxShadow: '0 4px 12px rgba(255,63,108,0.25)'
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  // AI bubble
  return (
    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', alignItems: 'flex-start', maxWidth: isFullPage ? '80%' : '90%' }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: '0.1rem',
        boxShadow: '0 2px 8px rgba(2,132,199,0.3)'
      }}>
        <Bot size={16} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px 18px 18px 18px',
          padding: '0.8rem 1rem',
          fontSize: '0.875rem',
          color: '#1e293b',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <RichText text={msg.text} />
        </div>

        {/* Data Table */}
        {msg.data && msg.data.length > 0 && <DataTable data={msg.data} />}

        {/* Product Cards */}
        {msg.products && msg.products.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.6rem' }}>
            {msg.products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem' }}>
    <div style={{
      width: '30px', height: '30px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Bot size={16} color="#fff" />
    </div>
    <div style={{
      background: '#f1f5f9', border: '1px solid #e2e8f0',
      borderRadius: '4px 18px 18px 18px',
      padding: '0.7rem 1rem',
      display: 'flex', gap: '5px', alignItems: 'center'
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#94a3b8',
          animation: `bounce 1.2s infinite ${i * 0.2}s`
        }} />
      ))}
    </div>
  </div>
);

// ─── Suggestion chip ──────────────────────────────────────────────────────────
const SuggestionChip = ({ prompt, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(prompt.label)}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: '#fff', border: `1.5px solid ${prompt.color}20`,
      borderRadius: '20px', padding: '0.3rem 0.75rem',
      fontSize: '0.76rem', fontWeight: 600, color: prompt.color,
      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.15s ease'
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${prompt.color}12`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}
  >
    {prompt.icon}
    {prompt.label}
  </button>
);

// ─── SmartAIChatbox (main export) ─────────────────────────────────────────────
const SmartAIChatbox = ({ isFullPage = false, isVendor = false }) => {
  const { apiFetch } = useStore();
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const isFirstLoad = useRef(true);

  const welcomeMsg = isVendor
    ? 'Hi Seller! 👋 I\'m your **AI Business Analyst**. Ask me about your **sales trends**, **low-stock inventory**, **revenue**, **best-selling products**, or **how to grow your store!**'
    : 'Hi there! 👋 I\'m your **ShopSense AI Shopping Assistant**. Ask me to **find products**, check **order status**, help with **payments**, suggest **gifts**, compare items, or anything else you need!';

  const [messages, setMessages] = useState([{ sender: 'ai', text: welcomeMsg, products: [] }]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  const prompts = isVendor ? VENDOR_PROMPTS : CUSTOMER_PROMPTS;
  const visiblePrompts = showAllPrompts ? prompts : prompts.slice(0, 6);

  useEffect(() => {
    if (isFullPage) {
      window.scrollTo(0, 0);
      const mainEl = document.querySelector('.main-content');
      if (mainEl) mainEl.scrollTop = 0;
    }
  }, [isFullPage]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (chatContainerRef.current) chatContainerRef.current.scrollTop = 0;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const query = (customPrompt || inputQuery).trim();
    if (!query) return;

    setMessages(prev => [...prev, { sender: 'user', text: query, products: [] }]);
    setInputQuery('');
    setLoading(true);
    inputRef.current?.focus();

    try {
      if (isVendor) {
        const res = await apiFetch('/vendor/ai-analyst', {
          method: 'POST',
          body: JSON.stringify({ query })
        });
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: res.ai_answer,
          sql: res.generated_sql,
          data: res.data || [],
          products: []
        }]);
      } else {
        const res = await apiFetch('/shop/ai-assistant', {
          method: 'POST',
          body: JSON.stringify({ query })
        });
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: res.reply,
          products: res.recommended_products || []
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: isVendor
          ? '⚠️ I encountered an issue analyzing your question. Please try asking about sales, stock levels, or revenue!'
          : '⚠️ I couldn\'t complete your request right now. Try asking about products, deals, or order tracking!',
        products: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ sender: 'ai', text: welcomeMsg, products: [] }]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isFullPage ? 'calc(100vh - 80px)' : '100%',
      background: isFullPage ? '#f8fafc' : '#fff',
      borderRadius: isFullPage ? '16px' : '0',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-input:focus { outline: none; border-color: #0284c7 !important; box-shadow: 0 0 0 3px rgba(2,132,199,0.12) !important; }
      `}</style>

      {/* ─── Header ─────────────────────────────────── */}
      {isFullPage && (
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #06b6d4 100%)',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(2,132,199,0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)'
            }}>
              <Bot size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                {isVendor ? 'ShopSense Business AI' : 'ShopSense Shopping AI'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                {isVendor ? 'Live SQL Analytics + Business Intelligence' : 'RAG Live Product Intelligence · Always on'}
              </div>
            </div>
          </div>
          <button
            onClick={handleClear}
            title="Clear conversation"
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
              color: '#fff', cursor: 'pointer', padding: '0.5rem 0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.8rem', fontWeight: 600, backdropFilter: 'blur(8px)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <RotateCcw size={14} /> New chat
          </button>
        </div>
      )}

      {/* ─── Messages Area ───────────────────────────── */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isFullPage ? '1.5rem 2rem' : '1rem',
          display: 'flex',
          flexDirection: 'column',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ animation: 'fadeInUp 0.25s ease' }}>
            <ChatBubble msg={msg} isFullPage={isFullPage} />
          </div>
        ))}
        {loading && <TypingIndicator />}
      </div>

      {/* ─── Quick Suggestion Chips ─────────────────── */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #f1f5f9',
        padding: '0.6rem 1rem',
      }}>
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          flexWrap: isFullPage ? 'wrap' : 'nowrap'
        }}>
          {visiblePrompts.map((p, i) => (
            <SuggestionChip key={i} prompt={p} onClick={handleSend} />
          ))}
          {!showAllPrompts && prompts.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllPrompts(true)}
              style={{
                background: '#f1f5f9', border: '1.5px solid #e2e8f0',
                borderRadius: '20px', padding: '0.3rem 0.75rem',
                fontSize: '0.75rem', fontWeight: 600, color: '#64748b',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              +{prompts.length - 6} more
            </button>
          )}
        </div>
      </div>

      {/* ─── Input Bar ───────────────────────────────── */}
      <div style={{
        background: '#fff',
        padding: isFullPage ? '0.85rem 1.5rem 1.25rem' : '0.65rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            background: '#f8fafc',
            borderRadius: '28px',
            padding: '0.4rem 0.4rem 0.4rem 1rem',
            border: '1.5px solid #e2e8f0',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocus={() => {}}
        >
          <MessageSquare size={17} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={isVendor
              ? 'Ask about sales, revenue, inventory, customers…'
              : 'Ask about products, deals, orders, payments…'
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.9rem',
              color: '#1e293b',
              outline: 'none',
              padding: '0.3rem 0'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            style={{
              background: loading || !inputQuery.trim()
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #0284c7, #06b6d4)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading || !inputQuery.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: loading || !inputQuery.trim() ? 'none' : '0 4px 12px rgba(2,132,199,0.3)'
            }}
            onMouseEnter={e => { if (!loading && inputQuery.trim()) e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Send size={16} />
          </button>
        </form>
        {isFullPage && (
          <div style={{ textAlign: 'center', fontSize: '0.71rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Powered by ShopSense RAG · Responses grounded in live store data
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAIChatbox;
