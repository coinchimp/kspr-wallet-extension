import React, { useState, useRef, useEffect } from 'react';
import SvgComponent from '@src/components/SvgComponent';
import { useBlinkingEffect } from '@src/hooks/useBlinkingEffect';
import { toast } from 'react-toastify';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage, passcodeStorage } from '@extension/storage';

interface UnlockProps {
  onUnlock: (passcode: string) => void;
  isLight: boolean;
  isSettingPasscode?: boolean; // Flag to differentiate between setting and entering passcode
  onForgotPassword?: () => void; // Callback for handling "Forgot Password"
}

const Unlock: React.FC<UnlockProps> = ({ onUnlock, isLight, isSettingPasscode = false, onForgotPassword }) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState(''); // For passcode confirmation during setting
  const [isIncorrect, setIsIncorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEyesOpen = useBlinkingEffect();

  // Handle automatic unlocking if a valid passcode is stored
  useEffect(() => {
    const checkStoredPasscode = async () => {
      try {
        const storedPasscode = await passcodeStorage.getPasscode();
        if (storedPasscode) {
          const encryptedSeed = await encryptedSeedStorage.getSeed();
          await decryptData(storedPasscode, encryptedSeed);
          onUnlock(storedPasscode);
        }
      } catch (error) {
        console.error('Error during auto-unlock:', error);
      }
    };

    if (!isSettingPasscode) {
      checkStoredPasscode();
    }
  }, [isSettingPasscode, onUnlock]);

  const handleUnlockWithPasscode = async () => {
    if (isSettingPasscode) {
      if (passcode === confirmPasscode) {
        await passcodeStorage.savePasscode(passcode); // Save the passcode for 5 minutes
        onUnlock(passcode);
      } else {
        setIsIncorrect(true);
        toast.error('Passcodes do not match.');
        setTimeout(() => setIsIncorrect(false), 500);
      }
    } else {
      try {
        const encryptedSeed = await encryptedSeedStorage.getSeed();
        await decryptData(passcode, encryptedSeed);
        await passcodeStorage.savePasscode(passcode); // Save the passcode for 5 minutes
        onUnlock(passcode);
      } catch (error) {
        setIsIncorrect(true);
        setTimeout(() => setIsIncorrect(false), 500);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      inputRef.current?.blur();
      handleUnlockWithPasscode();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.classList.remove('animate-shake', 'border-red-500');
    }
  }, [isLight]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <SvgComponent isLight={isLight} isEyesOpen={isEyesOpen} />

      <h2 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        {isSettingPasscode ? 'Set your passcode' : 'Enter your passcode'}
      </h2>

      <input
        ref={inputRef}
        type="password"
        style={{ outline: 'none' }}
        className={`w-full py-2 px-4 text-lg font-bold rounded-md mb-4 ${
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

      {isSettingPasscode && (
        <input
          type="password"
          style={{ outline: 'none' }}
          className={`w-full py-2 px-4 text-lg font-bold rounded-md mb-6 ${
            isLight
              ? isIncorrect
                ? 'bg-gray-100 text-gray-900 border-2 border-red-500'
                : 'bg-gray-100 text-gray-900 border-2 border-gray-900'
              : isIncorrect
                ? 'bg-gray-700 text-white border-2 border-red-500'
                : 'bg-gray-700 text-white border-2 border-gray-500'
          } ${isIncorrect ? 'animate-shake' : ''}`}
          placeholder="Confirm Passcode"
          value={confirmPasscode}
          onChange={e => setConfirmPasscode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}

      {!isSettingPasscode && onForgotPassword && (
        <button
          className={`text-sm font-bold mb-4 ${isLight ? 'text-gray-400' : 'text-gray-500'} bg-transparent`}
          onClick={onForgotPassword}>
          Forgot Password
        </button>
      )}

      <button
        className={`font-bold text-base py-2 px-6 rounded shadow hover:scale-105 text-white w-[90%] ${
          isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
        }`}
        onClick={() => {
          inputRef.current?.blur();
          handleUnlockWithPasscode();
        }}>
        {isSettingPasscode ? 'Set Passcode' : 'Unlock'}
      </button>
    </div>
  );
};

export default Unlock;
