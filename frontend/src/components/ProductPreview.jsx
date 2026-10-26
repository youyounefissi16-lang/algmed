import { Check } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function ProductPreview() {
  const { t } = useTranslation();

  return (
    <section className="landing-preview" id="apercu">
      <div className="landing-preview-visual reveal">
        <div className="landing-window">
          <div className="landing-window-bar">
            <span />
            <span />
            <span />
          </div>
          <img
            src="/marketing/dashboard.png"
            alt={t('landing.preview.imageAlt')}
            width="1882"
            height="885"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="landing-preview-copy reveal">
        <span className="landing-eyebrow-quiet">{t('landing.preview.eyebrow')}</span>
        <h2>{t('landing.preview.title')}</h2>
        <p>{t('landing.preview.desc')}</p>
        <ul className="landing-check-list">
          {[1, 2, 3, 4].map((n) => (
            <li key={n}>
              <Check size={16} aria-hidden="true" />
              {t(`landing.preview.b${n}`)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
