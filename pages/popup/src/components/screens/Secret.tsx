import React, { useState, useEffect } from 'react';
import { generateMnemonic } from '../../../../../chrome-extension/utils/Kaspa';
import { toast } from 'react-toastify';

const Secret: React.FC<{ isLight: boolean; onNextStep: (words: string[]) => void }> = ({ isLight, onNextStep }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [secretWords, setSecretWords] = useState<string[]>([]);

  useEffect(() => {
    const generateAndSetMnemonic = async () => {
      const mnemonic = await generateMnemonic(); // Await the mnemonic phrase
      const words = mnemonic.split(' '); // Split the mnemonic phrase into individual words
      setSecretWords(words); // Set the secretWords state with the generated words
    };

    generateAndSetMnemonic(); // Call the async function
  }, []);

  const handleNextStep = () => {
    if (isVerified) {
      onNextStep(secretWords);
    } else {
      toast.error('You need to confirm you have securely stored your secret phrase.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-6 mt-4`}>
        24-words Secret Phrase
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {secretWords.map((word, index) => (
          <div key={index} className="text-sm font-medium text-left">
            {index + 1}. {word}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mb-4 w-[85%]">
        <input
          type="checkbox"
          id="verify"
          checked={isVerified}
          onChange={e => setIsVerified(e.target.checked)}
          className="mr-2 h-4 w-4 rounded border-gray-300 text-[#70C7BA] focus:ring-[#70C7BA]"
          style={{ accentColor: '#70C7BA' }} // Ensures correct fill color when checked
        />
        <label
          htmlFor="verify"
          className={`text-sm font-bold ${isLight ? 'text-gray-400' : 'text-gray-500'} bg-transparent`}>
          Please, store securely your words in a safe place before proceeding.
        </label>
      </div>

      <button
        className={
          'font-extrabold text-xl py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={handleNextStep}>
        Next Step
      </button>
    </div>
  );
};

export default Secret;
