'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';
import FloatingMenu from '@/app/components/FloatingMenu';

export default function StartPage() {
  const router = useRouter();
  const { t } = useI18n();

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
        <p className="text-accent/60 text-lg leading-relaxed mb-8">
          {t('quiz.readyDesc')}
        </p>
        <button
          onClick={() => router.push('/quiz/video')}
          className="inline-flex items-center gap-2 bg-accent text-primary font-heading text-xl sm:text-2xl pl-10 pr-6 py-4 rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {t('quiz.startBtn')}
          <ChevronRight className="w-6 h-6 shrink-0 stroke-3" />
        </button>
      </motion.div>

      <FloatingMenu variant="lang-home" />
    </div>
  );
}
