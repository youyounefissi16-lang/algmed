import { useEffect } from 'react';
import { useSound } from '../context/SoundContext';
import { useTranslation } from '../context/LanguageContext';

const HEARTBEAT_MS = 1200;

export default function AnimatedLoading() {
  const play = useSound();
  const { t } = useTranslation();

  useEffect(() => {
    if (!play) return undefined;
    play('heartbeat');
    const id = setInterval(() => play('heartbeat'), HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [play]);

  return (
    <div className="loading-wrapper">
      <div className="loading-heart" role="status" aria-label={t('loading')}>
        <img className="loading-heart-cross" src="/logo-cross-mark.svg" alt="" aria-hidden="true" />
      </div>
    </div>
  );
}
