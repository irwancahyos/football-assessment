'use client';

import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const MAX_PLAYS = 1;

interface VideoPlayerProps {
  src: string;
  onMaxPlays: () => void;
}

export default function VideoPlayer({ src, onMaxPlays }: VideoPlayerProps) {
  const { t } = useI18n();
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const videoRef = useRef<HTMLVideoElement>(null);
  const endedRef = useRef(false);

  const canPlay = playCount < MAX_PLAYS;

  const handlePlay = () => {
    if (!canPlay || !videoRef.current) return;
    videoRef.current.play();
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
    setPlayCount(MAX_PLAYS);
    onMaxPlays();
  };

  useEffect(() => {
    setPlayCount(0);
    setIsPlaying(false);
    setProgress(0);
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

        {/* Play button overlay */}
        {!isPlaying && canPlay && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          >
            <span className="bg-accent text-primary font-heading text-3xl w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              <Play className="w-6 h-6 fill-current" />
            </span>
          </button>
        )}

        {/* Max plays reached */}
        {!canPlay && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white font-heading text-xl">{t('video.finished')}</span>
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
