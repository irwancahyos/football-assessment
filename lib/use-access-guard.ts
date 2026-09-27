'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken, verifyToken, type AccessState } from '@/lib/access';

// Verifies the stored token against the Worker API. Redirects to
// /quiz/start when there is no usable token. Validity is ALWAYS
// decided by the Worker, never by local state.
export function useAccessGuard(): AccessState {
  const router = useRouter();
  const [state, setState] = useState<AccessState>('checking');

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState('missing');
      router.replace('/quiz/start');
      return;
    }
    verifyToken(token).then((ok) => {
      if (ok) {
        setState('valid');
      } else {
        setState('invalid');
        router.replace('/quiz/start');
      }
    });
  }, [router]);

  return state;
}
