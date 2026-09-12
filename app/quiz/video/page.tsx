'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/assessment-context';
import { questions } from '@/data/questions';
import VideoPlayer from '@/app/components/VideoPlayer';
import FloatingMenu from '@/app/components/FloatingMenu';
import { useI18n } from '@/lib/i18n';

export default function VideoQuestionPage() {
  const router = useRouter();
  const { state } = useAssessment();
  const { t } = useI18n();

  const question = questions[state.currentQuestion];

  useEffect(() => {
    if (!question) router.replace('/');
  }, [question, router]);

  if (!question) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex flex-col relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative z-10 w-full flex flex-col flex-1">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent text-2xl">
              {t('quiz.question')} {state.currentQuestion + 1}/{questions.length}
            </span>
            {/* space for the floating hamburger on the right */}
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

        {/* Video */}
        <div className="flex-1 flex items-center px-6 py-4">
          <VideoPlayer
            src={question.videoUrl}
            onMaxPlays={() => router.push('/quiz/answer')}
          />
        </div>
      </div>

      <FloatingMenu />
    </div>
  );
}
