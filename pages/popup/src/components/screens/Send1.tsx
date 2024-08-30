import React, { useState } from 'react';

// Define the Token type
type Token = {
  name: string;
  symbol: string;
  balance: number;
};

const tokens: Token[] = [
  { name: 'Kaspa', symbol: 'KAS', balance: 1200 },
  { name: 'KSPR', symbol: 'KSPR', balance: 534578923.12 },
  { name: 'Nacho', symbol: 'NACHO', balance: 200 },
  { name: 'Kasper', symbol: 'KASPER', balance: 1345560000.0 },
  { name: 'Chimp', symbol: 'CHIMP', balance: 10000 },
];

const Send1: React.FC<{ isLight: boolean; passcode: string }> = ({ isLight, passcode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null); // Update type to Token or null

  const filteredTokens = tokens.filter(
    token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTokenSelection = (token: Token) => {
    // Define the token type
    setSelectedToken(token);
  };

  if (selectedToken) {
    return (
      <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6">
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Send {selectedToken.name}
        </h1>
        <img
          src={`/popup/${selectedToken.symbol.toLowerCase()}.png`}
          alt={selectedToken.name}
          className="h-16 w-16 my-4"
        />
        {/* ... rest of the code ... */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6">
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
              <img src={`/popup/${token.symbol.toLowerCase()}.png`} alt={token.name} className="h-9 w-9" />
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
