'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const MAX_PLAYS = 2;

interface VideoPlayerProps {
  src: string;
  onMaxPlays: () => void;
}

export default function VideoPlayer({ src, onMaxPlays }: VideoPlayerProps) {
  const { t } = useI18n();
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [showChoice, setShowChoice] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const endedRef = useRef(false);

  const canReplay = playCount < MAX_PLAYS;

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.currentTime >= v.duration) v.currentTime = 0;
    setProgress(0);
    setShowChoice(false);
    endedRef.current = false;
    v.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleEnded = () => {
    if (endedRef.current) return; // guard double-fire
    endedRef.current = true;
    setIsPlaying(false);
    setProgress(100);
    setPlayCount((c) => c + 1);
    setShowChoice(true);
  };

  useEffect(() => {
    setPlayCount(0);
    setIsPlaying(false);
    setProgress(0);
    setShowChoice(false);
    endedRef.current = false;
  }, [src]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      {/* Video container */}
      <div className="relative glass rounded-xl overflow-hidden aspect-video bg-black/30">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          playsInline
          preload="none"
          autoPlay={false}
        />

        {/* Play count badge */}
        <span className="absolute top-3 right-3 glass-strong rounded-lg font-heading text-accent text-base px-3 py-1">
          {playCount}/{MAX_PLAYS}
        </span>

        {/* Initial play button */}
        {!isPlaying && !showChoice && (
          <button
            onClick={play}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          >
            <span className="bg-accent text-primary font-heading text-3xl w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              <Play className="w-6 h-6 fill-current" />
            </span>
          </button>
        )}

        {/* Choice after a play ends — mobile: replay floats corner + answer full width; desktop: both inline */}
        {showChoice && !isPlaying && (
          <div className="absolute inset-0 bg-black/40 px-3 py-3 flex items-center justify-center">
            <div className="flex items-center sm:items-stretch gap-3 w-full sm:w-auto px-1">
              {canReplay && (
                <button
                  onClick={play}
                  aria-label={t('video.replay')}
                  className="w-14 h-14 rounded-full sm:self-stretch sm:h-auto sm:aspect-square sm:rounded-xl inline-flex shrink-0 items-center justify-center bg-accent text-primary hover:bg-accent/90 transition-all shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onMaxPlays}
                className="inline-flex flex-1 sm:flex-none w-auto sm:w-auto items-center justify-center gap-2 bg-accent text-primary font-heading text-base sm:text-lg px-6 py-3.5 rounded-xl hover:bg-accent/90 transition-all whitespace-nowrap shadow-lg"
              >
                {t('quiz.answerBtn')}
                <ChevronRight className="w-5 h-5 shrink-0 stroke-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full h-1.5 bg-accent/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
