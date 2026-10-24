# Rename ECOS to ECOS/CROQ Bugfix Design

## Overview

The algmed platform's clinical simulation feature is labeled "ECOS" throughout the user-facing interface. This label should be "ECOS/CROQ" to reflect both exam types (ECOS and CROQ) that the feature covers. The bug affects all user-facing text managed through the locale system (`en.js` and `fr.js`), spanning navigation labels, login feature descriptions, dashboard actions, subscription messages, exam setup screens, voice exam availability messages, and the landing page (hero, trust badges, curve labels, features, steps, ECOS section, pricing, and FAQ).

The fix is purely a locale string value change: every translation string value that contains "ECOS" as a feature label must be updated to "ECOS/CROQ". Translation keys, CSS class names, internal constants (e.g., `ecos-overlay`, `ECOS_YEARS`), and component code must remain completely unchanged. The French locale also contains a typo ("ECOs" with a lowercase s) in the subscription message that must be corrected.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — a locale translation entry whose value contains "ECOS" as a feature label but does not contain "ECOS/CROQ"
- **Property (P)**: The desired behavior — locale translation values SHALL contain "ECOS/CROQ" wherever "ECOS" appeared as a feature label
- **Preservation**: Existing behavior for non-ECOS strings, translation keys, CSS classes, internal constants, and clinical content that must remain unchanged by the fix
- **translate(key, locale)**: The locale lookup function in the i18n system that returns a translated string for a given key and language
- **localeFile[locale]**: The JavaScript object exported by `en.js` (locale='en') or `fr.js` (locale='fr') containing key-value translation pairs
- **Feature label**: User-facing text that names or describes the ECOS/CROQ simulation feature (e.g., "ECOS Simulator", "ECOS preparation"), as opposed to clinical content where "ECOS" may appear as a medical term
- **ECOs typo**: The French locale entry `subscription.required.voiceExams` contains "ECOs" with a lowercase 's' instead of "ECOS" — this must be corrected to "ECOS/CROQ"

## Bug Details

### Bug Condition

The bug manifests when a user views any part of the interface that displays a translation string containing "ECOS" as a feature label. The locale system (`en.js` and `fr.js`) returns the untranslated label "ECOS" instead of the correct "ECOS/CROQ". This affects navigation, dashboard, login, exam setup, subscription messages, voice exam availability messages, and the entire landing page.

**Formal Specification:**
```
FUNCTION isBugCondition(key, locale)
  INPUT: key of type string (translation key), locale of type string ('en' | 'fr')
  OUTPUT: boolean

  value := localeFile[locale][key]

  RETURN key EXISTS IN localeFile[locale]
         AND (value CONTAINS "ECOS" OR value CONTAINS "ECOs")
         AND NOT value CONTAINS "ECOS/CROQ"
         AND key NOT IN clinicalContentKeys
END FUNCTION
```

Where `clinicalContentKeys` is the set of translation keys whose values contain clinical/medical content rather than feature labels (e.g., patient vignette text). In the current locale files, the patient vignette (`landing.ecos.card.vignette.text`) does not contain "ECOS", so no keys are excluded by this condition in practice.

### Examples

