import { Question } from '@/lib/types';

export const trialQuestion: Question = {
  id: 0,
  category: 'defensive',
  videoUrl: 'https://media.bchdims.workers.dev/videos/question-01.mp4',
  question: 'Apa yang sebaiknya dilakukan pemain yang diberi tanda?',
  hintText: '',
  hintTargetOptionId: 'a',
  options: [
    { id: 'a', imageUrl: 'https://media.bchdims.workers.dev/images/q01/a.png', points: 0, label: 'Opsi A', action: 'move' },
    { id: 'b', imageUrl: 'https://media.bchdims.workers.dev/images/q01/b.png', points: 0, label: 'Opsi B', action: 'move' },
    { id: 'c', imageUrl: 'https://media.bchdims.workers.dev/images/q01/c.png', points: 0, label: 'Opsi C', action: 'move' },
    { id: 'd', imageUrl: 'https://media.bchdims.workers.dev/images/q01/d.png', points: 0, label: 'Opsi D', action: 'move' },
  ],
};
