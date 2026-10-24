const IMAGE_BASE = '/module-cards';
const FALLBACK_IMAGE = `${IMAGE_BASE}/hospital.jpg`;

const keyMap = [
  ['anatomopathologie', 'microscope'],
  ['biostatistiques', 'lab'],
  ['biologie moleculaire', 'molecules'],
  ['pharmacie hospitaliere', 'pharmacy'],
  ['pharmacie galenique', 'pharmacy'],
  ['pharmacie clinique', 'pharmacy'],
  ['appareil cardio respiratoire', 'heart'],
  ['appareil reproducteur', 'pregnancy'],
  ['appareil digestif', 'digestive'],
  ['appareil urinaire', 'kidney'],
  ['systeme nerveux', 'brain'],
  ['systeme endocrinien', 'clinical'],
  ['medecine du travail', 'public-health'],
  ['medecine legale', 'public-health'],
  ['medecine interne', 'clinical'],
  ['preparation internat', 'clinical'],
  ['synthese pharmaceutique', 'clinical'],
  ['sante publique', 'public-health'],
  ['maladies systemiques', 'clinical'],
  ['pharmacodynamie', 'pharmacy'],
  ['pharmacologie', 'pharmacy'],
  ['pharmacognosie', 'botany'],
  ['phytochimie', 'botany'],
  ['hematopoietique', 'hematology'],
  ['onco hematologie', 'hematology'],
  ['endocrinologie', 'clinical'],
  ['endocrinien', 'clinical'],
  ['ophtalmologie', 'clinical'],
  ['dermatologie', 'dermatology'],
  ['gynecologie', 'pregnancy'],
  ['obstetrique', 'pregnancy'],
  ['embryologie', 'pregnancy'],
  ['pediatrie', 'pediatrics'],
  ['psychiatrie', 'brain'],
  ['psychologie', 'brain'],
  ['neurologie', 'brain'],
  ['pneumologie', 'lungs'],
  ['cardiologie', 'heart'],
  ['gastroenterologie', 'digestive'],
  ['gastro enterologie', 'digestive'],
  ['hematologie', 'hematology'],
  ['oncologie', 'oncology'],
  ['immunologie', 'immunology'],
  ['microbiologie', 'microscope'],
  ['parasitologie', 'microscope'],
  ['infectiologie', 'microscope'],
  ['histologie', 'microscope'],
  ['cytologie', 'microscope'],
  ['biophysique', 'imaging'],
  ['radiologie', 'imaging'],
  ['toxicologie', 'lab'],
  ['semiologie', 'clinical'],
  ['chirurgie', 'surgery'],
  ['reanimation', 'emergency'],
  ['urgences', 'emergency'],
  ['urgence', 'emergency'],
  ['nephrologie', 'kidney'],
  ['urologie', 'kidney'],
  ['urinaire', 'kidney'],
  ['locomoteur', 'anatomy'],
  ['anatomie', 'anatomy'],
  ['physiologie', 'anatomy'],
  ['biochimie', 'molecules'],
  ['genetique', 'molecules'],
  ['chimie', 'molecules'],
  ['physique', 'imaging'],
  ['botanique', 'botany'],
  ['officine', 'pharmacy'],
  ['pharmacie', 'pharmacy'],
  ['legislation', 'public-health'],
  ['ethique', 'public-health'],
  ['droit', 'public-health'],
  ['geriatrie', 'clinical'],
  ['orl', 'clinical'],
  ['cutane', 'dermatology'],
  ['onco', 'oncology'],
  ['cardio', 'heart'],
  ['pneumo', 'lungs'],
  ['gastro', 'digestive'],
  ['hepat', 'digestive'],
  ['digestif', 'digestive'],
  ['neuro', 'brain'],
  ['lab', 'lab'],
];

const normalize = (name) => (name || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export const getModuleImage = (moduleName) => {
  const name = normalize(moduleName);
  if (!name) return FALLBACK_IMAGE;

  let bestKey = '';
  let bestImage = '';

  for (const [key, image] of keyMap) {
    if (name.includes(key) && key.length > bestKey.length) {
      bestKey = key;
      bestImage = image;
    }
  }

  return bestImage ? `${IMAGE_BASE}/${bestImage}.jpg` : FALLBACK_IMAGE;
};
