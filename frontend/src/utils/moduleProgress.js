// Shared per-module progress helpers for the floating-object widgets.
// Both helpers return { total, completed } where `total` is the number of
// units (quizzes / exams) in the module and `completed` the number done.

// QCM: units are individual quizzes. `counts` is the /api/quiz-counts entry
// for the module ({ total, quizIds: { [courseName]: [quizId, ...] } }).
export const getModuleQuizProgress = (mod, counts, passedSet) => {
  const modId = String((mod && mod._id) || '');
  const c = counts && counts[modId];
  if (!c) return { total: 0, completed: 0 };

  const total = c.total || 0;
  let completed = 0;
  const idsByCourse = c.quizIds || {};
  for (const ids of Object.values(idsByCourse)) {
    if (!Array.isArray(ids)) continue;
    for (const id of ids) {
      if (passedSet.has(String(id))) completed += 1;
    }
  }
  return { total, completed };
};

// ECOS: units are individual exams. `examIdsByModule` maps moduleId -> [examId],
// `completedSet` holds the exam ids the user has a result for.
export const getModuleExamProgress = (mod, examIdsByModule, completedSet) => {
  const ids = (examIdsByModule && examIdsByModule[String((mod && mod._id) || '')]) || [];
  let completed = 0;
  for (const id of ids) {
    if (completedSet.has(String(id))) completed += 1;
  }
  return { total: ids.length, completed };
};
