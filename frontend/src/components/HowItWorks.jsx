import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, TrendingUp, UserPlus } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const STEPS = [
  { n: 1, Icon: UserPlus },
  { n: 2, Icon: ClipboardList },
  { n: 3, Icon: TrendingUp },
];

export default function HowItWorks() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="landing-steps" id="etapes">
      <div className="landing-section-head landing-section-head--center reveal">
        <h2>{t('landing.steps.title')}</h2>
        <p>{t('landing.steps.desc')}</p>
      </div>

      <div className="landing-steps-grid">
        {STEPS.map(({ n, Icon }) => (
          <div className="landing-step reveal" key={n}>
            <div className="landing-step-top">
              <span className="landing-step-num">{n}</span>
              <span className="landing-step-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
            </div>
            <h3>{t(`landing.steps.${n}.title`)}</h3>
            <p>{t(`landing.steps.${n}.desc`)}</p>
          </div>
        ))}
      </div>

      <button className="landing-btn-primary landing-steps-cta" onClick={() => navigate('/signup')}>
        {t('landing.steps.cta')}
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </section>
  );
}
