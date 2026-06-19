import { useState, useEffect } from 'react';

export function AddToHomeScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    const dismissed = localStorage.getItem('a2hs-dismissed');
    if (isIOS && !isStandalone && !dismissed) {
      setTimeout(() => setShow(true), 3000);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('a2hs-dismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: '1rem 1rem calc(1rem + env(safe-area-inset-bottom))',
      background: 'var(--ink)',
      borderTop: '1px solid rgba(201,168,76,0.25)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      animation: 'slide-up 0.3s ease',
    }}>
      <style>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'var(--night)', border: '1px solid rgba(201,168,76,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontStyle: 'italic',
          color: 'var(--gold)', fontWeight: 700,
        }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Add Missionly to your home screen
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            Tap <span style={{ color: 'rgba(255,255,255,0.8)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: 'middle', marginBottom: 2 }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </span> then <strong style={{ color: 'rgba(255,255,255,0.8)' }}>"Add to Home Screen"</strong>
          </div>
        </div>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem', lineHeight: 1, flexShrink: 0 }}
        >×</button>
      </div>
    </div>
  );
}
