import { Brain, Check, ClipboardList, LineChart } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const FEATURES = [
  { key: 'qcm', Icon: Brain },
  { key: 'ecos', Icon: ClipboardList },
  { key: 'tracking', Icon: LineChart },
];

export default function FeatureStrip() {
  const { t } = useTranslation();

  return (
    <section className="landing-strip" id="comment-ca-marche">
      <div className="landing-section-head reveal">
        <h2>{t('landing.features.title')}</h2>
        <p>{t('landing.features.subtitle')}</p>
      </div>

      <div className="landing-strip-grid">
        {FEATURES.map(({ key, Icon }) => (
          <article className="landing-strip-item reveal" key={key}>
            <div className="landing-strip-icon" aria-hidden="true">
              <Icon size={24} />
            </div>
            <h3>{t(`landing.features.${key}.title`)}</h3>
            <ul className="landing-feature-list">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Check size={14} aria-hidden="true" />
                  {t(`landing.features.${key}.b${n}`)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