- **Navigation label (en)**: `nav.ecos` = "ECOS Simulator" → should be "ECOS/CROQ Simulator"
- **Navigation label (fr)**: `nav.ecos` = "Simulateur ECOS" → should be "Simulateur ECOS/CROQ"
- **Login feature (en)**: `login.feature.ecos` = "ECOS exam simulation" → should be "ECOS/CROQ exam simulation"
- **Subscription message (fr, with typo)**: `subscription.required.voiceExams` = "Un abonnement est requis pour accéder aux ECOs." → should be "Un abonnement est requis pour accéder aux ECOS/CROQ."
- **Landing nav (en/fr)**: `landing.nav.ecos` = "ECOS" → should be "ECOS/CROQ"
- **Landing FAQ question (en)**: `landing.faq.q1.q` = "What is an ECOS simulation on algmed?" → should be "What is an ECOS/CROQ simulation on algmed?"
- **Landing FAQ answer (en)**: `landing.faq.q4.a` = "...MCQs, ECOS simulations and progress tracking..." → should be "...MCQs, ECOS/CROQ simulations and progress tracking..."
- **Edge case - clinical content**: `landing.ecos.card.vignette.text` = "54-year-old patient, chest pain..." — no "ECOS" present, correctly excluded from changes

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All translation keys (e.g., `nav.ecos`, `ecosCustomExam.title`, `landing.ecos.eyebrow`) must remain exactly as before — only the string values change
- CSS classes prefixed with "ecos-" (e.g., `ecos-overlay`, `ecos-modal`, `ecos-check-row`) must continue to apply the same styling
- Internal constants such as `ECOS_YEARS` and the `STORAGE_KEY = 'ecos-custom-session'` identifier must continue to function with the same internal names
- All non-ECOS features (MCQs, mock exams, voice exams, profile, pricing, admin panel, etc.) must behave exactly as before with no changes to labels, navigation, or functionality
- Any text that mentions "ECOS" as part of a clinical or medical term in non-feature contexts (e.g., within clinical case descriptions, patient vignettes) must remain unchanged

**Scope:**
All locale entries that do NOT contain "ECOS" as a feature label should be completely unaffected by this fix. This includes:
- All translation entries whose values do not contain "ECOS" or "ECOs"
- All CSS class names and identifiers in component code
- All internal JavaScript constants and storage keys
- All clinical content strings (patient vignettes, clinical case descriptions)

## Hypothesized Root Cause

Based on the bug description, the root cause is straightforward:

1. **Incomplete Feature Label**: The clinical simulation feature covers two exam types (ECOS and CROQ), but the locale strings only mention "ECOS". This was likely an oversight when the locale strings were originally written, before CROQ was added as a covered exam type.
   - Affects 24 translation entries in `en.js` and 24 in `fr.js`
   - The "ECOS" label appears across navigation, dashboard, login, exam setup, subscription, voice exam, and landing page sections

2. **French Typo**: The French locale entry `subscription.required.voiceExams` contains "ECOs" with a lowercase 's' instead of "ECOS". This is a pre-existing typo that should be corrected alongside the rename.
   - Located at line 610 of `fr.js`
   - The value is "Un abonnement est requis pour accéder aux ECOs. Abonnez-vous pour débloquer tout le contenu."

3. **No Code-Level Issue**: The bug is purely a content/labeling issue in the locale files. No component code, routing logic, or i18n infrastructure needs to change. The translation keys are correctly wired to components — only the translated values are wrong.

## Correctness Properties

Property 1: Bug Condition - ECOS Feature Labels Show ECOS/CROQ

_For any_ locale entry (key, locale) where the bug condition holds (isBugCondition returns true — the value contains "ECOS" or "ECOs" as a feature label but not "ECOS/CROQ"), the fixed locale file SHALL produce a value containing "ECOS/CROQ" and SHALL NOT contain standalone "ECOS" (without "/CROQ") or the typo "ECOs".

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16**

Property 2: Preservation - Non-ECOS Locale Entries and Internal Identifiers Unchanged

_For any_ locale entry (key, locale) where the bug condition does NOT hold (isBugCondition returns false — the value does not contain "ECOS" as a feature label), the fixed locale file SHALL produce exactly the same value as the original locale file, preserving all existing translations for non-ECOS features. Additionally, all translation keys, CSS class names, internal constants, and clinical content SHALL remain identical to the original.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix involves updating translation string values in exactly two files:

**File**: `frontend/src/locales/en.js`

