/*
 * Clerk widget styling — shared by the sign-in and sign-up pages.
 * Every colour points at an editorial token so the forms follow the app theme
 * (light by default, navy when the visitor switches to dark).
 */

const FONT_STACK = "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--ed-primary)',
    colorBackground: 'transparent',
    colorText: 'var(--ed-ink)',
    colorTextSecondary: 'var(--ed-muted)',
    colorInputBackground: 'transparent',
    colorInputText: 'var(--ed-ink)',
    colorNeutral: 'var(--ed-ink)',
    colorDanger: 'var(--ed-danger)',
    colorSuccess: 'var(--ed-success)',
    fontFamily: FONT_STACK,
    fontSize: '15px',
    borderRadius: '9px',
  },
  elements: {
    rootBox: { width: '100%', display: 'flex', justifyContent: 'center' },
    card: { boxShadow: 'none', border: 'none', background: 'transparent', padding: 0, width: '100%' },
    cardBox: { boxShadow: 'none', background: 'transparent', width: '100%' },
    headerTitle: { display: 'none' },
    headerSubtitle: { display: 'none' },
    main: { gap: '18px' },
    socialButtonsBlockButton: {
      border: '1px solid var(--ed-line-strong)',
      borderRadius: '9px',
      padding: '10px 14px',
      backgroundColor: 'transparent',
      color: 'var(--ed-ink)',
      boxShadow: 'none',
    },
    socialButtonsBlockButtonText: { fontWeight: '500', color: 'var(--ed-ink)' },
    dividerLine: { backgroundColor: 'var(--ed-line)' },
    dividerText: { color: 'var(--ed-muted)', fontSize: '12px', letterSpacing: '0.04em' },
    formFieldLabel: { fontSize: '13px', fontWeight: '500', color: 'var(--ed-ink-2)' },
    formFieldInput: {
      borderRadius: '9px',
      border: '1px solid var(--ed-line-strong)',
      padding: '11px 13px',
      fontSize: '15px',
      backgroundColor: 'transparent',
      color: 'var(--ed-ink)',
      boxShadow: 'none',
    },
    formButtonPrimary: {
      backgroundColor: 'var(--ed-primary)',
      color: 'var(--ed-on-primary)',
      borderRadius: '9px',
      padding: '12px',
      fontSize: '14.5px',
      textTransform: 'none',
      boxShadow: 'none',
      fontWeight: '600',
    },
    footer: { background: 'transparent', paddingBottom: 0 },
    footerAction: { marginTop: '10px', background: 'transparent' },
    footerActionText: { color: 'var(--ed-muted)' },
    footerActionLink: { color: 'var(--ed-accent)', fontSize: '13.5px', fontWeight: '500' },
    identityPreviewEditButton: { color: 'var(--ed-accent)' },
    formResendCodeLink: { color: 'var(--ed-accent)' },
    badge: { display: 'none' },
  },
};

export default clerkAppearance;
