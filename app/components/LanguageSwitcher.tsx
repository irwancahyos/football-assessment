'use client';

import { useI18n } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'id', label: 'ID', src: '/images/indonesian.avif' },
  { code: 'en', label: 'EN', src: '/images/english.webp' },
] as const;

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-6 w-6 overflow-hidden rounded-full outline-none">
          <img
            src={current.src}
            alt={current.label}
            className="h-full w-full object-cover"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-40 bg-white text-black">
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <DropdownMenuItem
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn('cursor-pointer', active && 'bg-gray-100 text-black')}
              >
                <img
                  src={l.src}
                  alt={l.label}
                  className="h-5 w-7 rounded object-cover"
                />
                <span className="flex-1">{l.label}</span>
                {active && <Check className="size-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
