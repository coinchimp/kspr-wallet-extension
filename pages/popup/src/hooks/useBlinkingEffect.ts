// src/hooks/useBlinkingEffect.ts
import { useState, useEffect } from 'react';

export const useBlinkingEffect = () => {
  const [isEyesOpen, setIsEyesOpen] = useState(true);

  useEffect(() => {
    const blinkTwice = () => {
      setIsEyesOpen(false);
      setTimeout(() => {
        setIsEyesOpen(true);
      }, 100); // First blink

      setTimeout(() => {
        setIsEyesOpen(false);
      }, 300); // Second blink

      setTimeout(() => {
        setIsEyesOpen(true);
      }, 400); // Open eyes after second blink
    };

    const getRandomInterval = () => Math.random() * 5000 + 1000; // Random interval

    const startBlinking = () => {
      blinkTwice();
      const timeoutId = setTimeout(startBlinking, getRandomInterval());
      return timeoutId;
    };

    const timeoutId = startBlinking();

    return () => clearTimeout(timeoutId); // Cleanup on component unmount
  }, []);

  return isEyesOpen;
};
