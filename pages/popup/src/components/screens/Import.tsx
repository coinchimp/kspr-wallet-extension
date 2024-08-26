import React, { useRef, useState, useEffect } from 'react';

const Secret2: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWords, setInputWords] = useState<string[]>(Array(24).fill(''));

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.classList.remove('animate-shake', 'border-red-500');
    }
  }, [isLight]);

  const handleImport = () => {
    const allFilled = inputWords.every(word => word.trim() !== '');

    if (!allFilled) {
      alert('Please make sure all input fields are filled in before proceeding.');
    } else {
      // Proceed to the next step or finish the import
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-2 mt-4`}>
        Import 24-words Secret Phrase
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-4 w-[90%]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <span className="text-xs font-medium w-12">{i + 1}.</span>
            <input
              type="text"
              value={inputWords[i]}
              onChange={e => {
                const newWords = [...inputWords];
                newWords[i] = e.target.value;
                setInputWords(newWords);
              }}
              className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-gray-500'} w-full py-0 px-2 rounded border border-gray-300`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mb-4 w-[85%]">
        <label
          htmlFor="verify"
          className={`text-sm font-bold ${isLight ? 'text-gray-400' : 'text-gray-500'} bg-transparent`}>
          Please, enter the complete secret phrase from your wallet.
        </label>
      </div>

      <button
        className={
          'font-extrabold text-lg py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={handleImport}>
        Import
      </button>
    </div>
  );
};

export default Secret2;