**Specific Changes** (value-only updates, keys unchanged):
1. **Navigation**: `nav.ecos`: "ECOS Simulator" → "ECOS/CROQ Simulator"
2. **ECOS Custom Exam**: `ecosCustomExam.title`: "Personalized ECOS Exam" → "Personalized ECOS/CROQ Exam"
3. **ECOS Custom Exam**: `ecosCustomExam.reviewTitle`: "ECOS Exam Complete" → "ECOS/CROQ Exam Complete"
4. **ECOS Custom Setup**: `ecosCustomSetup.title`: "Personalized ECOS" → "Personalized ECOS/CROQ"
5. **ECOS Custom Setup**: `ecosCustomSetup.start`: "Start ECOS" → "Start ECOS/CROQ"
6. **Login**: `login.feature.ecos`: "ECOS exam simulation" → "ECOS/CROQ exam simulation"
7. **Dashboard**: `dashboard.ecos.recent`: "Recent ECOS Training" → "Recent ECOS/CROQ Training"
8. **Dashboard**: `dashboard.empty.ecos`: "No recent ECOS training" → "No recent ECOS/CROQ training"
9. **Dashboard**: `dashboard.actions.ecos`: "ECOS Simulator" → "ECOS/CROQ Simulator"
10. **Subscription**: `subscription.required.voiceExams`: "A subscription is required to access ECOS." → "A subscription is required to access ECOS/CROQ."
11. **Voice Exam**: `voiceExams.unavailable.title`: "ECOS is for medicine students" → "ECOS/CROQ is for medicine students"
12. **Voice Exam**: `voiceExams.unavailable.message`: "ECOS simulations are available..." → "ECOS/CROQ simulations are available..."
13. **Landing Nav**: `landing.nav.ecos`: "ECOS" → "ECOS/CROQ"
14. **Landing Hero**: `landing.hero.subtitle`: "timed ECOS simulations" → "timed ECOS/CROQ simulations"
15. **Landing Trust**: `landing.trust.2`: "ECOS preparation" → "ECOS/CROQ preparation"
16. **Landing Curve**: `landing.curve.ecos`: "ECOS simulations" → "ECOS/CROQ simulations"
17. **Landing Features**: `landing.features.ecos.tag`: "ECOS Simulations" → "ECOS/CROQ Simulations"
18. **Landing Features**: `landing.features.ecos.title`: "ECOS preparation" → "ECOS/CROQ preparation"
19. **Landing Steps**: `landing.steps.2.desc`: "MCQs and ECOS resources" → "MCQs and ECOS/CROQ resources"
20. **Landing ECOS**: `landing.ecos.eyebrow`: "ECOS Simulation" → "ECOS/CROQ Simulation"
21. **Landing ECOS**: `landing.ecos.desc`: "a real ECOS station" → "a real ECOS/CROQ station"
22. **Landing Pricing**: `landing.pricing.unique.feature.2`: "Unlimited ECOS simulations" → "Unlimited ECOS/CROQ simulations"
23. **Landing FAQ**: `landing.faq.q1.q`: "What is an ECOS simulation on algmed?" → "What is an ECOS/CROQ simulation on algmed?"
24. **Landing FAQ**: `landing.faq.q4.a`: "...ECOS simulations..." → "...ECOS/CROQ simulations..."

**File**: `frontend/src/locales/fr.js`

