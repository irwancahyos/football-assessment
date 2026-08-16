'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Play, BarChart3, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import HeaderBar from '@/app/components/HeaderBar';
import { useI18n } from '@/lib/i18n';

const features = [
  { icon: Play, titleKey: 'app.about.feature1.title' as const, descKey: 'app.about.feature1.desc' as const },
  { icon: Shield, titleKey: 'app.about.feature2.title' as const, descKey: 'app.about.feature2.desc' as const },
  { icon: BarChart3, titleKey: 'app.about.feature3.title' as const, descKey: 'app.about.feature3.desc' as const },
  { icon: Zap, titleKey: 'app.about.feature4.title' as const, descKey: 'app.about.feature4.desc' as const },
];

export default function AboutPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex flex-col px-5 sm:px-6 pt-20 pb-6 sm:py-10 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-100 h-100 rounded-full bg-white/15 blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center flex-1 flex flex-col justify-end sm:justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="font-heading text-xl sm:text-3xl text-accent tracking-wide mb-3">
            {t('app.title')}
          </h2>
          <p className="text-accent text-sm sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10">
            {t('app.about.desc')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0 mb-8 sm:mb-10"
        >
          {features.map((feat) => (
            <div key={feat.titleKey} className="w-[60%] min-w-[60%] sm:w-auto sm:min-w-0 snap-center shrink-0 bg-accent/5 border-accent/40 rounded-xl px-4 py-5 text-center border transition-all duration-200 hover:shadow-lg hover:shadow-accent/15">
              <feat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="font-heading text-accent text-lg mb-2">{t(feat.titleKey)}</p>
              <p className="text-accent text-sm leading-relaxed">{t(feat.descKey)}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        >
          <button
            onClick={() => router.push('/profile')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-primary font-heading text-lg sm:text-2xl pl-8 sm:pl-10 pr-5 sm:pr-6 py-3.5 sm:py-4 rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {t('app.continue')}
            <ChevronRight className="w-5 h-5 shrink-0 stroke-3" />
          </button>
        </motion.div>
      </div>

      <HeaderBar variant="lang-home" backTo="/" />
    </div>
  );
}
