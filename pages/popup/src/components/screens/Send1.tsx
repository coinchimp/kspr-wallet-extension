import React, { useState } from 'react';

// Define the Token type
type Token = {
  name: string;
  symbol: string;
  balance: number;
  exchangeRate: number;
  change24h: number;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const maxIndex = 2; // Maximum index you want to support

  const getRandomIndex = () => {
    return Math.floor(Math.random() * maxIndex) + 1; // Generate a random index between 1 and maxIndex
  };

  const tryNextImage = () => {
    const randomIndex = getRandomIndex();
    e.currentTarget.src = `/popup/ksprwallet${randomIndex}.png`;
    e.currentTarget.onerror = null; // Prevent infinite loop if all images fail
  };

  e.currentTarget.onerror = tryNextImage; // Set the onError to try the next image
  tryNextImage(); // Start the process
};

const tokens: Token[] = [
  { name: 'Kaspa', symbol: 'KAS', balance: 1200, exchangeRate: 0.17, change24h: -1.23 },
  { name: 'KSPR', symbol: 'KSPR', balance: 534578923.12, exchangeRate: 0, change24h: 0 },
  { name: 'Nacho', symbol: 'NACHO', balance: 200, exchangeRate: 0, change24h: 0 },
  { name: 'Kasper', symbol: 'KASPER', balance: 1345560000.0, exchangeRate: 0.00000123, change24h: 4.67 },
  { name: 'Chimp', symbol: 'CHIMP', balance: 10000, exchangeRate: 0.00312, change24h: 41.67 },
];

const Send1: React.FC<{ isLight: boolean; passcode: string; onBack: () => void }> = ({ isLight, passcode, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const filteredTokens = tokens.filter(
    token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTokenSelection = (token: Token) => {
    setSelectedToken(token);
  };

  if (selectedToken) {
    return (
      <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
        <div className="w-full flex items-center mb-4">
          <button
            className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
            onClick={onBack} // Use onBack to navigate back to the main screen
          >
            ←
          </button>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
            Send {selectedToken.name}
          </h1>
        </div>

        <img
          src={`/popup/${selectedToken.symbol.toLowerCase()}.png`}
          alt={selectedToken.name}
          className="h-20 w-20 my-4"
          onError={handleImageError}
        />
        {/* start - send form */}
        <div className="mb-2 text-lg">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            selectedToken.balance * selectedToken.exchangeRate,
          )}
        </div>

        <div className="w-full mb-4 relative">
          <input
            type="number"
            placeholder="Amount"
            className={`w-full p-2 pr-16 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
          />
          <button
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold p-1 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}
            onClick={() => {
              const amountInput = document.querySelector('input[type="number"]') as HTMLInputElement | null;
              if (amountInput) {
                amountInput.value = selectedToken.balance.toFixed(2);
              }
            }}>
            Max
          </button>
        </div>

        <input
          type="text"
          placeholder="Recipient Wallet Address"
          className={`w-full p-2 mb-4 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
        />

        <button
          className={`mt-4 w-full py-2 rounded-full ${isLight ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-gray-200'} hover:scale-105 transition duration-300`}
          onClick={() => {
            // Handle the next button click (example functionality)
            console.log('Next button clicked');
          }}>
          Next
        </button>

        {/* end - send form */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <button
        className={`text-2xl p-4 w-12 h-12 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
        onClick={onBack} // Use onBack to navigate back to the main screen
      >
        ←
      </button>
      <input
        type="text"
        placeholder="Search Token"
        className={`w-full p-2 mb-4 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="w-full space-y-4">
        {filteredTokens.map((token, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
            onClick={() => handleTokenSelection(token)}>
            <div className="flex items-center space-x-4">
              <img
                src={`/popup/${token.symbol.toLowerCase()}.png`}
                alt={token.name}
                className="h-9 w-9"
                onError={handleImageError}
              />
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{token.name}</h3>
                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {token.balance.toFixed(2)} {token.symbol}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Send1;
