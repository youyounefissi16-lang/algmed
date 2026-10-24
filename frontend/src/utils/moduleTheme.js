// Per-module cover gradients for the dashboard module cards.
// Colors are matched by normalized module-name substrings (see moduleIcons.jsx),
// with a deterministic hash fallback so every module keeps a stable theme.

const PALETTE = [
  { from: '#7C3AED', to: '#4C1D95', glow: 'rgba(124, 58, 237, 0.55)' },
  { from: '#F43F5E', to: '#9F1239', glow: 'rgba(244, 63, 94, 0.5)' },
  { from: '#6366F1', to: '#312E81', glow: 'rgba(99, 102, 241, 0.5)' },
  { from: '#0EA5E9', to: '#075985', glow: 'rgba(14, 165, 233, 0.5)' },
  { from: '#F59E0B', to: '#B45309', glow: 'rgba(245, 158, 11, 0.5)' },
  { from: '#10B981', to: '#065F46', glow: 'rgba(16, 185, 129, 0.5)' },
  { from: '#D946EF', to: '#86198F', glow: 'rgba(217, 70, 239, 0.5)' },
  { from: '#06B6D4', to: '#155E75', glow: 'rgba(6, 182, 212, 0.5)' },
  { from: '#E11D48', to: '#881337', glow: 'rgba(225, 29, 72, 0.5)' },
  { from: '#FB923C', to: '#C2410C', glow: 'rgba(251, 146, 60, 0.5)' },
  { from: '#EC4899', to: '#9D174D', glow: 'rgba(236, 72, 153, 0.5)' },
  { from: '#3B82F6', to: '#1E40AF', glow: 'rgba(59, 130, 246, 0.5)' },
  { from: '#84CC16', to: '#3F6212', glow: 'rgba(132, 204, 22, 0.5)' },
];

const gradient = (from, to, glow) => ({ from, to, glow });

const themeMap = {
  pathologie: gradient('#7C3AED', '#4C1D95', 'rgba(124, 58, 237, 0.55)'),
  anatomopathologie: gradient('#7C3AED', '#4C1D95', 'rgba(124, 58, 237, 0.55)'),
  cardiologie: gradient('#F43F5E', '#9F1239', 'rgba(244, 63, 94, 0.5)'),
  cardio: gradient('#F43F5E', '#9F1239', 'rgba(244, 63, 94, 0.5)'),
  neurologie: gradient('#6366F1', '#312E81', 'rgba(99, 102, 241, 0.5)'),
  neuro: gradient('#6366F1', '#312E81', 'rgba(99, 102, 241, 0.5)'),
  pneumologie: gradient('#0EA5E9', '#075985', 'rgba(14, 165, 233, 0.5)'),
  pneumo: gradient('#0EA5E9', '#075985', 'rgba(14, 165, 233, 0.5)'),
  gastro: gradient('#F59E0B', '#B45309', 'rgba(245, 158, 11, 0.5)'),
  digestif: gradient('#F59E0B', '#B45309', 'rgba(245, 158, 11, 0.5)'),
  infectiologie: gradient('#10B981', '#065F46', 'rgba(16, 185, 129, 0.5)'),
  microbiologie: gradient('#10B981', '#065F46', 'rgba(16, 185, 129, 0.5)'),
  parasitologie: gradient('#10B981', '#065F46', 'rgba(16, 185, 129, 0.5)'),
  endocrinologie: gradient('#D946EF', '#86198F', 'rgba(217, 70, 239, 0.5)'),
  endocrinien: gradient('#D946EF', '#86198F', 'rgba(217, 70, 239, 0.5)'),
  néphrologie: gradient('#06B6D4', '#155E75', 'rgba(6, 182, 212, 0.5)'),
  nephrologie: gradient('#06B6D4', '#155E75', 'rgba(6, 182, 212, 0.5)'),
  urologie: gradient('#06B6D4', '#155E75', 'rgba(6, 182, 212, 0.5)'),
  urinaire: gradient('#06B6D4', '#155E75', 'rgba(6, 182, 212, 0.5)'),
  hématologie: gradient('#E11D48', '#881337', 'rgba(225, 29, 72, 0.5)'),
  hematologie: gradient('#E11D48', '#881337', 'rgba(225, 29, 72, 0.5)'),
  onco: gradient('#E11D48', '#881337', 'rgba(225, 29, 72, 0.5)'),
  dermatologie: gradient('#FB923C', '#C2410C', 'rgba(251, 146, 60, 0.5)'),
  gynécologie: gradient('#EC4899', '#9D174D', 'rgba(236, 72, 153, 0.5)'),
  gynecologie: gradient('#EC4899', '#9D174D', 'rgba(236, 72, 153, 0.5)'),
  obstétrique: gradient('#EC4899', '#9D174D', 'rgba(236, 72, 153, 0.5)'),
  psychiatrie: gradient('#3B82F6', '#1E40AF', 'rgba(59, 130, 246, 0.5)'),
  psychologie: gradient('#3B82F6', '#1E40AF', 'rgba(59, 130, 246, 0.5)'),
  psy: gradient('#3B82F6', '#1E40AF', 'rgba(59, 130, 246, 0.5)'),
  pédiatrie: gradient('#84CC16', '#3F6212', 'rgba(132, 204, 22, 0.5)'),
  pediatrie: gradient('#84CC16', '#3F6212', 'rgba(132, 204, 22, 0.5)'),
};

const fallback = gradient('#0891B2', '#06B6D4', 'rgba(8, 145, 178, 0.5)');

const normalize = (name) => (name || '').toLowerCase().replace(/\s+/g, ' ').trim();

const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) % 100000;
  }
  return h;
};

export const getModuleTheme = (moduleName) => {
  const name = normalize(moduleName);
  if (!name) return fallback;

  let bestKey = '';
  let best = null;
  for (const [key, theme] of Object.entries(themeMap)) {
    if (name.includes(key) && key.length > bestKey.length) {
      bestKey = key;
      best = theme;
    }
  }
  if (best) return best;

  return PALETTE[hash(name) % PALETTE.length];
};
