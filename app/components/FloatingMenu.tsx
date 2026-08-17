'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/assessment-context';
import { useI18n } from '@/lib/i18n';
import { Menu, Home, RotateCcw, X } from 'lucide-react';

// variant controls which items show inside the menu
// 'lang-only'      -> language only (landing page)
// 'lang-home'      -> language + home (description page)
// 'lang-home-test' -> language + home + new test (quiz flow)
type Variant = 'lang-only' | 'lang-home' | 'lang-home-test';

// position controls where the hamburger sits
// 'bottom'     -> always bottom-left with round bg (landing)
// 'responsive' -> mobile top-right plain, desktop bottom-left round
type Position = 'bottom' | 'responsive';

export default function FloatingMenu({
  variant = 'lang-home-test',
  position = 'responsive',
}: {
  variant?: Variant;
  position?: Position;
}) {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isBottom = position === 'bottom';

  return (
    <div
      ref={ref}
      className={`fixed z-50 flex flex-col gap-2 ${
        isBottom
          ? 'bottom-4 left-4 items-start'
          : 'top-6 right-4 items-end sm:top-auto sm:right-auto sm:bottom-4 sm:left-4 sm:items-start'
      }`}
    >
      {/* Menu items */}
      {open && (
        <div className={`flex flex-col gap-2 ${isBottom ? 'items-start' : 'items-end sm:items-start'}`}>
          {/* Language segmented toggle */}
          <div className="relative flex rounded-full bg-accent p-1 w-[7.5rem] h-10 shadow-lg">
            <span
              className={`absolute top-1 bottom-1 left-1 w-14 rounded-full bg-primary transition-transform duration-300 ease-out ${
                lang === 'en' ? 'translate-x-14' : 'translate-x-0'
              }`}
            />
            <button
              onClick={() => setLang('id')}
              className={`relative z-10 flex-1 py-1 text-center font-heading text-sm transition-colors ${
                lang === 'id' ? 'text-accent' : 'text-primary/80'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`relative z-10 flex-1 py-1 text-center font-heading text-sm transition-colors ${
                lang === 'en' ? 'text-accent' : 'text-primary/80'
              }`}
            >
              EN
            </button>
          </div>

          {(variant === 'lang-home' || variant === 'lang-home-test') && (
            <button
              onClick={() => router.push('/')}
              className="w-[7.5rem] h-10 flex items-center justify-center gap-2 bg-accent/90 text-primary font-heading text-sm px-4 rounded-full shadow-lg hover:bg-accent transition-all"
            >
              <Home className="w-4 h-4" />
              {t('menu.home')}
            </button>
          )}

          {variant === 'lang-home-test' && (
            <button
              onClick={() => {
                dispatch({ type: 'RESET' });
                router.push('/profile');
              }}
              className="w-[7.5rem] h-10 flex items-center justify-center gap-2 bg-accent/90 text-primary font-heading text-sm px-4 rounded-full shadow-lg hover:bg-accent transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {t('menu.newTest')}
            </button>
          )}
        </div>
      )}

      {/* Hamburger toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        className={`flex items-center justify-center transition-all ${
          isBottom
            ? 'w-12 h-12 rounded-full bg-accent text-primary shadow-lg hover:bg-accent/90'
            : 'w-10 h-10 rounded-full bg-white/30 backdrop-blur-xl text-accent shadow-md sm:w-12 sm:h-12 sm:bg-accent sm:text-primary sm:shadow-lg sm:hover:bg-accent/90'
        }`}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );
}
