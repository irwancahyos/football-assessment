import { Question } from '@/lib/types';
import questionsJson from './questions.json';

export const questions: Question[] = questionsJson as Question[];

// Resolve the question at a given position in the (possibly shuffled) order.
export function getQuestion(order: number[], index: number): Question | undefined {
  const id = order[index];
  return questions.find((q) => q.id === id);
}
