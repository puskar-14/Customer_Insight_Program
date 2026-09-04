import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store';
import { Bot, X, Maximize2, Minimize2, Move } from 'lucide-react';
import SmartAIChatbox from './SmartAIChatbox';

const GlobalAIAssistant = () => {
  const { user, isCartOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isVendor = user?.role === 'vendor';

  // Automatically close assistant if cart drawer opens
  useEffect(() => {
    if (isCartOpen && isOpen) {
      setIsOpen(false);
    }
  }, [isCartOpen]);

  // Position state (persisted in localStorage)
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsense_ai_icon_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) {}
    // Default: bottom-right
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return { x: Math.max(16, w - 84), y: Math.max(16, h - 84) };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showDragHint, setShowDragHint] = useState(false);
  const dragInfoRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, hasMoved: false });
  const posRef = useRef(pos);
  posRef.current = pos;

  // Keep icon within viewport boundaries on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos(prev => ({
        x: Math.max(16, Math.min(window.innerWidth - 76, prev.x)),
        y: Math.max(16, Math.min(window.innerHeight - 76, prev.y)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: posRef.current.x,
      originY: posRef.current.y,
      hasMoved: false,
    };

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragInfoRef.current.startX;
      const dy = moveEvent.clientY - dragInfoRef.current.startY;
      if (!dragInfoRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        dragInfoRef.current.hasMoved = true;
        setIsDragging(true);
      }
      if (dragInfoRef.current.hasMoved) {
        const nextX = Math.max(16, Math.min(window.innerWidth - 76, dragInfoRef.current.originX + dx));
        const nextY = Math.max(16, Math.min(window.innerHeight - 76, dragInfoRef.current.originY + dy));
        setPos({ x: nextX, y: nextY });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (dragInfoRef.current.hasMoved) {
        try {
          localStorage.setItem('shopsense_ai_icon_pos', JSON.stringify(posRef.current));
        } catch (e) {}
        setTimeout(() => setIsDragging(false), 50);
      } else {
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch Drag Handlers (mobile / touch screen support)
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    dragInfoRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      originX: posRef.current.x,
      originY: posRef.current.y,
      hasMoved: false,
    };

    const handleTouchMove = (moveEvent) => {
      const t = moveEvent.touches[0];
      const dx = t.clientX - dragInfoRef.current.startX;
      const dy = t.clientY - dragInfoRef.current.startY;
      if (!dragInfoRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
        dragInfoRef.current.hasMoved = true;
        setIsDragging(true);
      }
      if (dragInfoRef.current.hasMoved) {
        moveEvent.preventDefault();
        const nextX = Math.max(16, Math.min(window.innerWidth - 76, dragInfoRef.current.originX + dx));
        const nextY = Math.max(16, Math.min(window.innerHeight - 76, dragInfoRef.current.originY + dy));
        setPos({ x: nextX, y: nextY });
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (dragInfoRef.current.hasMoved) {
        try {
          localStorage.setItem('shopsense_ai_icon_pos', JSON.stringify(posRef.current));
        } catch (e) {}
        setTimeout(() => setIsDragging(false), 50);
      } else {
        setIsDragging(false);
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleButtonClick = () => {
    if (dragInfoRef.current.hasMoved) {
      return; // Ignore click triggered after dragging
    }
    setIsOpen(!isOpen);
  };

  // Compute adaptive panel position relative to the floating icon
  const isRightHalf = typeof window !== 'undefined' ? pos.x > window.innerWidth / 2 : true;
  const isBottomHalf = typeof window !== 'undefined' ? pos.y > window.innerHeight / 2 : true;

  const panelStyle = isExpanded
    ? {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '560px',
        maxWidth: '100vw',
        height: '100vh',
        borderRadius: '16px 0 0 16px',
      }
    : {
        position: 'fixed',
        width: '400px',
        maxWidth: 'calc(100vw - 32px)',
        height: '590px',
        maxHeight: 'calc(100vh - 120px)',
        borderRadius: '16px',
        ...(isRightHalf
          ? { right: `${Math.max(16, window.innerWidth - (pos.x + 60))}px` }
          : { left: `${Math.max(16, pos.x)}px` }),
        ...(isBottomHalf
          ? { bottom: `${Math.max(16, window.innerHeight - pos.y + 12)}px` }
          : { top: `${Math.max(16, pos.y + 68)}px` }),
      };

  return (
    <>
      {/* Draggable Floating Action Button */}
      <div
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: isCartOpen ? -1 : 9999,
          userSelect: 'none',
          touchAction: 'none',
          opacity: isCartOpen ? 0 : 1,
          pointerEvents: isCartOpen ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={() => setShowDragHint(true)}
        onMouseLeave={() => setShowDragHint(false)}
      >
        <button
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleButtonClick}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isOpen
              ? 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            border: isDragging ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.4)',
            boxShadow: isDragging
              ? '0 16px 36px rgba(2,132,199,0.55), 0 0 0 6px rgba(6,182,212,0.25)'
              : isOpen
              ? '0 8px 24px rgba(220,38,38,0.4)'
              : '0 8px 24px rgba(2,132,199,0.45)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.2s, background 0.25s',
            transform: isDragging ? 'scale(1.08)' : 'scale(1)',
          }}
          title={isOpen ? 'Close AI Assistant' : 'AI Assistant (Drag anywhere to move)'}
        >
          {isOpen ? <X size={26} /> : <Bot size={28} />}
        </button>

        {/* Subtle tooltip / move hint */}
        {showDragHint && !isDragging && (
          <div
            style={{
              position: 'absolute',
              bottom: isBottomHalf ? '70px' : '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              color: '#ffffff',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              pointerEvents: 'none',
              animation: 'fadeInHint 0.15s ease',
            }}
          >
            <Move size={11} /> Drag to move
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            ...panelStyle,
            background: '#ffffff',
            boxShadow: isExpanded
              ? '-8px 0 36px rgba(0,0,0,0.18)'
              : '0 12px 40px rgba(0,0,0,0.22)',
            border: '1px solid #eaeaec',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            overflow: 'hidden',
            transition: isExpanded ? 'all 0.3s cubic-bezier(0.16,1,0.3,1)' : 'none',
            animation: 'fadeInChat 0.2s ease',
          }}
        >
          <style>{`
            @keyframes fadeInChat {
              from { opacity: 0; transform: translateY(12px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeInHint {
              from { opacity: 0; transform: translate(-50%, 4px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>

          {/* Compact header with expand/close */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Bot size={20} color="#fff" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                  {isVendor ? 'ShopSense Business AI' : 'ShopSense AI Assistant'}
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: 'rgba(255,255,255,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      display: 'inline-block',
                    }}
                  />
                  {isVendor ? 'Business Intelligence' : 'RAG Product Intelligence'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* SmartAIChatbox fills the rest */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <SmartAIChatbox isFullPage={false} isVendor={isVendor} />
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalAIAssistant;

