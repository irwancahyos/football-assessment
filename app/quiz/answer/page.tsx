'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/assessment-context';
import { questions } from '@/data/questions';
import FloatingMenu from '@/app/components/FloatingMenu';
import { useI18n } from '@/lib/i18n';

const QUESTION_TIME = 20; // seconds

export default function AnswerPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { t, lang } = useI18n();
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const handledRef = useRef(false);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  const question = questions[state.currentQuestion];

  useEffect(() => {
    if (!question) router.replace('/');
  }, [question, router]);

  // countdown — deadline-based so the bar reaches 0 exactly when time runs out
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    handledRef.current = false;
    const deadline = Date.now() + QUESTION_TIME * 1000;
    const id = setInterval(() => {
      const remaining = deadline - Date.now();
      setTimeLeft(remaining <= 0 ? 0 : remaining / 1000);
      if (remaining <= 0) clearInterval(id);
    }, 100);

    const audio = new Audio('/sounds/tick-loop-new.wav');
    audio.loop = true;
    tickAudioRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      clearInterval(id);
      audio.pause();
    };
  }, []);

  const goNext = () => {
    const nextIndex = state.currentQuestion + 1;
    if (nextIndex >= questions.length) {
      router.push('/result');
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
      router.push('/quiz/video');
    }
  };

  const submit = (optionId: string, points: number) => {
    if (handledRef.current) return;
    handledRef.current = true;
    dispatch({
      type: 'ANSWER_QUESTION',
      answer: { questionId: question.id, selectedOption: optionId, points },
    });
    goNext();
  };

  // timeout -> 0 points
  useEffect(() => {
    if (timeLeft === 0 && !handledRef.current) {
      handledRef.current = true;
      dispatch({
        type: 'ANSWER_QUESTION',
        answer: { questionId: question.id, selectedOption: '', points: 0 },
      });
      goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (!question) return null;

  return (
    <div className="h-dvh bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex flex-col relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative z-10 w-full flex flex-col flex-1 min-h-0">
        {/* Header — fixed (not scrollable) */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent text-2xl">
              {t('quiz.question')} {state.currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <span className="font-heading text-accent/50 text-sm uppercase block mb-3">
            {question.category === 'offensive' ? t('cat.offensive') : t('cat.defensive')}
          </span>
          <div className="w-full h-1.5 bg-accent/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${((state.currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question + timer — constrained, centered */}
        <div className="mx-auto w-full max-w-4xl px-6 pt-3 pb-1 shrink-0">
          <div className="glass rounded-xl px-6 py-4">
            <p className="font-heading text-accent text-xl leading-snug wrap-break-word">
              {question.question}
            </p>
          </div>

          {/* Timer bar — red, shrinking */}
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
            />
          </div>
        </div>

        {/* Answers — fill height, scrolls internally on mobile if overflow */}
        <div className="flex-1 min-h-0 px-6 py-4 flex justify-center items-center overflow-hidden">
          <div className="w-full h-full grid gap-4 auto-rows-max overflow-y-auto -m-1 p-1 sm:h-auto sm:w-full sm:max-w-6xl sm:grid-cols-2 sm:auto-rows-max sm:overflow-visible">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => submit(opt.id, opt.points)}
                className="relative rounded-xl overflow-hidden transition-all glass hover:bg-white/15 hover:ring-2 hover:ring-accent/50 active:scale-[0.98] min-h-0 w-full shrink-0 aspect-877/383 sm:aspect-auto sm:w-full sm:h-full"
              >
                <img
                  src={opt.imageUrl}
                  alt={`Opsi ${opt.id.toUpperCase()}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-accent text-primary font-heading text-sm px-2 py-0.5 rounded-md">
                  {opt.id.toUpperCase()}
                </span>
                {opt.id === question.hintTargetOptionId && question.hintText && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white font-heading text-xs px-2 py-1 rounded-md whitespace-nowrap">
                    {lang === 'en'
                      ? question.hintText === 'Tetap Pada Posisi' ? 'Stay in Position' : question.hintText === 'Lakukan Duel Udara' ? 'Win the Aerial Duel' : question.hintText === 'Free Ball Untuk Attacking Midfielder' ? 'Free Ball for Attacking Midfielder' : question.hintText
                      : question.hintText}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating hamburger menu */}
      <FloatingMenu />
    </div>
  );
}
