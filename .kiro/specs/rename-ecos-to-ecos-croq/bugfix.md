# Bugfix Requirements Document

## Introduction

The algmed platform's clinical simulation feature is currently labeled "ECOS" throughout the user-facing interface. This label should be "ECOS/CROQ" to reflect both exam types that the feature covers. The bug affects all user-facing text managed through the locale system (en.js and fr.js), including navigation labels, login feature descriptions, dashboard actions, subscription messages, ECOS exam setup screens, voice exam availability messages, and the landing page (hero, trust badges, curve labels, features, steps, ECOS section, pricing, and FAQ). CSS class names and internal constants (e.g., `ecos-overlay`, `ECOS_YEARS`) are internal identifiers and must NOT be renamed.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user views the navigation sidebar or landing page navigation THEN the system displays "ECOS Simulator" (en) / "Simulateur ECOS" (fr) and "ECOS" (landing nav) instead of "ECOS/CROQ"

1.2 WHEN the user views the login page feature list THEN the system displays "ECOS exam simulation" (en) / "Simulation d'examen ECOS" (fr) instead of mentioning "ECOS/CROQ"

1.3 WHEN the user views the dashboard quick actions or recent activity section THEN the system displays "ECOS Simulator" (en) / "Simulateur ECOS" (fr) and "Recent ECOS Training" (en) / "Derniers entraînements ECOS" (fr) instead of "ECOS/CROQ"

1.4 WHEN the user encounters a subscription-required message for voice exams THEN the system displays "A subscription is required to access ECOS" (en) / "Un abonnement est requis pour accéder aux ECOs" (fr, also contains a typo "ECOs") instead of "ECOS/CROQ"

1.5 WHEN the user configures or completes a personalized ECOS exam THEN the system displays "Personalized ECOS Exam" / "ECOS Exam Complete" (en) and "Examen ECOS personnalisé" / "Examen ECOS terminé" (fr) instead of using "ECOS/CROQ"

1.6 WHEN the user sets up a personalized ECOS session THEN the system displays "Personalized ECOS" (en) / "ECOS Personnalisé" (fr) as the title and "Start ECOS" (en) / "Démarrer l'ECOS" (fr) as the start button instead of using "ECOS/CROQ"

1.7 WHEN a non-medicine student tries to access the ECOS feature THEN the system displays "ECOS is for medicine students" (en) / "ECOS est réservé aux étudiants en médecine" (fr) and "ECOS simulations are available..." (en) / "Les simulations ECOS sont disponibles..." (fr) instead of using "ECOS/CROQ"

1.8 WHEN the user views the landing page hero subtitle THEN the system displays "timed ECOS simulations" (en) / "simulations ECOS chronométrées" (fr) instead of "ECOS/CROQ simulations"

1.9 WHEN the user views the landing page trust badges THEN the system displays "ECOS preparation" (en) / "Préparation ECOS" (fr) instead of "ECOS/CROQ preparation"

1.10 WHEN the user views the landing page curve labels THEN the system displays "ECOS simulations" (en) / "simulations ECOS" (fr) instead of "ECOS/CROQ simulations"

1.11 WHEN the user views the landing page features section THEN the system displays "ECOS Simulations" (en) / "Simulations ECOS" (fr) as the tag and "ECOS preparation" (en) / "Préparation aux ECOS" (fr) as the title instead of using "ECOS/CROQ"

1.12 WHEN the user views the landing page steps section THEN the system displays "MCQs and ECOS resources" (en) / "QCM et les ressources ECOS" (fr) instead of using "ECOS/CROQ"

1.13 WHEN the user views the landing page ECOS section THEN the system displays "ECOS Simulation" (en) / "La simulation ECOS" (fr) as the eyebrow and "a real ECOS station" (en) / "une station ECOS réelle" (fr) in the description instead of using "ECOS/CROQ"

1.14 WHEN the user views the landing page pricing section THEN the system displays "Unlimited ECOS simulations" (en) / "Simulations ECOS illimitées" (fr) instead of using "ECOS/CROQ"

1.15 WHEN the user views the landing page FAQ THEN the system displays "What is an ECOS simulation on algmed?" (en) / "Qu'est-ce qu'une simulation ECOS sur algmed ?" (fr) and mentions "ECOS simulations" in the answer instead of using "ECOS/CROQ"

1.16 WHEN the user views the dashboard empty state for ECOS THEN the system displays "No recent ECOS training" (en) / "Aucun entraînement ECOS récent" (fr) instead of "ECOS/CROQ"

### Expected Behavior (Correct)

2.1 WHEN the user views the navigation sidebar or landing page navigation THEN the system SHALL display "ECOS/CROQ Simulator" (en) / "Simulateur ECOS/CROQ" (fr) and "ECOS/CROQ" (landing nav)

2.2 WHEN the user views the login page feature list THEN the system SHALL display "ECOS/CROQ exam simulation" (en) / "Simulation d'examen ECOS/CROQ" (fr)

