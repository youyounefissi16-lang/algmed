import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import BrandLogo from './BrandLogo';

const POINTS = [
  'login.feature.questions',
  'login.feature.ecos',
  'login.feature.explanations',
  'login.feature.tracking',
];

/*
 * Shared shell for the sign-in / sign-up screens: a navy editorial statement
 * on the left, the Clerk form on the right. Below 900px the statement is
 * dropped and the form takes the full width.
 */
export default function AuthLayout({ title, subtitle, children }) {
  const { t } = useTranslation();

  return (
    <div className="login-page page-teal">
      <aside className="auth-aside" aria-hidden="true">
        <Link to="/" className="auth-brand">
          <BrandLogo width={30} height={20} />
          <span className="auth-brand-name">algmed</span>
        </Link>

        <div className="auth-aside-body">
          <span className="auth-eyebrow">{t('auth.eyebrow')}</span>
          <h2 className="auth-headline">
            {t('landing.hero.heading')} <em>algmed.</em>
          </h2>
          <ul className="auth-points">
            {POINTS.map((key) => (
              <li key={key}>
                <Check size={15} strokeWidth={2.2} aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-aside-foot">© {new Date().getFullYear()} algmed</p>
      </aside>

      <main className="auth-main">
        <div className="login-card">
          <div className="auth-topline">
            <Link to="/" className="auth-mobile-brand">
              <BrandLogo width={28} height={18} />
              <span className="auth-brand-name">algmed</span>
            </Link>
            <Link to="/" className="auth-back">
              ← {t('notFound.back')}
            </Link>
          </div>

          <div className="auth-head">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-sub">{subtitle}</p>
          </div>

          <div className="login-form">{children}</div>
        </div>
      </main>
    </div>
  );
}
