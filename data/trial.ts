import { Question } from '@/lib/types';

export const trialQuestion: Question = {
  id: 0,
  category: 'defensive',
  videoUrl: 'https://res.cloudinary.com/d4lu46yz/video/upload/question-1.mp4',
  question: 'Apa yang sebaiknya dilakukan pemain yang diberi tanda?',
  hintText: '',
  hintTargetOptionId: 'a',
  options: [
    { id: 'a', imageUrl: 'https://res.cloudinary.com/d4lu46yz/image/upload/f_webp,q_auto:good,q_60,w_800/q1-answer-a-v2.png', points: 0, label: 'Opsi A', action: 'move' },
    { id: 'b', imageUrl: 'https://res.cloudinary.com/d4lu46yz/image/upload/f_webp,q_auto:good,q_60,w_800/q1-answer-b-v2.png', points: 0, label: 'Opsi B', action: 'move' },
    { id: 'c', imageUrl: 'https://res.cloudinary.com/d4lu46yz/image/upload/f_webp,q_auto:good,q_60,w_800/q1-answer-c-v2.png', points: 0, label: 'Opsi C', action: 'move' },
    { id: 'd', imageUrl: 'https://res.cloudinary.com/d4lu46yz/image/upload/f_webp,q_auto:good,q_60,w_800/q1-answer-d-v2.png', points: 0, label: 'Opsi D', action: 'move' },
  ],
};
