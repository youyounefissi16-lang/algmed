import { useNavigate } from 'react-router-dom';
import { Check, Play } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import LandingNav from './LandingNav';

const QCM_OPTIONS = ['A', 'B', 'C', 'D'];

export default function HomeHero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="landing-hero">
      <LandingNav />

      <div className="landing-hero-grid">
        <div className="landing-hero-copy">
          <h1 className="landing-h1">
            {t('landing.hero.heading')} <span className="hl-accent">algmed.</span>
          </h1>

          <p className="landing-hero-sub">{t('landing.hero.subtitle')}</p>

          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={() => navigate('/signup')}>
              {t('landing.hero.cta')}
            </button>
            <button
              className="landing-btn-secondary"
              onClick={() => {
                const el = document.getElementById('apercu');
                if (!el) return;
                const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
              }}
            >
              <span className="landing-play-ring">
                <Play size={11} fill="currentColor" aria-hidden="true" />
              </span>
              {t('landing.hero.secondary')}
            </button>
          </div>

          <ul className="landing-trust">
            {[1, 2, 3, 4].map((n) => (
              <li className="landing-trust-item" key={n}>
                <Check size={15} aria-hidden="true" />
                {t(`landing.trust.${n}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-hero-photo-wrap">
            <img
              className="landing-hero-photo"
              src="/marketing/hero.jpg"
              alt={t('landing.hero.imageAlt')}
              width="1200"
              height="900"
              loading="eager"
            />
          </div>

          <div className="landing-float landing-float--qcm" aria-hidden="true">
            <div className="landing-float-head">
              <span className="landing-float-dot" />
              {t('landing.hero.qcm.title')}
              <span className="landing-float-live">LIVE</span>
            </div>
            {QCM_OPTIONS.map((letter, i) => (
              <div className={`landing-option${i === 1 ? ' is-selected' : ''}`} key={letter}>
                <span className="landing-option-radio" />
                {t('landing.hero.qcm.option')} {letter}
              </div>
            ))}
          </div>

          <div className="landing-float landing-float--ecg" aria-hidden="true">
            <div className="landing-float-head">
              <span className="landing-float-dot" />
              {t('landing.hero.ecg.title')}
            </div>
            <svg className="landing-ecg-line" viewBox="0 0 160 46" aria-hidden="true">
              <path
                d="M0 30 H18 l6 -14 l7 26 l6 -34 l7 22 H72 l8 -6 h14 l5 10 l6 -18 l7 14 H160"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="landing-float-meta">
              <span>{t('landing.hero.ecg.label')}</span>
              <strong>72 bpm</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