**Specific Changes** (value-only updates, keys unchanged):
1. **Navigation**: `nav.ecos`: "Simulateur ECOS" → "Simulateur ECOS/CROQ"
2. **ECOS Custom Exam**: `ecosCustomExam.title`: "Examen ECOS personnalisé" → "Examen ECOS/CROQ personnalisé"
3. **ECOS Custom Exam**: `ecosCustomExam.reviewTitle`: "Examen ECOS terminé" → "Examen ECOS/CROQ terminé"
4. **ECOS Custom Setup**: `ecosCustomSetup.title`: "ECOS Personnalisé" → "ECOS/CROQ Personnalisé"
5. **ECOS Custom Setup**: `ecosCustomSetup.start`: "Démarrer l'ECOS" → "Démarrer l'ECOS/CROQ"
6. **Login**: `login.feature.ecos`: "Simulation d'examen ECOS" → "Simulation d'examen ECOS/CROQ"
7. **Dashboard**: `dashboard.ecos.recent`: "Derniers entraînements ECOS" → "Derniers entraînements ECOS/CROQ"
8. **Dashboard**: `dashboard.empty.ecos`: "Aucun entraînement ECOS récent" → "Aucun entraînement ECOS/CROQ récent"
9. **Dashboard**: `dashboard.actions.ecos`: "Simulateur ECOS" → "Simulateur ECOS/CROQ"
10. **Subscription (typo fix)**: `subscription.required.voiceExams`: "Un abonnement est requis pour accéder aux ECOs." → "Un abonnement est requis pour accéder aux ECOS/CROQ."
11. **Voice Exam**: `voiceExams.unavailable.title`: "ECOS est réservé aux étudiants en médecine" → "ECOS/CROQ est réservé aux étudiants en médecine"
12. **Voice Exam**: `voiceExams.unavailable.message`: "Les simulations ECOS sont disponibles..." → "Les simulations ECOS/CROQ sont disponibles..."
13. **Landing Nav**: `landing.nav.ecos`: "ECOS" → "ECOS/CROQ"
14. **Landing Hero**: `landing.hero.subtitle`: "simulations ECOS chronométrées" → "simulations ECOS/CROQ chronométrées"
15. **Landing Trust**: `landing.trust.2`: "Préparation ECOS" → "Préparation ECOS/CROQ"
16. **Landing Curve**: `landing.curve.ecos`: "simulations ECOS" → "simulations ECOS/CROQ"
17. **Landing Features**: `landing.features.ecos.tag`: "Simulations ECOS" → "Simulations ECOS/CROQ"
18. **Landing Features**: `landing.features.ecos.title`: "Préparation aux ECOS" → "Préparation aux ECOS/CROQ"
19. **Landing Steps**: `landing.steps.2.desc`: "les ressources ECOS" → "les ressources ECOS/CROQ"
20. **Landing ECOS**: `landing.ecos.eyebrow`: "La simulation ECOS" → "La simulation ECOS/CROQ"
21. **Landing ECOS**: `landing.ecos.desc`: "une station ECOS réelle" → "une station ECOS/CROQ réelle"
22. **Landing Pricing**: `landing.pricing.unique.feature.2`: "Simulations ECOS illimitées" → "Simulations ECOS/CROQ illimitées"
23. **Landing FAQ**: `landing.faq.q1.q`: "Qu'est-ce qu'une simulation ECOS sur algmed ?" → "Qu'est-ce qu'une simulation ECOS/CROQ sur algmed ?"
24. **Landing FAQ**: `landing.faq.q4.a`: "simulations ECOS" → "simulations ECOS/CROQ"

**Files NOT to modify**:
- Any component files (`.jsx`, `.tsx`, `.js` in `frontend/src/`) — these reference translation keys, not values
- Any CSS/SCSS files — class names like `ecos-overlay` must remain
- Any backend files — internal constants like `ECOS_YEARS` must remain

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior. Since this is a locale string value change (not a logic change), testing focuses on asserting string content in the locale files.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that import the locale objects from `en.js` and `fr.js` and assert that specific translation values contain "ECOS/CROQ" where expected. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Navigation Test**: Assert `en.nav.ecos` contains "ECOS/CROQ" and `fr.nav.ecos` contains "ECOS/CROQ" (will fail on unfixed code)
2. **Login Feature Test**: Assert `en.login.feature.ecos` contains "ECOS/CROQ" and `fr.login.feature.ecos` contains "ECOS/CROQ" (will fail on unfixed code)
3. **Dashboard Test**: Assert `en.dashboard.ecos.recent`, `en.dashboard.empty.ecos`, `en.dashboard.actions.ecos` contain "ECOS/CROQ" (will fail on unfixed code)
4. **French Typo Test**: Assert `fr.subscription.required.voiceExams` does NOT contain "ECOs" (lowercase s) and DOES contain "ECOS/CROQ" (will fail on unfixed code — contains "ECOs" typo)
5. **Landing Page Test**: Assert `en.landing.nav.ecos`, `en.landing.hero.subtitle`, `en.landing.ecos.eyebrow` contain "ECOS/CROQ" (will fail on unfixed code)

