import { useEffect, useRef } from 'react';

type KeyHandlers = {
  [key: string]: () => void;
};

export function useKeyPress(keyHandlers: KeyHandlers) {
  const handlersRef = useRef<KeyHandlers>(keyHandlers);

  useEffect(() => {
    handlersRef.current = keyHandlers;
  }, [keyHandlers]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const handler = handlersRef.current[event.key];
      if (handler) {
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
}