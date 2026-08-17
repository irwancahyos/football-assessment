'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/assessment-context';
import { useI18n } from '@/lib/i18n';
import { Menu, Home, RotateCcw, X, ChevronLeft } from 'lucide-react';

type Variant = 'lang-only' | 'lang-home' | 'lang-home-test';

export default function HeaderBar({
  variant = 'lang-home-test',
  backTo = '/',
  showBack = true,
}: {
  variant?: Variant;
  backTo?: string;
  showBack?: boolean;
}) {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref}>
      {/* ==== MOBILE: full-width top bar, blur only when scrolled ==== */}
      <div
        className={`sm:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
          scrolled ? 'bg-white/20 backdrop-blur-xl border-white/10' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {showBack ? (
            <button
              onClick={() => router.push(backTo)}
              aria-label={t('app.back')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-accent hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <span className="w-10" />
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="w-10 h-10 flex items-center justify-center rounded-full text-accent hover:bg-white/20 transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ==== MOBILE dropdown: floats OVER the bar, doesn't extend bar height ==== */}
      {open && (
        <div className="sm:hidden fixed top-14 right-4 z-50 flex flex-col items-end gap-2">
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

      {/* ==== DESKTOP: round floating buttons (as before) ==== */}
      {/* Back button — top left */}
      {showBack && (
        <button
          onClick={() => router.push(backTo)}
          aria-label={t('app.back')}
          className="hidden sm:flex fixed top-6 left-6 z-50 w-10 h-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-xl text-accent hover:text-accent/80 transition-colors shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Hamburger — bottom left, round bg */}
      <div className="hidden sm:flex fixed bottom-4 left-4 z-50 flex-col items-start gap-2">
        {open && (
          <div className="flex flex-col items-start gap-2">
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

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="w-12 h-12 rounded-full bg-accent text-primary shadow-lg hover:bg-accent/90 transition-all flex items-center justify-center"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
