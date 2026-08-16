import { Answer, Category } from './types';

export function calculateTotalScore(answers: Answer[]): number {
  return answers.reduce((sum, a) => sum + a.points, 0);
}

export function calculateCategoryScores(
  answers: Answer[],
  questions: { id: number; category: Category }[]
): Record<Category, number> {
  const scores: Record<Category, number> = { offensive: 0, defensive: 0 };

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      scores[question.category] += answer.points;
    }
  }

  return scores;
}

// totalScore is on a 1-10 scale
export function getRatingTier(totalScore: number): string {
  if (totalScore >= 9) return 'ELITE';
  if (totalScore >= 7.5) return 'ADVANCED';
  if (totalScore >= 5) return 'INTERMEDIATE';
  return 'BEGINNER';
}

export function getMaxScore(questionsCount: number): number {
  return questionsCount * 4; // max 4 points per question
}

// normalize raw score to a 1-10 scale (proportional to max)
export function scaleTo10(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((score / max) * 100) / 10; // 1 decimal place
}
