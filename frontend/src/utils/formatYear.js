export function formatYearLabel(year) {
  const n = Number(year);
  if (n === 7) return 'Résidanat';
  return n;
}

export function formatYearOrdinal(year, lang) {
  const n = Number(year);
  if (lang === 'fr') return n === 1 ? '1re' : `${n}e`;
  return String(n);
}

export function formatYearOption(year, lang) {
  const n = Number(year);
  if (!n) return '';
  if (n === 7) return lang === 'fr' ? 'Résidanat' : 'Residency';
  if (lang === 'fr') return n === 1 ? '1re année' : `${n}e année`;
  const lastTwo = n % 100;
  const suffix = lastTwo >= 11 && lastTwo <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return `${n}${suffix} year`;
}
