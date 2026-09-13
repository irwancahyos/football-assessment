'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AssessmentState, Answer, Position, Foot } from './types';
import { questions } from '@/data/questions';

type Action =
  | { type: 'SET_POSITION'; position: Position }
  | { type: 'SET_FOOT'; foot: Foot }
  | { type: 'SET_BIRTHYEAR'; birthYear: number }
  | { type: 'ANSWER_QUESTION'; answer: Answer }
  | { type: 'INCREMENT_PLAY_COUNT' }
  | { type: 'RESET_PLAY_COUNT' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SHUFFLE_QUESTIONS' }
  | { type: 'RESET' };

// Fisher–Yates shuffle, returns a fresh copy
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deterministic initial state — identical on server and client to avoid hydration mismatch.
// Question order starts natural; shuffled client-side on mount and on RESET.
function makeInitialState(): AssessmentState {
  return {
    position: null,
    foot: null,
    birthYear: null,
    currentQuestion: 0,
    questionOrder: questions.map((q) => q.id),
    answers: [],
    videoPlayCount: 0,
  };
}

function reducer(state: AssessmentState, action: Action): AssessmentState {
  switch (action.type) {
    case 'SET_POSITION':
      return { ...state, position: action.position };
    case 'SET_FOOT':
      return { ...state, foot: action.foot };
    case 'SET_BIRTHYEAR':
      return { ...state, birthYear: action.birthYear };
    case 'ANSWER_QUESTION':
      return { ...state, answers: [...state.answers, action.answer] };
    case 'INCREMENT_PLAY_COUNT':
      return { ...state, videoPlayCount: state.videoPlayCount + 1 };
    case 'RESET_PLAY_COUNT':
      return { ...state, videoPlayCount: 0 };
    case 'NEXT_QUESTION':
      return { ...state, currentQuestion: state.currentQuestion + 1, videoPlayCount: 0 };
    case 'SHUFFLE_QUESTIONS':
      return { ...state, questionOrder: shuffle(questions.map((q) => q.id)) };
    case 'RESET':
      return { ...makeInitialState(), questionOrder: shuffle(questions.map((q) => q.id)) };
    default:
      return state;
  }
}

const AssessmentContext = createContext<{
  state: AssessmentState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  // Shuffle only after mount — Math.random() on the client is fine post-hydration.
  useEffect(() => {
    dispatch({ type: 'SHUFFLE_QUESTIONS' });
  }, []);

  return <AssessmentContext.Provider value={{ state, dispatch }}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
