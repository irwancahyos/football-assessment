'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trialQuestion } from '@/data/trial';
import VideoPlayer from '../components/VideoPlayer';
import FloatingMenu from '../components/FloatingMenu';
import { useI18n } from '@/lib/i18n';

export default function TrialPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [showQuestion, setShowQuestion] = useState(false);

  const handleAnswer = () => {
    router.push('/quiz/start');
  };

  return (
    <div className="h-dvh bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex flex-col relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative z-10 w-full flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-heading text-accent text-2xl">{t('quiz.trial')}</span>
          </div>
          <span className="font-heading text-accent/50 text-sm uppercase block mb-3">{t('quiz.trialBadge')}</span>
          <div className="w-full h-1.5 bg-accent/15 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full w-0" />
          </div>
        </div>

        {/* Video */}
        {!showQuestion && (
          <div className="flex-1 flex items-center px-6 py-4">
            <VideoPlayer
              src={trialQuestion.videoUrl}
              onMaxPlays={() => setShowQuestion(true)}
            />
          </div>
        )}

        {/* Question + Options */}
        {showQuestion && (
          <>
            {/* Question — fixed */}
            <div className="px-6 pt-3 pb-1 shrink-0">
              <div className="glass rounded-xl px-6 py-4">
                <p className="font-heading text-accent text-xl leading-snug wrap-break-word">
                  {t('quiz.trialQuestion')}
                </p>
              </div>
            </div>

            {/* Answers — fill height, scrolls internally on mobile if overflow */}
            <div className="flex-1 min-h-0 px-6 py-4 flex justify-center items-center overflow-hidden">
              <div className="w-full h-full grid gap-4 auto-rows-max overflow-y-auto -m-1 p-1 sm:h-auto sm:w-full sm:max-w-6xl sm:grid-cols-2 sm:auto-rows-max sm:overflow-visible">
                {trialQuestion.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={handleAnswer}
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
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <FloatingMenu />
    </div>
  );
}
