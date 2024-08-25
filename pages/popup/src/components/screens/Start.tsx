import React, { useRef, useEffect } from 'react';
import SvgComponent from '@src/components/SvgComponent';
import { useBlinkingEffect } from '@src/hooks/useBlinkingEffect';

const Start: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEyesOpen = useBlinkingEffect();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.classList.remove('animate-shake', 'border-red-500');
    }
  }, [isLight]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <SvgComponent isLight={isLight} isEyesOpen={isEyesOpen} />

      <button
        className={
          'font-extrabold text-xl mb-4 py-2 px-6 rounded shadow hover:scale-105 text-white w-[85%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={() => {
          inputRef.current?.blur();
          //importwallet();
        }}>
        Import Wallet
      </button>

      <button
        className={
          'font-extrabold text-xl py-2 px-6 rounded shadow hover:scale-105 text-white w-[85%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={() => {
          inputRef.current?.blur();
          //createnewwallet();
        }}>
        Create New Wallet
      </button>
    </div>
  );
};

export default Start;
