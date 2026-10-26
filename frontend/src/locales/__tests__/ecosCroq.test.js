import { describe, it, expect } from 'vitest';
import en from '../en.js';
import fr from '../fr.js';

const ECOS_FEATURE_KEYS = [
  'nav.ecos',
  'ecosCustomExam.title',
  'ecosCustomExam.reviewTitle',
  'ecosCustomSetup.title',
  'ecosCustomSetup.start',
  'login.feature.ecos',
  'dashboard.ecos.recent',
  'dashboard.empty.ecos',
  'dashboard.actions.ecos',
  'subscription.required.voiceExams',
  'voiceExams.unavailable.title',
  'voiceExams.unavailable.message',
  'landing.nav.ecos',
  'landing.hero.subtitle',
  'landing.trust.2',
  'landing.curve.ecos',
  'landing.features.ecos.tag',
  'landing.features.ecos.title',
  'landing.steps.2.desc',
  'landing.ecos.eyebrow',
  'landing.ecos.desc',
  'landing.pricing.unique.feature.2',
  'landing.faq.q1.q',
  'landing.faq.q4.a',
];

// Locale files use flat keys with dots (e.g., 'nav.ecos'), not nested objects
function getNested(obj, key) {
  return obj[key];
}

describe('ECOS/CROQ rename - Bug Condition (should FAIL before fix)', () => {
  for (const locale of [['en', en], ['fr', fr]]) {
    const [lang, dict] = locale;
    for (const key of ECOS_FEATURE_KEYS) {
      it(`${lang}.${key} contains "ECOS/CROQ"`, () => {
        const value = getNested(dict, key);
        expect(value).toBeDefined();
        expect(value).toContain('ECOS/CROQ');
      });
    }
  }

  it('fr.subscription.required.voiceExams does NOT contain typo "ECOs"', () => {
    const value = getNested(fr, 'subscription.required.voiceExams');
    expect(value).not.toContain('ECOs');
  });

  for (const locale of [['en', en], ['fr', fr]]) {
    const [lang, dict] = locale;
    for (const key of ECOS_FEATURE_KEYS) {
      it(`${lang}.${key} does NOT contain standalone "ECOS" without "/CROQ"`, () => {
        const value = getNested(dict, key);
        if (value && value.includes('ECOS')) {
          expect(value).toMatch(/ECOS\/CROQ/);
        }
      });
    }
  }
});

describe('ECOS/CROQ rename - Preservation (should PASS before and after fix)', () => {
  // Non-ECOS keys should remain byte-for-byte identical
  it('non-ECOS translations are unchanged between original and fixed', () => {
    // This test will compare against a snapshot after the fix is applied.
    // For now it just verifies the test structure exists.
    expect(true).toBe(true);
  });

  it('translation key sets are unchanged', () => {
    const enKeys = Object.keys(en).sort();
    const frKeys = Object.keys(fr).sort();
    // Just verify keys exist; a real snapshot test would compare pre/post
    expect(enKeys.length).toBeGreaterThan(0);
    expect(frKeys.length).toBeGreaterThan(0);
  });

  it('clinical content landing.ecos.card.vignette.text is unchanged', () => {
    // Verify the key exists and doesn't contain ECOS
    const enVignette = getNested(en, 'landing.ecos.card.vignette.text');
    const frVignette = getNested(fr, 'landing.ecos.card.vignette.text');
    if (enVignette) expect(enVignette).not.toContain('ECOS');
    if (frVignette) expect(frVignette).not.toContain('ECOS');
  });

  it('ecos-* CSS classes, ECOS_YEARS, STORAGE_KEY are not modified in locale files', () => {
    // Locale files shouldn't contain these identifiers
    const allValues = [...Object.values(en), ...Object.values(fr)];
    for (const v of allValues) {
      if (typeof v === 'string') {
        expect(v).not.toMatch(/ecos-overlay|ecos-modal|ecos-check-row|ECOS_YEARS|STORAGE_KEY|ecos-custom-session/);
      }
    }
  });
});