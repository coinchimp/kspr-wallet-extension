import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Unlock from '@src/components/screens/Unlock';
import { encryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const Import: React.FC<{ isLight: boolean; onImport: (passcode: string) => void }> = ({ isLight, onImport }) => {
  const [is24Words, setIs24Words] = useState(true);
  const [inputWords, setInputWords] = useState<string[]>(Array(24).fill(''));
  const [showPasscodeScreen, setShowPasscodeScreen] = useState(false);

  const handleToggleWords = () => {
    setIs24Words(!is24Words);
    setInputWords(Array(is24Words ? 12 : 24).fill(''));
  };

  const handleWordChange = (index: number, value: string) => {
    let newWords = [...inputWords];

    // Clean up the input: remove numbers, dots, and extra spaces
    const cleanedValue = value
      .replace(/\d+\.\s*/g, '') // Remove all numbers followed by a dot and space
      .trim();

    // If user pastes multiple words at once, spread them across the inputs
    const wordsArray = cleanedValue.split(/\s+/).filter(word => word.trim() !== '');
    if (wordsArray.length > 1) {
      wordsArray.forEach((word, i) => {
        if (index + i < newWords.length) {
          newWords[index + i] = word;
        }
      });
    } else {
      newWords[index] = cleanedValue;
    }

    setInputWords(newWords);
  };

  const handleImport = () => {
    const requiredLength = is24Words ? 24 : 12;
    const allFilled = inputWords.slice(0, requiredLength).every(word => word.trim() !== '');

    if (!allFilled) {
      toast.error('Please make sure all input fields are filled in before proceeding.');
      return;
    }

    setShowPasscodeScreen(true);
  };

  const handleSetPasscode = async (passcode: string) => {
    try {
      const seedPhrase = inputWords.slice(0, is24Words ? 24 : 12).join(' ');
      const accounts = [
        {
          name: 'Account #1',
          address: 'kaspatest:qzkstpzavl0xp479m573uhu3ujqj6u775vrtqrq0a7qzu0z2m89lq7hwkzgj4',
        },
        {
          name: 'Account #2',
          address: 'kaspatest:qz7d28dacezxdz066pzpkrrf2p45h2rr28evyedwmzlzer6kgvpvc36tjzvcj',
        },
      ];

      if (accounts && accounts.length > 0) {
        const encryptedSeed = await encryptData(passcode, seedPhrase);
        await encryptedSeedStorage.set(() => encryptedSeed);
        toast.success('Wallet imported successfully.');
        onImport(passcode); // Pass the passcode to the parent component after a successful import
      } else {
        toast.error('Failed to generate accounts from the seed phrase.');
      }
    } catch (error) {
      console.error('Error importing seed phrase:', error);
      toast.error('Failed to import the wallet. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {!showPasscodeScreen ? (
        <>
          <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-2 mt-4`}>
            Import {is24Words ? '24-words' : '12-words'} Secret Phrase
          </h2>

          <button className="mb-4 text-sm underline" onClick={handleToggleWords}>
            Switch to {is24Words ? '12-words' : '24-words'}
          </button>

          <div className="grid grid-cols-3 gap-4 mb-4 w-[90%]">
            {Array.from({ length: is24Words ? 24 : 12 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="text-xs font-medium w-12">{i + 1}.</span>
                <input
                  type="text"
                  value={inputWords[i]}
                  onChange={e => handleWordChange(i, e.target.value)}
                  className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-gray-500'} w-full py-0 px-2 rounded border border-gray-300`}
                />
              </div>
            ))}
          </div>

          <button
            className={
              'font-extrabold text-lg py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ' +
              (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
            }
            onClick={handleImport}>
            Import
          </button>
        </>
      ) : (
        <Unlock
          isLight={isLight}
          onUnlock={handleSetPasscode} // Handle passcode setting
          isSettingPasscode={true} // Indicate that this is for setting a passcode
        />
      )}
    </div>
  );
};

export default Import;
