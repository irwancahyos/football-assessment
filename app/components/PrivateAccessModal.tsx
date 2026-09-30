'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const TELEGRAM_HANDLE = 'giovedicatur';
const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLE}`;

export default function PrivateAccessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`@${TELEGRAM_HANDLE}`);
    } catch {
      return; // ponytail: clipboard unavailable (non-secure context) — skip feedback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-accent/20 px-5 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-access-title"
    >
      {/* ponytail: alt blue trial — revert to bg-[#1f2e6c] to restore. */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-[#1f4a93] px-5 py-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('access.close')}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-primary transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl text-accent">
          !
        </div>
        <h2 id="private-access-title" className="font-heading text-3xl tracking-wide text-primary">
          {t('access.blockedTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          {t('access.blockedDescription')}
        </p>
        <p className="mt-1 text-xs font-semibold text-primary/80">
          {t('access.privateNotice')}
        </p>

        <div className="mt-5 flex gap-2">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-[70%] items-center justify-center rounded-xl bg-[#229ED9] px-4 py-3 font-heading text-sm tracking-wide text-white shadow-lg transition-colors hover:bg-[#168ac0]"
          >
            {t('access.contactAdmin')}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex w-[30%] items-center justify-center gap-1.5 rounded-xl border border-primary/50 px-2 py-3 font-heading text-sm text-primary transition-colors hover:bg-primary/10"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? t('access.copied') : t('access.copy')}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl border border-primary/50 px-4 py-2.5 font-heading text-sm text-primary transition-colors hover:bg-primary/10"
        >
          <span>{t('access.close')}</span>
        </button>
      </div>
    </div>
  );
}
