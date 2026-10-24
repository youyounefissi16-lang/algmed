import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { FaBullseye, FaCheckCircle, FaClipboardList, FaFire, FaRedo } from 'react-icons/fa';
import { API_BASE_URL, fetchWithAuth } from '../config/api';
import AuthImage from '../components/AuthImage';
import { SkeletonQuizItem } from '../components/LoadingSkeleton';
import { useTranslation } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate, formatShortDate } from '../utils/formatDate';
import { logger } from '../utils/logger';
import useDocumentTitle from '../utils/useDocumentTitle';
import '../styles/teal-theme.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

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

const ReviewPage = () => {
  const { t, lang } = useTranslation();
  const { darkMode } = useTheme();
  useDocumentTitle(t('review.title'));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  let userId;
  try { userId = localStorage.getItem('userId'); } catch { userId = null; }

  const fetchResults = useCallback(async (signal) => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/results/${userId}?limit=200`, signal ? { signal } : undefined);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      if (err.name === 'AbortError') return;
      logger.error({ err }, 'ReviewPage fetchResults failed');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchResults(controller.signal);
    return () => controller.abort();
  }, [fetchResults]);

  const wrongAnswers = useMemo(() => {
    const seen = new Set();
    return results
      .filter((r) => r.score === 0 && r.quizId && r.quizId._id)
      .filter((r) => {
        const dup = seen.has(r.quizId._id);
        seen.add(r.quizId._id);
        return !dup;
      });
  }, [results]);

  const stats = useMemo(() => {
    const total = results.length;
    const correct = results.filter((r) => r.score === 1).length;
    return {
      total,
      correct,
      percentage: total > 0 ? (correct / total) * 100 : 0,
      streak: calcStreak(results),
    };
  }, [results]);

  const palette = useMemo(() => (
    darkMode
      ? {
          accent: '#22D3EE',
          danger: '#f87171',
          text: '#94a3b8',
          textDark: '#f1f5f9',
          grid: 'rgba(148, 163, 184, 0.12)',
          fill: 'rgba(34, 211, 238, 0.14)',
          barHigh: 'rgba(34, 211, 238, 0.9)',
          barMid: 'rgba(34, 211, 238, 0.6)',
          barLow: 'rgba(34, 211, 238, 0.32)',
          tooltipBg: '#1E293B',
          tooltipText: '#F8FAFC',
        }
      : {
          accent: '#4F6BFF',
          danger: '#EF4444',
          text: '#64748B',
          textDark: '#0F172A',
          grid: 'rgba(15, 23, 42, 0.06)',
          fill: 'rgba(79, 107, 255, 0.10)',
          barHigh: 'rgba(79, 107, 255, 0.82)',
          barMid: 'rgba(79, 107, 255, 0.55)',
          barLow: 'rgba(79, 107, 255, 0.28)',
          tooltipBg: '#0F172A',
          tooltipText: '#F8FAFC',
        }
  ), [darkMode]);

  const trendData = useMemo(() => {
    const last = [...results]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-20);
    return {
      labels: last.map((r) => formatShortDate(r.timestamp, lang)),
      datasets: [{
        label: t('review.chartAccuracy'),
        data: last.map((r) => r.score * 100),
        borderColor: palette.accent,
        backgroundColor: palette.fill,
        pointBackgroundColor: last.map((r) => (r.score === 1 ? palette.accent : palette.danger)),
        pointBorderColor: palette.accent,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      }],
    };
  }, [results, lang, palette, t]);

  const moduleData = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      const moduleName = r.quizId?.moduleId?.name || t('profile.unknown');
      if (!map[moduleName]) map[moduleName] = { total: 0, correct: 0 };
      map[moduleName].total++;
      if (r.score === 1) map[moduleName].correct++;
    });
    const entries = Object.entries(map)
      .map(([moduleName, value]) => ({
        name: moduleName,
        accuracy: value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);
    return {
      labels: entries.map((entry) => entry.name),
      datasets: [{
        label: t('review.chartAccuracyPct'),
        data: entries.map((entry) => entry.accuracy),
        backgroundColor: entries.map((entry) => (
          entry.accuracy >= 70 ? palette.barHigh
            : entry.accuracy >= 50 ? palette.barMid
              : palette.barLow
        )),
        borderRadius: 4,
      }],
    };
  }, [results, palette, t]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        titleColor: palette.tooltipText,
        bodyColor: palette.tooltipText,
        callbacks: { label: (ctx) => `${ctx.parsed.y}%` },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (value) => `${value}%`, color: palette.text, font: { size: 11 } },
        grid: { color: palette.grid },
      },
      x: {
        ticks: { color: palette.text, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
        grid: { display: false },
      },
    },
  }), [palette]);

  const barOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        titleColor: palette.tooltipText,
        bodyColor: palette.tooltipText,
        callbacks: { label: (ctx) => `${ctx.parsed.x}%` },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: { callback: (value) => `${value}%`, color: palette.text, font: { size: 11 } },
        grid: { color: palette.grid },
      },
      y: {
        ticks: { color: palette.textDark, font: { size: 11 }, autoSkip: false },
        grid: { display: false },
      },
    },
  }), [palette]);

  if (error) {
    return (
      <div className="page-teal review-page">
        <section className="card-teal review-panel">
          <div className="review-empty">
            <span className="review-empty-icon review-empty-icon--danger"><FaClipboardList /></span>
            <h2>{t('review.errorTitle')}</h2>
            <p>{t('review.errorLoading', { error })}</p>
            <button type="button" className="btn-primary" onClick={() => fetchResults()}>{t('review.retry')}</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-teal review-page">
      <section className="review-hero">
        <div className="review-hero-copy">
          <p className="review-eyebrow">{t('review.eyebrow')}</p>
          <h1>{t('review.title')}</h1>
          <p className="review-subtitle">{t('review.subtitle')}</p>
        </div>
        <div className="review-hero-actions">
          <button type="button" className="btn-outline review-refresh" onClick={() => fetchResults()} disabled={loading}>
            {t('review.refresh')}
          </button>
          <button type="button" className="btn-primary review-start" onClick={() => navigate('/quizPage')}>
            {t('review.startQuiz')}
          </button>
        </div>
      </section>

      <section className="review-section" aria-labelledby="review-stats-title">
        <div className="review-section-head">
          <h2 id="review-stats-title">{t('review.statsTitle')}</h2>
        </div>

        {loading ? (
          <div className="review-stats-grid" aria-busy="true">
            {[0, 1, 2, 3].map((item) => (
              <div className="review-stat-card" key={item}>
                <div className="profile-skeleton-line profile-skeleton-line--value" />
                <div className="profile-skeleton-line profile-skeleton-line--label" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="review-stats-grid">
              <div className="review-stat-card">
                <span className="review-stat-icon review-stat-icon--blue"><FaClipboardList /></span>
                <span className="review-stat-value">{stats.total}</span>
                <span className="review-stat-label">{t('profile.progress.quizzesTaken')}</span>
              </div>
              <div className="review-stat-card">
                <span className="review-stat-icon review-stat-icon--green"><FaCheckCircle /></span>
                <span className="review-stat-value">{stats.correct}</span>
                <span className="review-stat-label">{t('profile.progress.correct')}</span>
              </div>
              <div className="review-stat-card">
                <span className="review-stat-icon review-stat-icon--violet"><FaBullseye /></span>
                <span className={`review-stat-value ${stats.percentage >= 70 ? 'profile-stat-value--high' : stats.percentage >= 50 ? 'profile-stat-value--mid' : 'profile-stat-value--low'}`}>
                  {stats.percentage.toFixed(1)}%
                </span>
                <span className="review-stat-label">{t('profile.progress.accuracy')}</span>
              </div>
              <div className="review-stat-card">
                <span className="review-stat-icon review-stat-icon--orange"><FaFire /></span>
                <span className="review-stat-value profile-stat-value--streak">{stats.streak}</span>
                <span className="review-stat-label">{t('profile.progress.streak')}</span>
              </div>
            </div>

            {results.length === 0 && (
              <p className="profile-empty-msg">{t('review.noStats')}</p>
            )}
          </>
        )}
      </section>

      {!loading && results.length > 1 && (
        <div className={`review-charts-grid${moduleData.labels.length === 0 ? ' review-charts-grid--single' : ''}`}>
          <section className="card-teal review-panel">
            <div className="review-panel-head">
              <div>
                <h2 className="review-panel-title">{t('review.trendTitle')}</h2>
                <p className="review-panel-desc">{t('review.trendDesc')}</p>
              </div>
            </div>
            <div className="review-chart-wrap" role="img" aria-label={t('review.trendTitle')}>
              <Line data={trendData} options={lineOptions} />
            </div>
          </section>

          {moduleData.labels.length > 0 && (
            <section className="card-teal review-panel">
              <div className="review-panel-head">
                <div>
                  <h2 className="review-panel-title">{t('review.moduleTitle')}</h2>
                  <p className="review-panel-desc">{t('review.moduleDesc')}</p>
                </div>
              </div>
              <div
                className="review-chart-wrap review-chart-wrap--bar"
                style={{ height: Math.max(180, moduleData.labels.length * 34) }}
                role="img"
                aria-label={t('review.moduleTitle')}
              >
                <Bar data={moduleData} options={barOptions} />
              </div>
            </section>
          )}
        </div>
      )}

      {!loading && results.length === 1 && (
        <p className="review-help">{t('profile.progress.needMore')}</p>
      )}

      <section className="card-teal review-panel review-queue" aria-labelledby="review-queue-title">
        <div className="review-queue-head">
          <div>
            <h2 id="review-queue-title" className="review-panel-title">{t('review.queueTitle')}</h2>
            <p className="review-panel-desc">{t('review.queueDesc')}</p>
          </div>
          {!loading && wrongAnswers.length > 0 && (
            <span className="review-count-badge">{t('review.queueCount', { count: wrongAnswers.length })}</span>
          )}
        </div>

        {loading ? (
          <SkeletonQuizItem count={4} />
        ) : wrongAnswers.length === 0 ? (
          <div className="review-empty">
            <span className="review-empty-icon"><FaCheckCircle /></span>
            <h3>{t('review.emptyTitle')}</h3>
            <p>{t('review.emptyDesc')}</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/quizPage')}>{t('review.startQuiz')}</button>
          </div>
        ) : (
          <div className="review-list">
            {wrongAnswers.map((r) => {
              const quiz = r.quizId;
              const moduleName = quiz.moduleId?.name || quiz.moduleName;
              return (
                <article key={r._id} className="review-item">
                  <div className="review-item-head">
                    <span className="review-item-qid">{quiz.quizId || t('review.questionLabel')}</span>
                    {moduleName && <span className="review-item-chip">{moduleName}</span>}
                    {quiz.course && <span className="review-item-chip review-item-chip--muted">{quiz.course}</span>}
                  </div>
                  <h3 className="review-item-title">{quiz.question?.questionText?.substring(0, 120) || quiz._id}</h3>
                  {quiz.question?.questionImage && (
                    <AuthImage src={`${API_BASE_URL}/api/quiz-images/${encodeURIComponent(quiz.question.questionImage)}`} alt="Question" style={{ maxWidth: '100%', maxHeight: 170, borderRadius: 8, margin: '4px 0 10px' }} />
                  )}
                  <div className="review-item-foot">
                    <span className="review-item-date">{t('review.lastAttempt', { date: formatDate(r.timestamp, lang) })}</span>
                    <button
                      type="button"
                      className="btn-primary review-item-action"
                      onClick={() => navigate(`/quiz/${quiz._id}`, { state: { from: '/review', quizId: quiz._id, quizName: quiz.question?.questionText || quiz.quizId, question: quiz.question, caseId: quiz.caseId || null } })}
                    >
                      <FaRedo aria-hidden="true" /> {t('review.retryBtn')}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReviewPage;
