import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClerk, useUser } from '@clerk/react';
import { API_BASE_URL, fetchWithAuth } from '../config/api';
import { useToast } from '../components/Toast';
import { useTranslation } from '../context/LanguageContext';
import { formatDate } from '../utils/formatDate';
import { formatYearOption } from '../utils/formatYear';
import { logger } from '../utils/logger';
import useDocumentTitle from '../utils/useDocumentTitle';
import ConfirmModal from '../components/ConfirmModal';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaExternalLinkAlt, FaStar, FaUnlock, FaUserShield } from 'react-icons/fa';
import '../styles/teal-theme.css';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function calcStreak(results) {
  if (!results.length) return 0;
  const dayMap = {};
  for (const r of results) {
    const day = new Date(r.timestamp).toDateString();
    dayMap[day] = Math.max(dayMap[day] || 0, r.score);
  }
  const days = Object.keys(dayMap).sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  for (const day of days) {
    if (dayMap[day] === 1) streak++;
    else break;
  }
  return streak;
}

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

const ProfileSkeleton = ({ label }) => (
  <div className="page-teal profile-page">
    <div className="card-teal profile-header profile-skeleton" role="status" aria-live="polite" aria-label={label}>
      <div className="profile-skeleton-avatar" />
      <div className="profile-skeleton-copy">
        <div className="profile-skeleton-line profile-skeleton-line--title" />
        <div className="profile-skeleton-line profile-skeleton-line--text" />
        <div className="profile-skeleton-line profile-skeleton-line--badges" />
      </div>
    </div>
    <div className="profile-layout">
      {[0, 1].map((column) => (
        <div className="profile-column" key={column}>
          <div className="card-teal profile-panel">
            <div className="profile-skeleton-line profile-skeleton-line--heading" />
            <div className="profile-skeleton-line profile-skeleton-line--input" />
            <div className="profile-skeleton-line profile-skeleton-line--input" />
            <div className="profile-skeleton-line profile-skeleton-line--button" />
          </div>
          <div className="card-teal profile-panel">
            <div className="profile-skeleton-line profile-skeleton-line--heading" />
            <div className="profile-skeleton-line profile-skeleton-line--text" />
            <div className="profile-skeleton-line profile-skeleton-line--text" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { openUserProfile } = useClerk();
  const { user: clerkUser } = useUser();
  useDocumentTitle(t('profile.title'));
  const notify = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [year, setYear] = useState('');
  const [clerkId, setClerkId] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [initial, setInitial] = useState({ name: '', email: '', discipline: '', year: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [visiblePwd, setVisiblePwd] = useState({ current: false, next: false, confirm: false });
  const [pwdErrors, setPwdErrors] = useState({});

  const [userId, setUserId] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isClerkAccount = Boolean(clerkId);
  const activeSub = subscription?.status === 'active';

  const fetchUser = useCallback(async (signal) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/profile`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const user = data.user || {};
      const nextYear = user.discipline === 'pharmacy' && Number(user.year) === 7
        ? ''
        : user.year ? String(user.year) : '';
      setName(user.name || '');
      setEmail(user.email || '');
      setDiscipline(user.discipline || '');
      setYear(nextYear);
      setClerkId(user.clerkId || '');
      setEmailVerified(Boolean(user.emailVerified));
      setCreatedAt(user.createdAt || null);
      setUserId(user.userId || '');
      setSubscription(user.subscription || null);
      setInitial({
        name: user.name || '',
        email: user.email || '',
        discipline: user.discipline || '',
        year: nextYear,
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      logger.error({ err }, 'ProfilePage fetchUser failed');
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(controller.signal);
    return () => controller.abort();
  }, [fetchUser]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setStatsLoading(true);
    (async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/results/${userId}?limit=200`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (err) {
        if (!cancelled) logger.error({ err }, 'ProfilePage fetchResults failed');
      }
      if (!cancelled) setStatsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setSubscriptionLoading(true);
    (async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/payments/subscription`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.subscription) setSubscription(data.subscription);
        }
      } catch {
        if (!cancelled) logger.error({}, 'ProfilePage fetchSubscription failed');
      } finally {
        if (!cancelled) setSubscriptionLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const isDirty = useMemo(() => (
    discipline !== initial.discipline ||
    year !== initial.year ||
    (!isClerkAccount && (name.trim() !== initial.name || email.trim() !== initial.email))
  ), [discipline, year, name, email, initial, isClerkAccount]);

  const clerkDisplayName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.fullName || '';
  const clerkDisplayEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
  const headerName = (isClerkAccount && clerkDisplayName ? clerkDisplayName : name).trim() || t('profile.title');
  const headerEmail = isClerkAccount ? (clerkDisplayEmail || email) : email;
  const headerEmailVerified = isClerkAccount && clerkUser
    ? clerkUser.primaryEmailAddress?.verification?.status === 'verified'
    : emailVerified;
  const disciplineLabel = discipline
    ? t(`profile.discipline.${discipline}`)
    : t('profile.discipline.none');
  const yearLabel = year ? formatYearOption(year, lang) : t('profile.year.none');

  const stats = useMemo(() => {
    const total = results.length;
    const correct = results.filter((r) => r.score === 1).length;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    return { total, correct, percentage, streak: calcStreak(results) };
  }, [results]);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const focusFirstInvalid = () => {
    requestAnimationFrame(() => {
      document.querySelector('.profile-page [aria-invalid="true"]')?.focus();
    });
  };

  const validateProfile = () => {
    const errors = {};
    if (!isClerkAccount) {
      if (!name.trim()) errors.name = t('profile.nameRequired');
      if (!email.trim()) errors.email = t('profile.emailRequired');
      else if (!EMAIL_REGEX.test(email.trim())) errors.email = t('profile.emailInvalid');
    }
    if (year && !discipline) errors.discipline = t('profile.disciplineRequired');
    if (discipline === 'pharmacy' && Number(year) === 7) errors.year = t('profile.yearPharmacyMax');
    setFieldErrors(errors);
    if (Object.keys(errors).length) focusFirstInvalid();
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!isDirty || !validateProfile()) return;
    const yearChanged = year !== initial.year;
    const discChanged = discipline !== initial.discipline;
    if (activeSub && (yearChanged || discChanged)) {
      setShowConfirmModal(true);
      return;
    }
    doSaveProfile();
  };

  const doSaveProfile = async () => {
    const body = {};
    if (discipline !== initial.discipline) body.discipline = discipline;
    if (year !== initial.year) body.year = year === '' ? null : Number(year);
    if (!isClerkAccount) {
      if (name.trim() !== initial.name) body.name = name.trim();
      if (email.trim() !== initial.email) body.email = email.trim();
    }
    if (!Object.keys(body).length) return;

    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify(data?.message || t('profile.error'), 'error');
        return;
      }
      const user = data.user || {};
      const nextName = user.name || '';
      const nextEmail = user.email || '';
      const nextDiscipline = user.discipline || '';
      const nextYear = user.year ? String(user.year) : '';
      setName(nextName);
      setEmail(nextEmail);
      setDiscipline(nextDiscipline);
      setYear(nextYear);
      setInitial({ name: nextName, email: nextEmail, discipline: nextDiscipline, year: nextYear });
      setFieldErrors({});
      if (user.subscription) setSubscription(user.subscription);
      try {
        localStorage.setItem('userName', nextName);
        localStorage.setItem('userDiscipline', nextDiscipline);
        localStorage.setItem('userYear', nextYear);
      } catch {}
      notify(t('profile.saved'), 'success');
    } catch (err) {
      logger.error({ err }, 'ProfilePage save failed');
      notify(t('profile.error.generic'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = (key, value) => {
    if (key === 'currentPassword') setCurrentPassword(value);
    else if (key === 'newPassword') setNewPassword(value);
    else setConfirmPassword(value);
    setPwdErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!currentPassword) errors.currentPassword = t('profile.currentPwdRequired');
    if (!newPassword) errors.newPassword = t('profile.newPwdRequired');
    else if (!PASSWORD_REGEX.test(newPassword)) errors.newPassword = t('profile.pwdComplexity');
    if (newPassword !== confirmPassword) errors.confirmPassword = t('profile.pwdMismatch');
    setPwdErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid();
      return;
    }
    setChangingPwd(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/change-password`, {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        notify(t('profile.pwdChanged'), 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwdErrors({});
      } else {
        notify(data?.message || t('profile.error'), 'error');
      }
    } catch (err) {
      logger.error({ err }, 'ProfilePage changePassword failed');
      notify(t('profile.error.generic'), 'error');
    } finally {
      setChangingPwd(false);
    }
  };

  const openAccountPanel = async (options) => {
    try {
      await openUserProfile(options);
    } catch (err) {
      logger.error({ err }, 'ProfilePage openUserProfile failed');
      notify(t('profile.error.generic'), 'error');
    }
  };

  const handleManageAccount = () => openAccountPanel();
  const handleManageSecurity = () => openAccountPanel({ __experimental_startPath: '/security' });

  const handleDisciplineChange = (value) => {
    setDiscipline(value);
    if (!value || (value === 'pharmacy' && Number(year) === 7)) setYear('');
    clearFieldError('discipline');
    clearFieldError('year');
  };

  const handleYearChange = (value) => {
    setYear(value);
    clearFieldError('year');
  };

  if (loading) return <ProfileSkeleton label={t('loading')} />;

  if (loadError) {
    return (
      <div className="page-teal profile-page">
        <div className="card-teal profile-error" role="alert">
          <FaExclamationCircle className="profile-error-icon" aria-hidden="true" />
          <h2 className="profile-heading">{t('profile.loadError')}</h2>
          <p className="profile-panel-desc">{t('profile.error.generic')}</p>
          <button type="button" className="btn-primary" onClick={() => fetchUser()}>
            {t('profile.retry')}
          </button>
        </div>
      </div>
    );
  }

  const subscriptionStatusClass = activeSub
    ? 'active'
    : subscription?.status === 'expired' ? 'expired'
      : subscription?.status === 'cancelled' ? 'cancelled' : 'inactive';
  const subscriptionStatusLabel = activeSub
    ? t('profile.subscription.active')
    : subscription?.status === 'expired'
      ? t('profile.subscription.expired')
      : subscription?.status === 'cancelled'
        ? t('profile.subscription.cancelled')
        : t('profile.subscription.inactive');

  const yearChoices = discipline === 'pharmacy' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7];

  const passwordFields = [
    {
      key: 'currentPassword',
      label: t('profile.currentPwd'),
      autoComplete: 'current-password',
      visibleKey: 'current',
    },
    {
      key: 'newPassword',
      label: t('profile.newPwd'),
      autoComplete: 'new-password',
      visibleKey: 'next',
    },
    {
      key: 'confirmPassword',
      label: t('profile.confirmPwd'),
      autoComplete: 'new-password',
      visibleKey: 'confirm',
    },
  ];

  return (
    <div className="page-teal profile-page">
      <header className="card-teal profile-header">
        <div className="profile-avatar" aria-hidden="true">{initialsOf(name)}</div>
        <div className="profile-identity">
          <h1 className="profile-title">{headerName}</h1>
          <p className="profile-email">{headerEmail || '—'}</p>
          <div className="profile-badges">
            <span className="profile-badge">{disciplineLabel}</span>
            {year && <span className="profile-badge">{yearLabel}</span>}
            <span className={`profile-badge ${activeSub ? 'profile-badge--active' : 'profile-badge--muted'}`}>
              {activeSub ? t('profile.subscription.active') : t('profile.badge.noPlan')}
            </span>
            {createdAt && (
              <span className="profile-meta">{t('profile.memberSince', { date: formatDate(createdAt, lang) })}</span>
            )}
          </div>
        </div>
        {isClerkAccount && (
          <button type="button" className="btn-outline profile-header-action" onClick={handleManageAccount}>
            <FaUserShield aria-hidden="true" />
            {t('profile.account.manage')}
          </button>
        )}
      </header>

      <div className="profile-layout">
        <div className="profile-column">
          <section className="card-teal profile-panel">
            <div className="profile-panel-head">
              <h2 className="profile-heading">
                {isClerkAccount ? t('profile.academic.title') : t('profile.personal.title')}
              </h2>
              <p className="profile-panel-desc">
                {isClerkAccount ? t('profile.academic.desc') : t('profile.personal.desc')}
              </p>
            </div>

            {!isClerkAccount && (
              <div className="profile-form">
                <label className="profile-label" htmlFor="profile-name">{t('profile.name')}</label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                  className={`profile-input ${fieldErrors.name ? 'profile-input--error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'profile-name-error' : undefined}
                />
                {fieldErrors.name && <p className="profile-field-error" id="profile-name-error">{fieldErrors.name}</p>}

                <label className="profile-label" htmlFor="profile-email">{t('profile.email')}</label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  className={`profile-input ${fieldErrors.email ? 'profile-input--error' : ''}`}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'profile-email-error' : undefined}
                />
                {fieldErrors.email && <p className="profile-field-error" id="profile-email-error">{fieldErrors.email}</p>}

                <h3 className="profile-subheading">{t('profile.academic.title')}</h3>
              </div>
            )}

            <div className="profile-form">
              <label className="profile-label" htmlFor="profile-discipline">{t('profile.discipline')}</label>
              <select
                id="profile-discipline"
                name="discipline"
                value={discipline}
                onChange={(e) => handleDisciplineChange(e.target.value)}
                className={`profile-input ${fieldErrors.discipline ? 'profile-input--error' : ''}`}
                aria-invalid={Boolean(fieldErrors.discipline)}
                aria-describedby={fieldErrors.discipline ? 'profile-discipline-error' : undefined}
              >
                <option value="">{t('profile.discipline.none')}</option>
                <option value="medicine">{t('profile.discipline.medicine')}</option>
                <option value="pharmacy">{t('profile.discipline.pharmacy')}</option>
              </select>
              {fieldErrors.discipline && <p className="profile-field-error" id="profile-discipline-error">{fieldErrors.discipline}</p>}

              <label className="profile-label" htmlFor="profile-year">{t('profile.year')}</label>
              <select
                id="profile-year"
                name="year"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className={`profile-input ${fieldErrors.year ? 'profile-input--error' : ''}`}
                disabled={!discipline}
                aria-invalid={Boolean(fieldErrors.year)}
                aria-describedby={fieldErrors.year ? 'profile-year-error' : undefined}
              >
                <option value="">{discipline ? t('profile.year.none') : t('profile.year.selectDiscipline')}</option>
                {yearChoices.map((option) => (
                  <option key={option} value={option}>{formatYearOption(option, lang)}</option>
                ))}
              </select>
              {fieldErrors.year && <p className="profile-field-error" id="profile-year-error">{fieldErrors.year}</p>}

              <div className="profile-form-actions">
                {isDirty && <span className="profile-unsaved">{t('profile.academic.unsaved')}</span>}
                <button
                  type="button"
                  className="btn-primary profile-submit"
                  onClick={handleSaveProfile}
                  disabled={!isDirty || saving}
                >
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            </div>
          </section>

          {isClerkAccount ? (
            <section className="card-teal profile-panel">
              <div className="profile-panel-head">
                <h2 className="profile-heading">{t('profile.account.title')}</h2>
                <p className="profile-panel-desc">{t('profile.account.managed')}</p>
              </div>
              <div className="profile-account-status">
                <div className="profile-account-identity">
                  <span className="profile-sub-label">{t('profile.email')}</span>
                  <span className="profile-sub-value">{headerEmail || '—'}</span>
                </div>
                <span className={`profile-badge ${headerEmailVerified ? 'profile-badge--verified' : 'profile-badge--muted'}`}>
                  {headerEmailVerified ? t('profile.account.emailVerified') : t('profile.account.emailUnverified')}
                </span>
              </div>
              <div className="profile-account-actions">
                <button type="button" className="btn-outline" onClick={handleManageAccount}>
                  <FaUserShield aria-hidden="true" />
                  {t('profile.account.manage')}
                </button>
                <button type="button" className="btn-outline" onClick={handleManageSecurity}>
                  <FaExternalLinkAlt aria-hidden="true" />
                  {t('profile.account.changePassword')}
                </button>
              </div>
              <p className="profile-account-note">{t('profile.account.clerkNote')}</p>
            </section>
          ) : (
            <section className="card-teal profile-panel">
              <div className="profile-panel-head">
                <h2 className="profile-heading">{t('profile.passwordTitle')}</h2>
                <p className="profile-panel-desc">{t('profile.passwordHint')}</p>
              </div>
              <div className="profile-form">
                {passwordFields.map((field) => {
                  const error = pwdErrors[field.key];
                  const isVisible = visiblePwd[field.visibleKey];
                  return (
                    <div className="profile-password-field" key={field.key}>
                      <label className="profile-label" htmlFor={`profile-${field.key}`}>{field.label}</label>
                      <div className="profile-password-wrap">
                        <input
                          id={`profile-${field.key}`}
                          name={field.key}
                          type={isVisible ? 'text' : 'password'}
                          autoComplete={field.autoComplete}
                          value={field.key === 'currentPassword' ? currentPassword : field.key === 'newPassword' ? newPassword : confirmPassword}
                          onChange={(e) => updatePassword(field.key, e.target.value)}
                          className={`profile-input ${error ? 'profile-input--error' : ''}`}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? `profile-${field.key}-error` : undefined}
                        />
                        <button
                          type="button"
                          className="profile-password-toggle"
                          onClick={() => setVisiblePwd((prev) => ({ ...prev, [field.visibleKey]: !prev[field.visibleKey] }))}
                          aria-label={isVisible ? t('profile.hidePassword') : t('profile.showPassword')}
                        >
                          {isVisible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                        </button>
                      </div>
                      {error && <p className="profile-field-error" id={`profile-${field.key}-error`}>{error}</p>}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn-primary profile-submit profile-submit--full"
                onClick={handleChangePassword}
                disabled={changingPwd}
              >
                {changingPwd ? t('profile.saving') : t('profile.changePwd')}
              </button>
            </section>
          )}
        </div>

        <div className="profile-column">
          <section className="card-teal profile-panel">
            <div className="profile-sub-header">
              <div className="profile-sub-heading-wrap">
                <span className={`profile-sub-icon ${activeSub ? 'active' : ''}`} aria-hidden="true">
                  {activeSub ? <FaStar /> : <FaUnlock />}
                </span>
                <h2 className="profile-sub-title">
                  {activeSub ? t('profile.subscription.my') : t('profile.subscription.none')}
                </h2>
              </div>
              {subscription && (
                <span className={`profile-sub-badge ${subscriptionStatusClass}`}>{subscriptionStatusLabel}</span>
              )}
            </div>

            {subscriptionLoading && !subscription ? (
              <div className="profile-sub-loading" aria-busy="true">
                <div className="profile-skeleton-line profile-skeleton-line--text" />
                <div className="profile-skeleton-line profile-skeleton-line--text" />
              </div>
            ) : activeSub ? (
              <>
                <div className="profile-sub-row">
                  <span className="profile-sub-label">{t('profile.subscription.plan')}</span>
                  <span className="profile-sub-value">{subscription.planName || '—'}</span>
                </div>
                <div className="profile-sub-row">
                  <span className="profile-sub-label">{t('profile.subscription.expires')}</span>
                  <span className="profile-sub-value">{subscription.endDate ? formatDate(subscription.endDate, lang) : '—'}</span>
                </div>
              </>
            ) : (
              <p className="profile-sub-desc">{t('profile.subscription.desc')}</p>
            )}

            <button type="button" className="btn-outline profile-sub-action" onClick={() => navigate('/pricing')}>
              {t('profile.subscription.viewPlans')}
            </button>
          </section>

          <section className="card-teal profile-panel">
            <div className="profile-panel-head">
              <h2 className="profile-heading">{t('profile.progress.title')}</h2>
            </div>

            {statsLoading ? (
              <div className="profile-stats-grid" aria-busy="true">
                {[0, 1, 2, 3].map((item) => (
                  <div className="stat-card" key={item}>
                    <div className="profile-skeleton-line profile-skeleton-line--value" />
                    <div className="profile-skeleton-line profile-skeleton-line--label" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="profile-stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">{t('profile.progress.quizzesTaken')}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.correct}</div>
                    <div className="stat-label">{t('profile.progress.correct')}</div>
                  </div>
                  <div className="stat-card">
                    <div className={`stat-value ${stats.percentage >= 70 ? 'profile-stat-value--high' : stats.percentage >= 50 ? 'profile-stat-value--mid' : 'profile-stat-value--low'}`}>
                      {stats.percentage.toFixed(1)}%
                    </div>
                    <div className="stat-label">{t('profile.progress.accuracy')}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value profile-stat-value--streak">{stats.streak}</div>
                    <div className="stat-label">{t('profile.progress.streak')}</div>
                  </div>
                </div>

                {results.length === 0 && (
                  <p className="profile-empty-msg">{t('profile.progress.empty')}</p>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmModal}
        title={t('profile.confirmCancelTitle')}
        message={t('profile.confirmCancelMsg')}
        confirmText={t('profile.confirmCancelYes')}
        cancelText={t('profile.confirmCancelNo')}
        confirmDisabled={saving}
        onConfirm={() => { setShowConfirmModal(false); doSaveProfile(); }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
