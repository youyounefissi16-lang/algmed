import { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function FaqSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="landing-faq" id="faq">
      <div className="landing-section-head reveal">
        <h2>{t('landing.faq.title')}</h2>
        <p>{t('landing.faq.subtitle')}</p>
      </div>

      <div className="landing-faq-list">
        {FAQ_KEYS.map((n, i) => (
          <div className={`landing-faq-item${openIndex === i ? ' open' : ''}`} key={n}>
            <button className="landing-faq-q" onClick={() => toggle(i)} aria-expanded={openIndex === i} aria-controls={`faq-a-${n}`}>
              <span>{t(`landing.faq.q${n}.q`)}</span>
              <span className="landing-plus"></span>
            </button>
            <div className="landing-faq-a" id={`faq-a-${n}`} style={{ maxHeight: openIndex === i ? '1000px' : '0' }}>
              <p>{t(`landing.faq.q${n}.a`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
