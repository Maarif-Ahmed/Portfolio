'use client';

import { useEffect } from 'react';

export function useKeySequence(sequence: string, onMatch: () => void) {
  useEffect(() => {
    const expected = sequence.toLowerCase();
    let buffer = '';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key.length !== 1) return;

      buffer = `${buffer}${key}`.slice(-expected.length);

      if (buffer === expected) {
        onMatch();
        buffer = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMatch, sequence]);
}