2.3 WHEN the user views the dashboard quick actions or recent activity section THEN the system SHALL display "ECOS/CROQ Simulator" (en) / "Simulateur ECOS/CROQ" (fr) and "Recent ECOS/CROQ Training" (en) / "Derniers entraînements ECOS/CROQ" (fr)

2.4 WHEN the user encounters a subscription-required message for voice exams THEN the system SHALL display "A subscription is required to access ECOS/CROQ" (en) / "Un abonnement est requis pour accéder aux ECOS/CROQ" (fr) — the French typo "ECOs" SHALL also be corrected to "ECOS/CROQ"

2.5 WHEN the user configures or completes a personalized ECOS/CROQ exam THEN the system SHALL display "Personalized ECOS/CROQ Exam" / "ECOS/CROQ Exam Complete" (en) and "Examen ECOS/CROQ personnalisé" / "Examen ECOS/CROQ terminé" (fr)

2.6 WHEN the user sets up a personalized ECOS/CROQ session THEN the system SHALL display "Personalized ECOS/CROQ" (en) / "ECOS/CROQ Personnalisé" (fr) as the title and "Start ECOS/CROQ" (en) / "Démarrer l'ECOS/CROQ" (fr) as the start button

2.7 WHEN a non-medicine student tries to access the ECOS/CROQ feature THEN the system SHALL display "ECOS/CROQ is for medicine students" (en) / "ECOS/CROQ est réservé aux étudiants en médecine" (fr) and "ECOS/CROQ simulations are available..." (en) / "Les simulations ECOS/CROQ sont disponibles..." (fr)

2.8 WHEN the user views the landing page hero subtitle THEN the system SHALL display "timed ECOS/CROQ simulations" (en) / "simulations ECOS/CROQ chronométrées" (fr)

2.9 WHEN the user views the landing page trust badges THEN the system SHALL display "ECOS/CROQ preparation" (en) / "Préparation ECOS/CROQ" (fr)

2.10 WHEN the user views the landing page curve labels THEN the system SHALL display "ECOS/CROQ simulations" (en) / "simulations ECOS/CROQ" (fr)

2.11 WHEN the user views the landing page features section THEN the system SHALL display "ECOS/CROQ Simulations" (en) / "Simulations ECOS/CROQ" (fr) as the tag and "ECOS/CROQ preparation" (en) / "Préparation aux ECOS/CROQ" (fr) as the title

2.12 WHEN the user views the landing page steps section THEN the system SHALL display "MCQs and ECOS/CROQ resources" (en) / "QCM et les ressources ECOS/CROQ" (fr)

2.13 WHEN the user views the landing page ECOS/CROQ section THEN the system SHALL display "ECOS/CROQ Simulation" (en) / "La simulation ECOS/CROQ" (fr) as the eyebrow and "a real ECOS/CROQ station" (en) / "une station ECOS/CROQ réelle" (fr) in the description

2.14 WHEN the user views the landing page pricing section THEN the system SHALL display "Unlimited ECOS/CROQ simulations" (en) / "Simulations ECOS/CROQ illimitées" (fr)

2.15 WHEN the user views the landing page FAQ THEN the system SHALL display "What is an ECOS/CROQ simulation on algmed?" (en) / "Qu'est-ce qu'une simulation ECOS/CROQ sur algmed ?" (fr) and mention "ECOS/CROQ simulations" in the answer

2.16 WHEN the user views the dashboard empty state for ECOS/CROQ THEN the system SHALL display "No recent ECOS/CROQ training" (en) / "Aucun entraînement ECOS/CROQ récent" (fr)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user interacts with CSS classes prefixed with "ecos-" (e.g., `ecos-overlay`, `ecos-modal`, `ecos-check-row`) THEN the system SHALL CONTINUE TO apply the same styling as before, since these are internal class names not visible to users

3.2 WHEN the application references internal constants such as `ECOS_YEARS` or uses the `STORAGE_KEY = 'ecos-custom-session'` identifier THEN the system SHALL CONTINUE TO function correctly with the same internal identifiers

3.3 WHEN the user interacts with any non-ECOS feature (MCQs, mock exams, voice exams, profile, pricing, admin panel, etc.) THEN the system SHALL CONTINUE TO behave exactly as before with no changes to labels, navigation, or functionality

3.4 WHEN the locale translation keys (e.g., `nav.ecos`, `ecosCustomExam.title`, `landing.ecos.eyebrow`) are referenced in component code THEN the system SHALL CONTINUE TO use the same translation keys, only the translated string values change from "ECOS" to "ECOS/CROQ"

3.5 WHEN the user views any text that mentions "ECOS" as part of a clinical or medical term in non-feature contexts (e.g., within the clinical case descriptions, patient vignettes) THEN the system SHALL CONTINUE TO display those texts unchanged, as they are content rather than feature labels
