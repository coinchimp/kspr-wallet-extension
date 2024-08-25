import React, { useState, useRef, useEffect } from 'react';
import SvgComponent from '@src/components/SvgComponent';
import { useBlinkingEffect } from '@src/hooks/useBlinkingEffect';

const Unlock: React.FC<{ onUnlock: () => void; isLight: boolean }> = ({ onUnlock, isLight }) => {
  const [passcode, setPasscode] = useState('');
  const [isIncorrect, setIsIncorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEyesOpen = useBlinkingEffect();

  const handleUnlock = () => {
    if (passcode === '1234') {
      // Example passcode for demonstration
      onUnlock();
    } else {
      setIsIncorrect(true);
      setTimeout(() => setIsIncorrect(false), 500);
      console.log('Incorrect passcode');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      inputRef.current?.blur();
      handleUnlock();
    }
  };

  // Ensure the input field is re-styled when the theme changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.classList.remove('animate-shake', 'border-red-500');
    }
  }, [isLight]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <SvgComponent isLight={isLight} isEyesOpen={isEyesOpen} />

      <h2 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>Enter your passcode</h2>

      <input
        ref={inputRef}
        type="password"
        className={`w-full py-2 px-4 text-lg font-bold rounded-md mb-6 ${
          isLight
            ? isIncorrect
              ? 'bg-gray-100 text-gray-900 border-2 border-red-500'
              : 'bg-gray-100 text-gray-900 border-2 border-gray-900'
            : isIncorrect
              ? 'bg-gray-700 text-white border-2 border-red-500'
              : 'bg-gray-700 text-white border-2 border-gray-500'
        } ${isIncorrect ? 'animate-shake' : ''}`}
        placeholder="Passcode"
        value={passcode}
        onChange={e => setPasscode(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className={`text-sm font-bold mb-4 ${isLight ? 'text-gray-400' : 'text-gray-500'} bg-transparent`}
        onClick={() => console.log('Forgot Passcode Clicked')}>
        Forgot Passcode
      </button>

      <button
        className={
          'font-extrabold text-xl py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={() => {
          inputRef.current?.blur();
          handleUnlock();
        }}>
        UNLOCK
      </button>
    </div>
  );
};

export default Unlock;
