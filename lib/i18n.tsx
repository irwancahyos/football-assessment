'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Lang = 'id' | 'en';

const dict = {
  // Landing
  'app.title': { id: 'Football Decision Making Assessment', en: 'Football Decision Making Assessment' },
  'app.start': { id: 'MULAI ASSESSMENT', en: 'START ASSESSMENT' },

  // About / description
  'app.about.desc': {
    id: 'Football Decision-Making Assessment (FDMA) merupakan penilaian pengambilan keputusan pemain sepakbola melalui tes online. Hasil tes memberikan informasi objektif perihal kemampuan decision-making pemain sepakbola.',
    en: 'Football Decision-Making Assessment (FDMA) is an assessment of soccer players\' decision-making through an online test. Test results provide objective information about a player\'s decision-making ability.',
  },
  'app.about.feature1.title': { id: '30 Soal Video', en: '30 Video Questions' },
  'app.about.feature1.desc': {
    id: 'Masing-masing soal menampilkan video situasi permainan nyata yang harus dianalisis',
    en: 'Each question presents a video of a real match situation to analyze',
  },
  'app.about.feature2.title': { id: '3 Aspek Penilaian', en: '3 Assessment Aspects' },
  'app.about.feature2.desc': {
    id: 'Kemampuan dinilai pada aspek ofensif, defensif, dan pembacaan permainan umum',
    en: 'Ability is assessed on offensive, defensive, and overall game-reading aspects',
  },
  'app.about.feature3.title': { id: 'Rekapitulasi Skor', en: 'Score Recap' },
  'app.about.feature3.desc': {
    id: 'Hasil berupa skor total dan rincian skor per aspek kemampuan',
    en: 'Results show a total score and detailed scores per ability aspect',
  },
  'app.about.feature4.title': { id: 'Akses Langsung', en: 'Direct Access' },
  'app.about.feature4.desc': {
    id: 'Tidak memerlukan akun atau pendaftaran, langsung mulai asesmen',
    en: 'No account or registration required, start the assessment right away',
  },
  'app.continue': { id: 'LANJUT', en: 'NEXT' },
  'app.back': { id: 'Kembali', en: 'Back' },

  // Profile / form
  'form.title': { id: 'PROFIL PEMAIN', en: 'PLAYER PROFILE' },
  'form.position': { id: 'POSISI', en: 'POSITION' },
  'form.foot': { id: 'KAKI DOMINAN', en: 'DOMINANT FOOT' },
  'form.year': { id: 'TAHUN KELAHIRAN', en: 'YEAR OF BIRTH' },
  'form.pickYear': { id: 'PILIH TAHUN', en: 'SELECT YEAR' },
  'form.rulesTitle': { id: 'PERATURAN ASESMEN', en: 'ASSESSMENT RULES' },
  'form.mustTitle': { id: 'Anda Harus :', en: 'You Must :' },
  'form.rule1': { id: 'Tandai keputusan terbaik untuk permainan', en: 'Mark the best decision for the play' },
  'form.rule2': { id: 'Jawab secepat mungkin (Waktu 7 Detik)', en: 'Answer as fast as possible (7 seconds)' },
  'form.legendTitle': { id: 'Pahami tanda berikut ini :', en: 'Understand the following marks :' },
  'form.legend1': { id: 'Menunjukkan keputusan arah pergerakan / arah target passing', en: 'Indicates movement direction / passing target direction' },
  'form.legend2': { id: 'Menunjukkan keputusan arah dribbling', en: 'Indicates dribbling direction decision' },
  'form.legend3': { id: 'Menunjukkan keputusan first touch', en: 'Indicates first touch decision' },
  'form.markedNote': { id: 'Pemain dengan tanda kuning adalah pemain yang harus diamati.', en: 'The player with the yellow mark is the player to observe.' },
  'form.pos.goalkeeper': { id: 'GOALKEEPER', en: 'GOALKEEPER' },
  'form.pos.center-back': { id: 'CENTER BACK', en: 'CENTER BACK' },
  'form.pos.full-back': { id: 'FULL BACK', en: 'FULL BACK' },
  'form.pos.defensive-midfielder': { id: 'DEFENSIVE MID', en: 'DEFENSIVE MID' },
  'form.pos.central-midfielder': { id: 'CENTRAL MID', en: 'CENTRAL MID' },
  'form.pos.attacking-midfielder': { id: 'ATTACKING MID', en: 'ATTACKING MID' },
  'form.pos.winger': { id: 'WINGER', en: 'WINGER' },
  'form.pos.striker': { id: 'STRIKER', en: 'STRIKER' },
  'form.foot.right': { id: 'KANAN', en: 'RIGHT' },
  'form.foot.left': { id: 'KIRI', en: 'LEFT' },
  'form.foot.both': { id: 'BOTH', en: 'BOTH' },

  // Quiz trial
  'quiz.trial': { id: 'SOAL PERCOBAAN', en: 'TRIAL QUESTION' },
  'quiz.trialBadge': { id: 'TRIAL', en: 'TRIAL' },
  'quiz.trialQuestion': {
    id: 'Apa yang sebaiknya dilakukan pemain yang diberi tanda?',
    en: 'What should the marked player do?',
  },
  'quiz.answerBtn': { id: 'JAWAB PERTANYAAN', en: 'ANSWER THE QUESTION' },

  // Quiz start
  'quiz.ready': { id: 'SIAP?', en: 'READY?' },
  'quiz.readyDesc': {
    id: 'Kamu sudah mencoba soal percobaan. Sekarang mulai asesmen yang sebenarnya. Ingat, setiap video hanya bisa diputar 1 kali dan kamu tidak bisa kembali ke soal sebelumnya.',
    en: 'You have tried the trial question. Now start the real assessment. Remember, each video can only be played 1 time and you cannot go back to a previous question.',
  },
  'quiz.startBtn': { id: 'MULAI ASESMEN', en: 'START ASSESSMENT' },

  // Quiz progress
  'quiz.question': { id: 'SOAL', en: 'QUESTION' },

  // Video player
  'video.finished': { id: 'VIDEO SELESAI', en: 'VIDEO FINISHED' },

  // Result
  'result.title': { id: 'HASIL ASESMEN', en: 'ASSESSMENT RESULT' },
  'result.overall': { id: 'KESELURUHAN', en: 'OVERALL' },
  'result.retry': { id: 'ULANG', en: 'RETRY' },
  'result.finish': { id: 'SELESAI', en: 'FINISH' },
  'result.tier.elite': { id: 'ELITE', en: 'ELITE' },
  'result.tier.advanced': { id: 'ADVANCED', en: 'ADVANCED' },
  'result.tier.intermediate': { id: 'INTERMEDIATE', en: 'INTERMEDIATE' },
  'result.tier.beginner': { id: 'BEGINNER', en: 'BEGINNER' },

  // Categories
  'cat.offensive': { id: 'MENYERANG', en: 'ATTACKING' },
  'cat.defensive': { id: 'BERTAHAN', en: 'DEFENDING' },

  // Hints
  'hint.stay': { id: 'Tetap Pada Posisi', en: 'Stay in Position' },
  'hint.duel': { id: 'Lakukan Duel Udara', en: 'Win the Aerial Duel' },
  'hint.dribbling': { id: 'Dribbling', en: 'Dribbling' },
  'hint.freeball': { id: 'Free Ball Untuk Attacking Midfielder', en: 'Free Ball for Attacking Midfielder' },

  // Floating menu
  'menu.home': { id: 'HOME', en: 'HOME' },
  'menu.newTest': { id: 'TEST BARU', en: 'NEW TEST' },
} as const;

type DictKey = keyof typeof dict;

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  th: (id: string, en: string) => string;
} | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('id');

  const t = useCallback(
    (key: DictKey) => {
      const entry = dict[key];
      return entry ? entry[lang] : key;
    },
    [lang]
  );

  // helper for dynamic strings (hints from data): pass id/en explicitly
  const th = useCallback(
    (id: string, en: string) => (lang === 'en' ? en : id),
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t, th }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// expose hint translation helper (maps known hint strings to dict keys)
export function translateHint(text: string, lang: Lang): string {
  const map: Record<string, string> = {
    'Tetap Pada Posisi': lang === 'en' ? 'Stay in Position' : 'Tetap Pada Posisi',
    'Lakukan Duel Udara': lang === 'en' ? 'Win the Aerial Duel' : 'Lakukan Duel Udara',
    'Dribbling': 'Dribbling',
    'Free Ball Untuk Attacking Midfielder': lang === 'en' ? 'Free Ball for Attacking Midfielder' : 'Free Ball Untuk Attacking Midfielder',
  };
  return map[text] ?? text;
}
