import { useEffect, useRef } from 'react';

export const useIdleTimer = (onIdle: () => void, idleTime: number, isLoggedIn: boolean) => {
  const timeoutId = useRef<number | null>(null);

  // Memoize the handler to avoid re-creating it on every render
  const eventHandler = () => {
    resetTimer();
  };
  
  const resetTimer = () => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
    timeoutId.current = window.setTimeout(onIdle, idleTime);
  };

  const cleanup = () => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(event => window.removeEventListener(event, eventHandler));
  };
  
  useEffect(() => {
    if (isLoggedIn) {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        
        // Set up event listeners
        events.forEach(event => window.addEventListener(event, eventHandler));

        // Initial timer start
        resetTimer();
    } else {
        cleanup();
    }

    // Cleanup on component unmount or when isLoggedIn becomes false
    return cleanup;
  }, [isLoggedIn, onIdle, idleTime]);
};
