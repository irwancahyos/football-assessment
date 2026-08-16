'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AssessmentState, Answer, Position, Foot } from './types';

type Action =
  | { type: 'SET_POSITION'; position: Position }
  | { type: 'SET_FOOT'; foot: Foot }
  | { type: 'SET_BIRTHYEAR'; birthYear: number }
  | { type: 'ANSWER_QUESTION'; answer: Answer }
  | { type: 'INCREMENT_PLAY_COUNT' }
  | { type: 'RESET_PLAY_COUNT' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };

const initialState: AssessmentState = {
  position: null,
  foot: null,
  birthYear: null,
  currentQuestion: 0,
  answers: [],
  videoPlayCount: 0,
};

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
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const AssessmentContext = createContext<{
  state: AssessmentState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AssessmentContext.Provider value={{ state, dispatch }}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
