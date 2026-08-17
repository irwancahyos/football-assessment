'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';

export default function Landing() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/background-image-compress.webp)' }}
      />
      {/* Yellow gradient overlay: thick at bottom, transparent at top */}
      <div className="absolute inset-0 bg-linear-to-t from-primary to-transparent" />


      {/* Decorative blur circles */}
      <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-white/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-100 h-100 rounded-full bg-white/15 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 px-6 text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-0"
        >
          <h1 className="font-heading text-4xl sm:text-5xl text-accent leading-[0.85] tracking-wide">
            {t('app.title')}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        >
          <button
            onClick={() => router.push('/about')}
            className="inline-flex items-center gap-2 bg-accent text-primary font-heading text-xl sm:text-2xl pl-10 pr-6 py-4 rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {t('app.start')}
            <ChevronRight className="w-6 h-6 shrink-0 stroke-3" />
          </button>
        </motion.div>
      </div>

      <LanguageSwitcher />
    </div>
  );
}
