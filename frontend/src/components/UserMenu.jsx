import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  House, ListChecks, Stethoscope, ChartColumn, Settings,
  ShieldCheck, CircleUserRound, Sun, Moon, Languages, Crown, LogOut, Menu, X,
} from 'lucide-react';
import { useClerk } from '@clerk/react';
import { useSound } from '../context/SoundContext';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ECOS_YEARS } from '../constants';
import { API_BASE_URL, fetchWithAuth } from '../config/api';
import { usePageTransition } from '../context/pageTransition';
import '../styles/userMenu.css';

const readStorage = (key) => { try { return localStorage.getItem(key); } catch { return null; } };

const UserMenu = () => {
  const play = useSound();
  const { t, lang, setLang } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();
  const clerk = useClerk();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { start } = usePageTransition();

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const fabRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);

  const userDiscipline = readStorage('userDiscipline');
  const userYear = readStorage('userYear');
  const userRole = readStorage('userRole');
  const userName = readStorage('userName') || '';

  const navItems = [
    { label: t('nav.home'), path: '/dashboard', icon: <House size={18} /> },
    { label: t('nav.qcmExams'), path: '/quizPage', icon: <ListChecks size={18} /> },
    ...(userDiscipline === 'medicine' && ECOS_YEARS.includes(userYear)
      ? [{ label: t('nav.ecos'), path: '/voice-exams', icon: <Stethoscope size={18} /> }]
      : []),
    { label: t('nav.stats'), path: '/review', icon: <ChartColumn size={18} /> },
    { label: t('nav.settings'), path: '/profile', icon: <Settings size={18} /> },
    ...(userRole === 'admin'
      ? [{ label: t('nav.adminPanel'), path: '/admin/dashboard', icon: <ShieldCheck size={18} /> }]
      : []),
  ];

  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    try { await fetchWithAuth(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' }); } catch { /* best-effort */ }
    try { localStorage.removeItem('userId'); } catch {}
    try { sessionStorage.removeItem('synced'); } catch {}
    clerk.signOut();
    navigate('/login');
  };

  // Esc and outside click close the bar.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') close(); };
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  // Focus management: the first action on open, the trigger on close.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      fabRef.current?.focus();
    }
  }, [open]);

  return (
    <div ref={rootRef} className="umenu-root">
      {open ? (
        <div id="user-menu-bar" className="umenu-bar" role="toolbar" aria-label={t('menu.title')}>
          <button
            ref={closeRef}
            type="button"
            className="umenu-icon-btn umenu-close"
            onClick={close}
            title={t('menu.close')}
            aria-label={t('menu.close')}
          >
            <X size={18} />
          </button>

          <span className="umenu-divider" aria-hidden="true" />

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              title={item.label}
              aria-label={item.label}
              onClick={(e) => {
                if (item.path !== pathname) start(e.currentTarget);
                play('navigate');
              }}
              className={({ isActive }) => `umenu-icon-btn${isActive ? ' active' : ''}`}
            >
              {item.icon}
            </NavLink>
          ))}

          <span className="umenu-divider" aria-hidden="true" />

          <button
            type="button"
            className="umenu-icon-btn"
            onClick={(e) => {
              if (pathname !== '/profile') start(e.currentTarget);
              play('navigate');
              navigate('/profile');
            }}
            title={userName || t('topbar.user')}
            aria-label={userName || t('topbar.user')}
          >
            <CircleUserRound size={18} />
          </button>

          <button
            type="button"
            className="umenu-icon-btn"
            onClick={toggleDarkMode}
            title={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
            aria-label={darkMode ? t('nav.lightMode') : t('nav.darkMode')}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className="umenu-icon-btn"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            title={t('nav.language')}
            aria-label={t('nav.language')}
          >
            <Languages size={18} />
          </button>

          <button
            type="button"
            className="umenu-icon-btn umenu-premium-icon"
            onClick={(e) => {
              if (pathname !== '/pricing') start(e.currentTarget);
              play('navigate');
              navigate('/pricing');
            }}
            title={t('nav.premium')}
            aria-label={t('nav.premium')}
          >
            <Crown size={18} />
          </button>

          <button
            type="button"
            className="umenu-icon-btn"
            onClick={handleLogout}
            title={t('nav.logout')}
            aria-label={t('nav.logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <button
          ref={fabRef}
          type="button"
          className="umenu-fab"
          onClick={() => { play('navigate'); setOpen(true); }}
          aria-expanded={false}
          aria-controls="user-menu-bar"
          aria-label={t('menu.open')}
        >
          <Menu size={18} />
          <span>{t('menu.open')}</span>
        </button>
      )}
    </div>
  );
};

export default UserMenu;
