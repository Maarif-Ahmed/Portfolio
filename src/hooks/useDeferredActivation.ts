'use client';

import { useEffect, useState } from 'react';

interface DeferredActivationOptions {
  delayMs?: number;
  timeoutMs?: number;
}

type IdleWindow = Window &
  typeof globalThis & {
    cancelIdleCallback?: (handle: number) => void;
    requestIdleCallback?: (
      callback: (deadline: IdleDeadline) => void,
      options?: { timeout: number }
    ) => number;
  };

export default function useDeferredActivation({
  delayMs = 0,
  timeoutMs = 1200,
}: DeferredActivationOptions = {}) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let timeoutHandle: number | null = null;
    let idleHandle: number | null = null;

    const activate = () => {
      if (delayMs > 0) {
        timeoutHandle = window.setTimeout(() => setIsActive(true), delayMs);
        return;
      }

      setIsActive(true);
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleHandle = idleWindow.requestIdleCallback(() => activate(), { timeout: timeoutMs });
    } else {
      activate();
    }

    return () => {
      if (idleHandle !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleHandle);
      }

      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [delayMs, timeoutMs]);

  return isActive;
}