**Expected Counterexamples**:
- All assertions fail because locale values contain "ECOS" instead of "ECOS/CROQ"
- French subscription message additionally contains the "ECOs" typo
- Possible causes: locale strings were written before CROQ was added as a covered exam type

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL (key, locale) WHERE isBugCondition(key, locale) DO
  value := localeFile_fixed[locale][key]
  ASSERT value CONTAINS "ECOS/CROQ"
  ASSERT NOT value CONTAINS "ECOs"  // French typo check
  ASSERT NOT (value CONTAINS "ECOS" AND NOT value CONTAINS "ECOS/CROQ")
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL (key, locale) WHERE NOT isBugCondition(key, locale) DO
  ASSERT localeFile_original[locale][key] = localeFile_fixed[locale][key]
END FOR

// Additional preservation checks
ASSERT setOfKeys(localeFile_original['en']) = setOfKeys(localeFile_fixed['en'])
ASSERT setOfKeys(localeFile_original['fr']) = setOfKeys(localeFile_fixed['fr'])
ASSERT no CSS class names changed in component code
ASSERT no internal constants changed (ECOS_YEARS, STORAGE_KEY, etc.)
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the entire locale key domain
- It catches edge cases that manual unit tests might miss (e.g., a non-ECOS string accidentally modified)
- It provides strong guarantees that all non-buggy translations are unchanged

**Test Plan**: Observe behavior on UNFIXED code first for non-ECOS strings, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Non-ECOS String Preservation**: For every locale entry whose value does not contain "ECOS", assert the fixed value equals the original value
2. **Key Set Preservation**: Assert the set of translation keys in the fixed files is identical to the original files (no keys added, removed, or renamed)
3. **Clinical Content Preservation**: Assert `landing.ecos.card.vignette.text` is unchanged (clinical content, not a feature label)
4. **CSS Class Preservation**: Assert component code still references `ecos-overlay`, `ecos-modal`, `ecos-check-row` class names
5. **Internal Constant Preservation**: Assert `ECOS_YEARS` and `STORAGE_KEY = 'ecos-custom-session'` are unchanged in source code

### Unit Tests

- Test that each of the 24 modified entries in `en.js` contains "ECOS/CROQ"
- Test that each of the 24 modified entries in `fr.js` contains "ECOS/CROQ"
- Test that `fr.subscription.required.voiceExams` does NOT contain "ECOs" (typo fix)
- Test that no locale entry contains standalone "ECOS" without "/CROQ" (for feature-label keys)
- Test that translation key sets are unchanged between original and fixed files

### Property-Based Tests

- Generate random locale entries and verify: if the original value contained "ECOS" as a feature label, the fixed value contains "ECOS/CROQ"; otherwise, the value is unchanged
- Generate random keys from the locale files and verify they exist in both original and fixed versions with the same key set
- Generate random non-ECOS feature strings (MCQ, mock exam, voice exam, profile, etc.) and verify they are byte-for-byte identical between original and fixed files

### Integration Tests

- Test that the i18n system correctly resolves `nav.ecos` to a string containing "ECOS/CROQ" for both locales
- Test that the landing page renders "ECOS/CROQ" in the hero subtitle, trust badges, features section, ECOS section, pricing, and FAQ for both locales
- Test that the dashboard renders "ECOS/CROQ Simulator" in quick actions and "Recent ECOS/CROQ Training" in recent activity for both locales
- Test that the subscription wall displays "ECOS/CROQ" in the message for both locales, and that the French version no longer contains the "ECOs" typo
