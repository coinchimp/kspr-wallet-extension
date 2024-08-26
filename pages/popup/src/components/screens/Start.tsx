import React from 'react';
import SvgComponent from '@src/components/SvgComponent';
import { useBlinkingEffect } from '@src/hooks/useBlinkingEffect';

const Start: React.FC<{ isLight: boolean; onCreateWallet: () => void; onImportWallet: () => void }> = ({
  isLight,
  onCreateWallet,
  onImportWallet,
}) => {
  const isEyesOpen = useBlinkingEffect();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <SvgComponent isLight={isLight} isEyesOpen={isEyesOpen} />

      <button
        className={
          'font-extrabold text-xl mb-4 py-2 px-6 rounded shadow hover:scale-105 text-white w-[85%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={onCreateWallet}>
        Create New Wallet
      </button>

      <button
        className={
          'font-extrabold text-xl py-2 px-6 rounded shadow hover:scale-105 text-white w-[85%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={onImportWallet}>
        Import Wallet
      </button>
    </div>
  );
};

export default Start;
