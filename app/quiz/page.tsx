'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trialQuestion } from '@/data/trial';
import VideoPlayer from '../components/VideoPlayer';
import FloatingMenu from '../components/FloatingMenu';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function TrialPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [showQuestion, setShowQuestion] = useState(false);
  const [videoDone, setVideoDone] = useState(false);

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
        {!showQuestion && !videoDone && (
          <div className="flex-1 flex items-center px-6 py-4">
            <VideoPlayer
              src={trialQuestion.videoUrl}
              onMaxPlays={() => setVideoDone(true)}
            />
          </div>
        )}

        {/* Answer button over video backdrop */}
        {videoDone && !showQuestion && (
          <div className="flex-1 flex items-center justify-center px-6 py-4">
            <div className="relative w-full max-w-4xl aspect-video glass rounded-xl overflow-hidden">
              <video
                src={trialQuestion.videoUrl}
                className="w-full h-full object-contain opacity-30"
                playsInline
                muted
                preload="none"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button
                  onClick={() => setShowQuestion(true)}
                  className="inline-flex items-center gap-2 bg-accent text-primary font-heading text-xl px-8 py-4 rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {t('quiz.answerBtn')}
                  <ChevronRight className="w-6 h-6 shrink-0 stroke-3" />
                </button>
              </div>
            </div>
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

            {/* Answers — scrollable (mobile) / 2x2 grid (desktop) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
              <div className="flex flex-col sm:grid sm:grid-cols-2 sm:grid-rows-2 gap-3 sm:h-full">
                {trialQuestion.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={handleAnswer}
                    className="relative rounded-xl overflow-hidden transition-all glass hover:bg-white/15 hover:ring-2 hover:ring-accent/50 active:scale-[0.98] w-full aspect-video sm:aspect-auto sm:h-full"
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
