'use client';

import { useEffect, useRef } from 'react';

interface MovementFlags {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface UseHeroMovementInputOptions {
  enabled: boolean;
  onFirstInput?: () => void;
}

export function useHeroMovementInput({ enabled, onFirstInput }: UseHeroMovementInputOptions) {
  const movementRef = useRef<MovementFlags>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const touchedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      movementRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };
      return undefined;
    }

    const markInteraction = () => {
      if (touchedRef.current) return;
      touchedRef.current = true;
      onFirstInput?.();
    };

    const setDirectionalInput = (key: string, active: boolean) => {
      switch (key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          movementRef.current.forward = active;
          break;
        case 'arrowdown':
        case 's':
          movementRef.current.backward = active;
          break;
        case 'arrowleft':
        case 'a':
          movementRef.current.left = active;
          break;
        case 'arrowright':
        case 'd':
          movementRef.current.right = active;
          break;
        default:
          break;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key);

      if (!isMovementKey) {
        return;
      }

      event.preventDefault();
      if (event.repeat) return;
      markInteraction();
      setDirectionalInput(event.key, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
      setDirectionalInput(event.key, false);
    };

    const touchStartRef = { x: 0, y: 0 };
    const joystickRef = { x: 0, y: 0 };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      markInteraction();
      touchStartRef.x = touch.clientX;
      touchStartRef.y = touch.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      event.preventDefault();

      const deltaX = touch.clientX - touchStartRef.x;
      const deltaY = touch.clientY - touchStartRef.y;
      const maxRadius = 50;
      const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxRadius);
      const angle = Math.atan2(deltaY, deltaX);

      joystickRef.x = (distance / maxRadius) * Math.cos(angle);
      joystickRef.y = (distance / maxRadius) * Math.sin(angle);

      movementRef.current.left = joystickRef.x < -0.3;
      movementRef.current.right = joystickRef.x > 0.3;
      movementRef.current.forward = joystickRef.y < -0.3;
      movementRef.current.backward = joystickRef.y > 0.3;
    };

    const handleTouchEnd = () => {
      movementRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, onFirstInput]);

  return movementRef;
}
