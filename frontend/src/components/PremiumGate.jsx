import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { Lock, Check, ArrowRight } from 'lucide-react';
import '../styles/premiumGate.css';

const PremiumGate = ({
  mode = 'qcm',
  moduleName = null,
  teaser = null,
  loadingTeaser = false,
  onSecondary = null,
  onTertiary = null,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSecondary = () => {
    if (onSecondary) {
      onSecondary();
    } else {
      navigate('/dashboard');
    }
  };

  const handleTertiary = () => {
    if (onTertiary) {
      onTertiary();
    } else {
      navigate('/pricing', { hash: 'redeem' });
    }
  };

  const config = {
    qcm: {
      eyebrow: t('premiumGate.qcm.eyebrow'),
      title: t('premiumGate.qcm.title'),
      description: t('premiumGate.qcm.description'),
      benefits: [
        t('premiumGate.qcm.benefit1'),
        t('premiumGate.qcm.benefit2'),
        t('premiumGate.qcm.benefit3'),
        t('premiumGate.qcm.benefit4'),
      ],
    },
    ecos: {
      eyebrow: t('premiumGate.ecos.eyebrow'),
      title: t('premiumGate.ecos.title'),
      description: t('premiumGate.ecos.description'),
      benefits: [
        t('premiumGate.ecos.benefit1'),
        t('premiumGate.ecos.benefit2'),
        t('premiumGate.ecos.benefit3'),
      ],
    },
  }[mode];

  const title = moduleName
    ? t('premiumGate.qcm.titleModule', { module: moduleName })
    : config.title;

  const description = moduleName
    ? t('premiumGate.qcm.descriptionModule', { module: moduleName })
    : config.description;

  const renderTeaser = () => {
    if (!teaser && !loadingTeaser) return null;
    if (loadingTeaser) {
      return (
        <aside className="premium-gate-teaser" aria-hidden="true">
          <span className="premium-gate-teaser-title">{t('premiumGate.teaserTitle')}</span>
          <div className="premium-gate-chips">
            <span className="premium-gate-chip skeleton" />
            <span className="premium-gate-chip skeleton" />
            <span className="premium-gate-chip skeleton" />
            <span className="premium-gate-chip skeleton" />
          </div>
          <p className="premium-gate-teaser-stat skeleton" />
        </aside>
      );
    }

    const { items = [], more = 0, stat = null } = teaser;
    return (
      <aside className="premium-gate-teaser" aria-hidden="true">
        <span className="premium-gate-teaser-title">{t('premiumGate.teaserTitle')}</span>
        <div className="premium-gate-chips">
          {items.slice(0, 4).map((item, i) => (
            <span key={i} className="premium-gate-chip">
              {item}
              <span className="premium-gate-lock" aria-hidden="true">
                <Lock size={10} />
              </span>
            </span>
          ))}
          {more > 0 && (
            <span className="premium-gate-chip premium-gate-more">
              +{more} {t('premiumGate.more')}
            </span>
          )}
        </div>
        {stat && <p className="premium-gate-teaser-stat">{stat}</p>}
      </aside>
    );
  };

  return (
    <section className="premium-gate" aria-labelledby="premium-gate-title">
      <div className="premium-gate-copy">
        <span className="premium-gate-eyebrow">
          <Lock className="premium-gate-icon" aria-hidden="true" size={16} />
          {config.eyebrow}
        </span>
        <h2 id="premium-gate-title">{title}</h2>
        <p>{description}</p>
        <ul className="premium-gate-benefits">
          {config.benefits.map((benefit, i) => (
            <li key={i}>
              <Check className="premium-gate-check" aria-hidden="true" size={16} />
              {benefit}
            </li>
          ))}
        </ul>
        <div className="premium-gate-actions">
          <button
            className="btn-primary premium-gate-primary"
            onClick={() => navigate('/pricing')}
          >
            {t('premiumGate.primaryCta')}
            <ArrowRight className="premium-gate-arrow" aria-hidden="true" size={16} />
          </button>
          <button
            className="btn-ghost premium-gate-secondary"
            onClick={handleSecondary}
          >
            {t('premiumGate.secondaryCta')}
          </button>
        </div>
        <p className="premium-gate-reassurance">
          {t('premiumGate.reassurance')}
        </p>
        {onTertiary && (
          <button
            className="premium-gate-tertiary"
            onClick={handleTertiary}
          >
            {t('premiumGate.tertiaryCta')}
          </button>
        )}
      </div>
      {renderTeaser()}
    </section>
  );
};

export default PremiumGate;