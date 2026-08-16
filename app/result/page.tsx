'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/assessment-context';
import { questions } from '@/data/questions';
import { calculateTotalScore, calculateCategoryScores, getRatingTier, getMaxScore, scaleTo10 } from '@/lib/scoring';
import { Category } from '@/lib/types';
import { RotateCcw, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n';

const categoryColors: Record<Category, string> = {
  offensive: '#e03131',
  defensive: '#1f2e6c',
};

const CENTER = 180;
const RADIUS = 85;
const STROKE = 30;
const GAP_DEG = 4; // gap between the 3 equal segments, in degrees

export default function ResultPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { t } = useI18n();

  const isComplete = state.answers.length >= questions.length;

  useEffect(() => {
    if (!isComplete) router.replace('/');
  }, [isComplete, router]);

  if (!isComplete) return null;

  const rawTotal = calculateTotalScore(state.answers);
  const maxScore = getMaxScore(questions.length);
  const totalScore = scaleTo10(rawTotal, maxScore);
  const rawCategory = calculateCategoryScores(state.answers, questions);
  const tier = getRatingTier(totalScore);

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const cats = Object.keys(categoryColors) as Category[];
  const sliceDeg = 360 / cats.length;

  const segments = cats.map((cat, i) => {
    const raw = rawCategory[cat];
    const max = questions.filter((q) => q.category === cat).length * 4;
    const score = scaleTo10(raw, max);
    const startDeg = i * sliceDeg + GAP_DEG / 2 - 90;
    const endDeg = (i + 1) * sliceDeg - GAP_DEG / 2 - 90;
    const midDeg = (startDeg + endDeg) / 2;
    return { cat, score, max: 10, startDeg, endDeg, midDeg, color: categoryColors[cat] };
  });

  const polar = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
  };

  const arcPath = (startDeg: number, endDeg: number) => {
    const start = polar(startDeg, RADIUS);
    const end = polar(endDeg, RADIUS);
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`;
  };

  // dogleg label line: short diagonal from ring edge, then horizontal to text
  const labelLine = (midDeg: number) => {
    const isBottom = Math.sin((midDeg * Math.PI) / 180) > 0.15;
    const isTop = Math.sin((midDeg * Math.PI) / 180) < -0.15;
    const isRight = Math.cos((midDeg * Math.PI) / 180) >= 0;

    const p1 = polar(midDeg, RADIUS + STROKE / 2 + 4);
    const diagLen = 14;
    const diagAngle = isTop ? midDeg : isBottom ? midDeg : midDeg;
    const p2 = isTop || isBottom
      ? polar(midDeg, RADIUS + STROKE / 2 + 4 + diagLen)
      : { x: p1.x + (isRight ? diagLen : -diagLen), y: p1.y };
    const p3 = { x: p2.x + (isRight ? 18 : -18), y: p2.y };

    return { p1, p2, p3, isRight };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAD707] via-[#f0cf00] to-[#FAD707] flex items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-125 h-125 rounded-full bg-white/10 blur-[120px]" />
      <div className="absolute bottom-[-15%] left-[-10%] w-100 h-100 rounded-full bg-accent/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full relative z-10 flex flex-col items-center"
      >
        <h2 className="font-heading text-4xl text-accent tracking-wide mb-2 text-center">
          {t('result.title')}
        </h2>

        <svg width="100%" viewBox="0 0 360 280" className="max-w-xs mb-1">
          {segments.map((seg) => (
            <path
              key={seg.cat}
              d={arcPath(seg.startDeg, seg.endDeg)}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          ))}

          {segments.map((seg) => {
            const { p1, p2, p3, isRight } = labelLine(seg.midDeg);
            return (
              <g key={`label-${seg.cat}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={seg.color} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke={seg.color} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                <text
                  x={p3.x + (isRight ? 4 : -4)}
                  y={p3.y + 5}
                  textAnchor={isRight ? 'start' : 'end'}
                  fill={seg.color}
                  fontSize="18"
                  fontWeight="bold"
                  className="font-heading"
                >
                  {Math.round(seg.score * 10)}%
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
          {segments.map((seg) => (
            <div key={`legend-${seg.cat}`} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="font-heading text-accent/50 text-sm">{seg.cat === 'offensive' ? t('cat.offensive') : t('cat.defensive')}</span>
              <span className="font-heading text-accent text-sm">{seg.score}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="font-heading text-accent/50 text-sm">{t('result.overall')}</span>
            <span className="font-heading text-accent text-lg">{totalScore}/10</span>
            <span className="font-heading text-accent/40 text-sm tracking-widest">
              {tier === 'ELITE' ? t('result.tier.elite') : tier === 'ADVANCED' ? t('result.tier.advanced') : tier === 'INTERMEDIATE' ? t('result.tier.intermediate') : t('result.tier.beginner')}
            </span>
          </div>
        </div>

        <div className="font-heading text-accent/50 text-sm tracking-wide mb-8 -mt-4">
          {dateStr} · {timeStr}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => {
              dispatch({ type: 'RESET' });
              router.push('/profile');
            }}
            className="flex-1 border border-accent/40 rounded-xl font-heading text-base px-4 py-3 text-accent/70 hover:text-accent hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t('result.retry')}
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'RESET' });
              router.push('/');
            }}
            className="flex-1 bg-accent text-primary font-heading text-base px-4 py-3 rounded-xl hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            {t('result.finish')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
