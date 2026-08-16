'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/assessment-context';
import { Position, Foot } from '@/lib/types';
import { ChevronRight, Info, ChevronDown } from 'lucide-react';
import HeaderBar from '@/app/components/HeaderBar';
import { useI18n } from '@/lib/i18n';

const positions: { value: Position; labelKey: string }[] = [
  { value: 'goalkeeper', labelKey: 'form.pos.goalkeeper' },
  { value: 'center-back', labelKey: 'form.pos.center-back' },
  { value: 'full-back', labelKey: 'form.pos.full-back' },
  { value: 'defensive-midfielder', labelKey: 'form.pos.defensive-midfielder' },
  { value: 'central-midfielder', labelKey: 'form.pos.central-midfielder' },
  { value: 'attacking-midfielder', labelKey: 'form.pos.attacking-midfielder' },
  { value: 'winger', labelKey: 'form.pos.winger' },
  { value: 'striker', labelKey: 'form.pos.striker' },
];

const feet: { value: Foot; labelKey: string }[] = [
  { value: 'right', labelKey: 'form.foot.right' },
  { value: 'left', labelKey: 'form.foot.left' },
  { value: 'both', labelKey: 'form.foot.both' },
];

const years = Array.from({ length: 36 }, (_, i) => 2015 - i); // 2015-1980

export default function ProfilePage() {
  const router = useRouter();
  const { dispatch } = useAssessment();
  const { t } = useI18n();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedFoot, setSelectedFoot] = useState<Foot | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);

  const isValid = selectedPosition && selectedFoot && selectedYear;

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNext = () => {
    if (!isValid) return;
    dispatch({ type: 'SET_POSITION', position: selectedPosition });
    dispatch({ type: 'SET_FOOT', foot: selectedFoot });
    dispatch({ type: 'SET_BIRTHYEAR', birthYear: selectedYear });
    router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex items-center justify-center px-5 sm:px-6 pt-20 pb-10 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-100 h-100 rounded-full bg-white/15 blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-80 h-80 rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Layout: rules card (left, tall) + form (right) on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-6 lg:gap-8 items-stretch">
          {/* Rules — left, tall card with bg */}
          <div className="order-2 lg:order-1 bg-accent/10 border border-accent/20 rounded-xl px-5 py-6 text-left self-stretch lg:min-h-[480px] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-accent" />
              <p className="font-heading text-accent text-lg">{t('form.rulesTitle')}</p>
            </div>
            <div className="space-y-3 text-sm text-accent/80">
              <p className="font-heading text-accent text-base mb-1">{t('form.mustTitle')}</p>
              <div className="space-y-1.5">
                <div className="flex gap-2 items-start"><span className="text-accent shrink-0">•</span><span>{t('form.rule1')}</span></div>
                <div className="flex gap-2 items-start"><span className="text-accent shrink-0">•</span><span>{t('form.rule2')}</span></div>
              </div>

              <p className="font-heading text-accent text-base mt-4 mb-1">{t('form.legendTitle')}</p>
              <div className="space-y-1.5">
                <div className="flex gap-2 items-start"><span className="text-accent shrink-0">•</span><span>{t('form.legend1')}</span></div>
                <div className="flex gap-2 items-start"><span className="text-accent shrink-0">•</span><span>{t('form.legend2')}</span></div>
                <div className="flex gap-2 items-start"><span className="text-accent shrink-0">•</span><span>{t('form.legend3')}</span></div>
              </div>

              <p className="mt-4">{t('form.markedNote')}</p>
            </div>
          </div>

          {/* Form — right column on desktop */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <h2 className="font-heading text-3xl sm:text-5xl text-accent tracking-wide mb-6 text-center">
              {t('form.title')}
            </h2>

            {/* Position grid */}
            <label className="font-heading text-accent text-sm tracking-widest mb-3 block">
              {t('form.position')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setSelectedPosition(pos.value)}
                  className={`bg-accent/5 border rounded-xl font-heading text-xs px-3 py-3 transition-all hover:bg-accent/15 ${
                    selectedPosition === pos.value
                      ? 'border-accent! text-accent'
                      : 'text-accent/60 border-accent/20 hover:text-accent'
                  }`}
                >
                  {t(pos.labelKey as any)}
                </button>
              ))}
            </div>

            {/* Foot */}
            <label className="font-heading text-accent text-sm tracking-widest mb-3 block">
              {t('form.foot')}
            </label>
            <div className="flex gap-2 mb-6">
              {feet.map((foot) => (
                <button
                  key={foot.value}
                  onClick={() => setSelectedFoot(foot.value)}
                  className={`flex-1 bg-accent/5 border rounded-xl font-heading text-xs px-2 py-3 text-center transition-all hover:bg-accent/15 ${
                    selectedFoot === foot.value
                      ? 'border-accent! text-accent'
                      : 'text-accent/60 border-accent/20 hover:text-accent'
                  }`}
                >
                  {t(foot.labelKey as any)}
                </button>
              ))}
            </div>

            {/* Birth year */}
            <label className="font-heading text-accent text-sm tracking-widest mb-3 block">
              {t('form.year')}
            </label>
            <div ref={yearRef} className="relative mb-6">
              <button
                type="button"
                onClick={() => setYearOpen(!yearOpen)}
                className={`w-full rounded-xl font-heading text-base py-3 px-4 flex items-center justify-between cursor-pointer transition-all ${
                  selectedYear ? 'text-accent border-accent bg-accent/10' : 'border border-accent/20 bg-accent/5 text-accent/60'
                } border focus:outline-none focus:border-accent`}
              >
                <span>{selectedYear ?? t('form.pickYear')}</span>
                <ChevronDown className={`w-5 h-5 text-accent/40 transition-transform ${yearOpen ? 'rotate-180' : ''}`} />
              </button>

              {yearOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl max-h-60 overflow-y-auto z-50 shadow-2xl border border-accent/30 bg-[#e8c900]/95 backdrop-blur-xl">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => { setSelectedYear(year); setYearOpen(false); }}
                      className={`w-full text-left font-heading text-base px-4 py-2.5 transition-colors cursor-pointer ${
                        selectedYear === year
                          ? 'text-white bg-accent'
                          : 'text-accent/70 hover:text-accent hover:bg-accent/10'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleNext}
              disabled={!isValid}
              className="w-full bg-accent text-primary font-heading text-2xl px-8 py-4 rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50 disabled:hover:bg-accent disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">{t('app.continue')} <ChevronRight className="w-5 h-5" /></span>
            </button>
          </div>
        </div>
      </div>

      <HeaderBar variant="lang-home" backTo="/about" />
    </div>
  );
}
