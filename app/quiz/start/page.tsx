'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';
import { useAssessment } from '@/lib/assessment-context';
import FloatingMenu from '@/app/components/FloatingMenu';
import PrivateAccessModal from '@/app/components/PrivateAccessModal';
import { getStoredToken, verifyToken, type AccessState } from '@/lib/access';

export default function StartPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { dispatch } = useAssessment();
  const [state, setState] = useState<AccessState>('checking');

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState('missing');
      return;
    }
    verifyToken(token).then((ok) => setState(ok ? 'valid' : 'invalid'));
  }, []);

  const blocked = state === 'missing' || state === 'invalid' || state === 'error';

  const handleStart = () => {
    dispatch({ type: 'START_RUN' });
    router.push('/quiz/video');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-100 h-100 rounded-full bg-accent/8 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-lg text-center px-4"
      >
        <h2 className="font-heading text-5xl text-accent tracking-wide mb-4">
          {t('quiz.ready')}
        </h2>
        {state === 'checking' && (
          <p className="text-accent/60 text-lg leading-relaxed mb-8">
            {t('access.checking')}
          </p>
        )}
        {state === 'valid' && (
          <>
            <p className="text-accent/60 text-lg leading-relaxed mb-8">
              {t('quiz.readyDesc')}
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-heading text-xl text-primary shadow-lg transition-all hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('quiz.startBtn')}
            </button>
          </>
        )}
        {blocked && (
          <p className="text-accent/60 text-lg leading-relaxed mb-8">
            {t('access.invalidDescription')}
          </p>
        )}
      </motion.div>

      <PrivateAccessModal open={blocked} onClose={() => router.push('/')} />
      <FloatingMenu variant="lang-home" />
    </div>
  );
}
