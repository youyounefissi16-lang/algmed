import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import '../styles/teal-theme.css';

const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    try { const consent = localStorage.getItem('cookie-consent'); if (!consent) setVisible(true); } catch { setVisible(true); }
  }, []);

  // The banner is fixed to the viewport: publish its height so the layout can
  // reserve the same space and never cover the bottom of a page (forms, CTAs).
  useEffect(() => {
    const root = document.documentElement;
    const el = bannerRef.current;
    if (!visible || !el) { root.style.removeProperty('--cookie-height'); return undefined; }
    const update = () => root.style.setProperty('--cookie-height', `${Math.ceil(el.offsetHeight)}px`);
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (observer) observer.observe(el);
    else window.addEventListener('resize', update);
    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', update);
      root.style.removeProperty('--cookie-height');
    };
  }, [visible]);

  const accept = () => {
    try { localStorage.setItem('cookie-consent', 'accepted'); } catch { /* incognito */ }
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem('cookie-consent', 'declined'); } catch { /* incognito */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="alert" aria-live="polite" ref={bannerRef}>
      <p className="cookie-consent-text">{t('cookie.text')}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn-primary cookie-consent-btn" onClick={accept}>{t('cookie.accept')}</button>
        <button className="btn-secondary" onClick={decline} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>{t('cookie.decline') || 'Decline'}</button>
      </div>
    </div>
  );
};

export default CookieConsent;
