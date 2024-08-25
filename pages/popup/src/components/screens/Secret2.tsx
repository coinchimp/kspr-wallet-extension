import React, { useRef, useState, useEffect } from 'react';

const Secret2: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [inputWords, setInputWords] = useState<string[]>(Array(4).fill(''));
  const [randomIndices, setRandomIndices] = useState<number[]>([]);

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.classList.remove('animate-shake', 'border-red-500');
    }

    // Generate 4 unique random indices with an explicit type
    const indices: number[] = [];
    while (indices.length < 4) {
      const rand = Math.floor(Math.random() * 24);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }
    setRandomIndices(indices);
  }, [isLight]);

  const handleFinish = () => {
    const correctWords = randomIndices.every((index, i) => inputWords[i].toLowerCase() === secretWords[index]);

    if (!correctWords) {
      alert("The entered words don't match the recently created secret phrase.");
    } else {
      // Proceed to the next step or finish
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-6 mt-4`}>
        24-words Secret Phrase
      </h2>

      <div className="grid grid-cols-1 gap-4 mb-8 w-[60%]">
        {randomIndices.map((index, i) => (
          <div key={i} className="flex items-center">
            <span className="text-sm font-medium w-12">{index + 1}.</span>
            <input
              type="text"
              value={inputWords[i]}
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

      <div className="flex items-center justify-center mb-4 w-[85%]">
        <label
          htmlFor="verify"
          className={`text-sm font-bold ${isLight ? 'text-gray-400' : 'text-gray-500'} bg-transparent`}>
          Please, enter the words that match the numbers from the secret phrase you have just created.
        </label>
      </div>

      <button
        className={
          'font-extrabold text-lg py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ' +
          (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
        }
        onClick={handleFinish}>
        Finish
      </button>
    </div>
  );
};

export default Secret2;
