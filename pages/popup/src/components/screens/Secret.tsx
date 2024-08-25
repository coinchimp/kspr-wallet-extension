import React, { useRef, useState, useEffect } from 'react';

const Secret: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.classList.remove('animate-shake', 'border-red-500');
    }
  }, [isLight]);

  const secretWords = [
    'apple',
    'banana',
    'cherry',
    'date',
    'elder',
    'fig',
    'grape',
    'honey',
    'kiwi',
    'lemon',
    'mango',
    'nectar',
    'orange',
    'papaya',
    'quince',
    'berry',
    'straw',
    'rhino',
    'ugli',
    'vanilla',
    'melon',
    'xigua',
    'yam',
    'chair',
  ];

  const handleNextStep = () => {
    if (!isVerified) {
      alert('You need to confirm you have securely stored your secret phrase.');
    } else {
      // proceed to the next step
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        New Wallet: 24-words Secret Phrase
      </h2>

      <div className="grid grid-cols-3 gap-2 justify-left mb-2">
        {secretWords.map((word, index) => (
          <div key={index} className="text-base font-medium">
            {index + 1}. {word}
          </div>
        ))}
      </div>

      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="verify"
          checked={isVerified}
          onChange={e => setIsVerified(e.target.checked)}
          className="mr-2"
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
