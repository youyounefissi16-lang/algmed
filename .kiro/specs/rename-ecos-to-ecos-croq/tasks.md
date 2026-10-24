# Implementation Plan

## Overview

This bugfix renames all user-facing "ECOS" feature labels to "ECOS/CROQ" in the locale files (`en.js` and `fr.js`). The fix involves 24 string value changes in each locale file. The French locale also contains a typo "ECOs" (lowercase s) that must be corrected to "ECOS/CROQ". Translation keys, CSS class names, internal constants, and component code must NOT be changed.

The implementation follows the exploratory bugfix workflow: write tests BEFORE the fix to understand the bug (Bug Condition), write tests for non-buggy behavior (Preservation), apply the fix with understanding (Expected Behavior), and validate that the fix works and doesn't break anything.

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - ECOS Feature Labels Show ECOS/CROQ
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists in the locale string values
  - **Scoped PBT Approach**: Scope the property to the concrete known buggy keys in both `en.js` and `fr.js` for reproducibility
  - Import the locale objects from `frontend/src/locales/en.js` and `frontend/src/locales/fr.js`
  - Test that each of the 24 ECOS feature-label entries in `en.js` contains "ECOS/CROQ" (navigation, login, dashboard, subscription, voice exams, custom exam, custom setup, landing nav/hero/trust/curve/features/steps/ecos/pricing/faq)
  - Test that each of the 24 ECOS feature-label entries in `fr.js` contains "ECOS/CROQ"
  - Test that `fr.subscription.required.voiceExams` does NOT contain the typo "ECOs" (lowercase s) and DOES contain "ECOS/CROQ"
  - Test that no ECOS feature-label entry contains standalone "ECOS" without "/CROQ"
  - The bug condition from design: isBugCondition(key, locale) returns true when value contains "ECOS" or "ECOs" but does not contain "ECOS/CROQ"
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "en.nav.ecos = 'ECOS Simulator' instead of 'ECOS/CROQ Simulator'", "fr.subscription.required.voiceExams contains 'ECOs' typo instead of 'ECOS/CROQ'")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-ECOS Locale Entries and Internal Identifiers Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (entries where isBugCondition returns false)
  - Observe: all locale entries whose values do NOT contain "ECOS" or "ECOs" remain unchanged
  - Observe: translation key sets in both locale files remain stable (no keys added/removed/renamed)
  - Observe: clinical content entry `landing.ecos.card.vignette.text` does not contain "ECOS" and must stay unchanged
  - Observe: CSS class names in component code (`ecos-overlay`, `ecos-modal`, `ecos-check-row`) are internal identifiers
  - Observe: internal constants `ECOS_YEARS` and `STORAGE_KEY = 'ecos-custom-session'` are unchanged in source code
  - Write property-based test: for all locale entries where the value does not contain "ECOS" or "ECOs", the fixed value equals the original value (from Preservation Requirements in design)
  - Write property-based test: the set of translation keys in the fixed files is identical to the original files for both locales
  - Write test that `landing.ecos.card.vignette.text` (clinical content) is byte-for-byte identical between original and fixed
  - Write test that CSS class names and internal constants are referenced unchanged in component source code
  - Property-based testing generates many test cases across the entire locale key domain for stronger preservation guarantees
  - Run tests on UNFIXED code (snapshot original values as the baseline to compare against after fix)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for ECOS feature labels not showing ECOS/CROQ in locale strings

  - [ ] 3.1 Implement the fix in frontend/src/locales/en.js
    - Update 24 string values (keys unchanged) replacing "ECOS" feature labels with "ECOS/CROQ":
      - `nav.ecos`: "ECOS Simulator" → "ECOS/CROQ Simulator"
      - `ecosCustomExam.title`: "Personalized ECOS Exam" → "Personalized ECOS/CROQ Exam"
      - `ecosCustomExam.reviewTitle`: "ECOS Exam Complete" → "ECOS/CROQ Exam Complete"
      - `ecosCustomSetup.title`: "Personalized ECOS" → "Personalized ECOS/CROQ"
      - `ecosCustomSetup.start`: "Start ECOS" → "Start ECOS/CROQ"
      - `login.feature.ecos`: "ECOS exam simulation" → "ECOS/CROQ exam simulation"
      - `dashboard.ecos.recent`: "Recent ECOS Training" → "Recent ECOS/CROQ Training"
      - `dashboard.empty.ecos`: "No recent ECOS training" → "No recent ECOS/CROQ training"
      - `dashboard.actions.ecos`: "ECOS Simulator" → "ECOS/CROQ Simulator"
      - `subscription.required.voiceExams`: "...access ECOS." → "...access ECOS/CROQ."
      - `voiceExams.unavailable.title`: "ECOS is for medicine students" → "ECOS/CROQ is for medicine students"
      - `voiceExams.unavailable.message`: "ECOS simulations are available..." → "ECOS/CROQ simulations are available..."
      - `landing.nav.ecos`: "ECOS" → "ECOS/CROQ"
      - `landing.hero.subtitle`: "timed ECOS simulations" → "timed ECOS/CROQ simulations"
      - `landing.trust.2`: "ECOS preparation" → "ECOS/CROQ preparation"
      - `landing.curve.ecos`: "ECOS simulations" → "ECOS/CROQ simulations"
      - `landing.features.ecos.tag`: "ECOS Simulations" → "ECOS/CROQ Simulations"
      - `landing.features.ecos.title`: "ECOS preparation" → "ECOS/CROQ preparation"
      - `landing.steps.2.desc`: "MCQs and ECOS resources" → "MCQs and ECOS/CROQ resources"
      - `landing.ecos.eyebrow`: "ECOS Simulation" → "ECOS/CROQ Simulation"
      - `landing.ecos.desc`: "a real ECOS station" → "a real ECOS/CROQ station"
      - `landing.pricing.unique.feature.2`: "Unlimited ECOS simulations" → "Unlimited ECOS/CROQ simulations"
      - `landing.faq.q1.q`: "What is an ECOS simulation on algmed?" → "What is an ECOS/CROQ simulation on algmed?"
      - `landing.faq.q4.a`: "...ECOS simulations..." → "...ECOS/CROQ simulations..."
    - Do NOT change any translation keys, only the string values
    - Do NOT change CSS class names, internal constants, or component code
    - _Bug_Condition: isBugCondition(key, 'en') where value contains "ECOS" as a feature label but not "ECOS/CROQ"_
    - _Expected_Behavior: fixed value contains "ECOS/CROQ" and does not contain standalone "ECOS" or "ECOs"_
    - _Preservation: All non-ECOS entries, translation keys, CSS classes, internal constants, and clinical content unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16_

  - [ ] 3.2 Implement the fix in frontend/src/locales/fr.js
    - Update 24 string values (keys unchanged) replacing "ECOS" feature labels with "ECOS/CROQ":
      - `nav.ecos`: "Simulateur ECOS" → "Simulateur ECOS/CROQ"
      - `ecosCustomExam.title`: "Examen ECOS personnalisé" → "Examen ECOS/CROQ personnalisé"
      - `ecosCustomExam.reviewTitle`: "Examen ECOS terminé" → "Examen ECOS/CROQ terminé"
      - `ecosCustomSetup.title`: "ECOS Personnalisé" → "ECOS/CROQ Personnalisé"
      - `ecosCustomSetup.start`: "Démarrer l'ECOS" → "Démarrer l'ECOS/CROQ"
      - `login.feature.ecos`: "Simulation d'examen ECOS" → "Simulation d'examen ECOS/CROQ"
      - `dashboard.ecos.recent`: "Derniers entraînements ECOS" → "Derniers entraînements ECOS/CROQ"
      - `dashboard.empty.ecos`: "Aucun entraînement ECOS récent" → "Aucun entraînement ECOS/CROQ récent"
      - `dashboard.actions.ecos`: "Simulateur ECOS" → "Simulateur ECOS/CROQ"
      - `subscription.required.voiceExams`: "Un abonnement est requis pour accéder aux ECOs." → "Un abonnement est requis pour accéder aux ECOS/CROQ." (also fixes the "ECOs" typo)
      - `voiceExams.unavailable.title`: "ECOS est réservé aux étudiants en médecine" → "ECOS/CROQ est réservé aux étudiants en médecine"
      - `voiceExams.unavailable.message`: "Les simulations ECOS sont disponibles..." → "Les simulations ECOS/CROQ sont disponibles..."
      - `landing.nav.ecos`: "ECOS" → "ECOS/CROQ"
      - `landing.hero.subtitle`: "simulations ECOS chronométrées" → "simulations ECOS/CROQ chronométrées"
      - `landing.trust.2`: "Préparation ECOS" → "Préparation ECOS/CROQ"
      - `landing.curve.ecos`: "simulations ECOS" → "simulations ECOS/CROQ"
      - `landing.features.ecos.tag`: "Simulations ECOS" → "Simulations ECOS/CROQ"
      - `landing.features.ecos.title`: "Préparation aux ECOS" → "Préparation aux ECOS/CROQ"
      - `landing.steps.2.desc`: "les ressources ECOS" → "les ressources ECOS/CROQ"
      - `landing.ecos.eyebrow`: "La simulation ECOS" → "La simulation ECOS/CROQ"
      - `landing.ecos.desc`: "une station ECOS réelle" → "une station ECOS/CROQ réelle"
      - `landing.pricing.unique.feature.2`: "Simulations ECOS illimitées" → "Simulations ECOS/CROQ illimitées"
      - `landing.faq.q1.q`: "Qu'est-ce qu'une simulation ECOS sur algmed ?" → "Qu'est-ce qu'une simulation ECOS/CROQ sur algmed ?"
      - `landing.faq.q4.a`: "simulations ECOS" → "simulations ECOS/CROQ"
    - Correct the French typo "ECOs" (lowercase s) → "ECOS/CROQ" in `subscription.required.voiceExams`
    - Do NOT change any translation keys, only the string values
    - Do NOT change CSS class names, internal constants, or component code
    - _Bug_Condition: isBugCondition(key, 'fr') where value contains "ECOS" or "ECOs" as a feature label but not "ECOS/CROQ"_
    - _Expected_Behavior: fixed value contains "ECOS/CROQ" and does not contain standalone "ECOS" or "ECOs"_
    - _Preservation: All non-ECOS entries, translation keys, CSS classes, internal constants, and clinical content unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - ECOS Feature Labels Show ECOS/CROQ
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1 against both fixed locale files
    - Verify all 24 entries in `en.js` contain "ECOS/CROQ"
    - Verify all 24 entries in `fr.js` contain "ECOS/CROQ"
    - Verify `fr.subscription.required.voiceExams` no longer contains "ECOs" typo
    - Verify no ECOS feature-label entry contains standalone "ECOS" without "/CROQ"
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-ECOS Locale Entries and Internal Identifiers Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2 against the fixed locale files
    - Verify all non-ECOS locale entries are byte-for-byte identical to the original
    - Verify translation key sets are unchanged (no keys added, removed, or renamed) for both locales
    - Verify clinical content entry `landing.ecos.card.vignette.text` is unchanged
    - Verify CSS class names and internal constants remain unchanged in component source code
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- This is a pure locale string value change. No component code, routing logic, CSS, or i18n infrastructure needs modification.
- The fix affects exactly two files: `frontend/src/locales/en.js` and `frontend/src/locales/fr.js`.
- The French locale has a pre-existing typo ("ECOs" with lowercase s) in `subscription.required.voiceExams` that is corrected alongside the rename.
- Clinical content strings (e.g., patient vignette text in `landing.ecos.card.vignette.text`) do not contain "ECOS" and are correctly excluded from changes.
- Translation keys (e.g., `nav.ecos`, `ecosCustomExam.title`) remain unchanged — only the translated string values change.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "parallelTasks": [
        {"taskId": "1", "title": "Bug Condition Exploration Test"},
        {"taskId": "2", "title": "Preservation Property Tests"}
      ]
    },
    {
      "wave": 2,
      "parallelTasks": [
        {"taskId": "3.1", "title": "Fix en.js", "dependsOn": ["1", "2"]},
        {"taskId": "3.2", "title": "Fix fr.js", "dependsOn": ["1", "2"]}
      ]
    },
    {
      "wave": 3,
      "parallelTasks": [
        {"taskId": "3.3", "title": "Verify Bug Condition Test Passes", "dependsOn": ["3.1", "3.2"]},
        {"taskId": "3.4", "title": "Verify Preservation Tests Pass", "dependsOn": ["3.1", "3.2"]}
      ]
    },
    {
      "wave": 4,
      "parallelTasks": [
        {"taskId": "4", "title": "Checkpoint", "dependsOn": ["3.3", "3.4"]}
      ]
    }
  ]
}
```
