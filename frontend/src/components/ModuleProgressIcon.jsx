// Module progress icon: the module's own icon shown as an empty/neutral shape
// that fills with the module colour from the bottom up as progress grows.
import { getModuleIcon } from '../utils/moduleIcons';
import { getModuleTheme } from '../utils/moduleTheme';

const ModuleProgressIcon = ({ name, pct = 0 }) => {
  const icon = getModuleIcon(name);
  const theme = getModuleTheme(name);
  const clamped = Math.max(0, Math.min(1, Number(pct) || 0));
  const pctLabel = Math.round(clamped * 100);

  return (
    <span
      className="mod-icon"
      role="img"
      aria-label={`${pctLabel}%`}
      title={`${pctLabel}%`}
      style={{
        '--mod-color': theme.from,
        '--mod-pct': `${clamped * 100}%`,
      }}
    >
      <span className="mod-icon-base" aria-hidden="true">{icon}</span>
      <span className="mod-icon-fill" aria-hidden="true">{icon}</span>
    </span>
  );
};

export default ModuleProgressIcon;
