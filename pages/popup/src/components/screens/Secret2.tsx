import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Unlock from '@src/components/screens/Unlock';
import { encryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const Secret2: React.FC<{ isLight: boolean; onFinish: (passcode: string) => void; secretWords: string[] }> = ({
  isLight,
  onFinish,
  secretWords,
}) => {
  const [inputWords, setInputWords] = useState<string[]>(Array(4).fill(''));
  const [randomIndices, setRandomIndices] = useState<number[]>([]);
  const [showPasscodeScreen, setShowPasscodeScreen] = useState(false);

  useEffect(() => {
    const indices: number[] = [];
    while (indices.length < 4) {
      const rand = Math.floor(Math.random() * 24);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }
    setRandomIndices(indices);
  }, []);

  const handleFinish = () => {
    const correctWords = randomIndices.every((index, i) => inputWords[i].toLowerCase() === secretWords[index]);

    if (correctWords) {
      setShowPasscodeScreen(true); // Show the passcode setting screen
    } else {
      toast.error('The entered words do not match the recently created secret phrase.');
    }
  };

  const handleSetPasscode = async (passcode: string) => {
    try {
      const seedPhrase = secretWords.join(' ');
      const encryptedSeed = await encryptData(passcode, seedPhrase);
      await encryptedSeedStorage.set(() => encryptedSeed); // Store the encrypted seed in the storage
      setShowPasscodeScreen(false);
      onFinish(passcode); // Pass the passcode to the parent
    } catch (error) {
      console.error('Error encrypting seed phrase:', error);
      toast.error('Failed to securely store the seed phrase.');
    } finally {
      // Ensure the seed phrase is cleared from memory
      setInputWords(Array(4).fill(''));
      secretWords.fill('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {!showPasscodeScreen ? (
        <>
          <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-6 mt-4`}>
            Validate 24-words Secret Phrase
          </h2>

          <div className="grid grid-cols-1 gap-4 mb-8 w-[60%]">
            {randomIndices.map((index, i) => (
              <div key={i} className="flex items-center">
                <span className="text-sm font-medium w-12">{index + 1}.</span>
                <input
                  type="text"
                  value={inputWords[i]}
                  style={{ outline: 'none' }}
                  onChange={e => {
                    const newWords = [...inputWords];
                    newWords[i] = e.target.value;
                    setInputWords(newWords);
                  }}
                  className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-gray-500'} w-full py-2 px-4 rounded border border-gray-300`}
                />
              </div>
            ))}
          </div>

          <button
            className={`font-extrabold text-lg py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ${
              isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
            }`}
            onClick={handleFinish}>
            Finish
          </button>
        </>
      ) : (
        <Unlock
          isLight={isLight}
          onUnlock={handleSetPasscode} // Handle passcode creation
          isSettingPasscode={true} // Indicate that this is for setting a passcode
        />
      )}
    </div>
  );
};

export default Secret2;
