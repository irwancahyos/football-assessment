export type Position =
  | 'goalkeeper'
  | 'center-back'
  | 'full-back'
  | 'defensive-midfielder'
  | 'central-midfielder'
  | 'attacking-midfielder'
  | 'winger'
  | 'striker';

export type Foot = 'right' | 'left' | 'both';

export type Category = 'offensive' | 'defensive';

export type OptionAction = 'move' | 'stay';

export interface Option {
  id: 'a' | 'b' | 'c' | 'd';
  imageUrl: string;
  points: number; // 1-5
  label: string;
  action: OptionAction; // 'move' = pindah posisi, 'stay' = tetap di posisi semula
}

export interface Question {
  id: number;
  category: Category;
  difficulty?: string;
  videoUrl: string;
  question: string;
  hintText: string;
  hintTargetOptionId: 'a' | 'b' | 'c' | 'd';
  options: Option[];
}

export interface Answer {
  questionId: number;
  selectedOption: string;
  points: number;
}

export interface AssessmentState {
  position: Position | null;
  foot: Foot | null;
  birthYear: number | null;
  currentQuestion: number;
  answers: Answer[];
  videoPlayCount: number;
}
