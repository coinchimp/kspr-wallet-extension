import React, { useState } from 'react';

const jsonUrl = '/popup/tokens.json';

type Token = {
  name: string;
  symbol: string;
  balance: number;
  exchangeRate: number;
  change24h: number;
};

const contacts = [
  { name: 'Alice', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk833qkcl' },
  { name: 'Bob', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m396333aa4ed7pva2u9vcsk8583qkcl' },
  { name: 'Charlie', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl' },
];

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const randomImageNumber = Math.floor(Math.random() * 4) + 1;

  // Full fallback image URL from GitHub repository
  const fallbackImageUrl = `/popup/token-logos/ksprwallet${randomImageNumber}.png`;

  // Set fallback image URL directly if not already set
  e.currentTarget.src = fallbackImageUrl;
  e.currentTarget.onerror = null; // Stop further error handling after retry
};

const tokens: Token[] = [
  { name: 'Kaspa', symbol: 'KAS', balance: 1200, exchangeRate: 0.17, change24h: -1.23 },
  { name: 'KSPR', symbol: 'KSPR', balance: 534578923.12, exchangeRate: 0, change24h: 0 },
  { name: 'Nacho', symbol: 'NACHO', balance: 200, exchangeRate: 0, change24h: 0 },
  { name: 'Kasper', symbol: 'KASPER', balance: 1345560000.0, exchangeRate: 0.00000123, change24h: 4.67 },
  { name: 'Chimp', symbol: 'CHIMP', balance: 10000, exchangeRate: 0.00312, change24h: 41.67 },
];

const Send1: React.FC<{
  isLight: boolean;
  passcode: string;
  onBack: () => void;
  onNext: (token: Token, amount: number, recipientAddress: string) => void;
}> = ({ isLight, passcode, onBack, onNext }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [tokensData, setTokensData] = useState<any[]>([]); // Store fetched token images

  const [showContactsDropdown, setShowContactsDropdown] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const fetchTokensImages = async () => {
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      setTokensData(data.tokens); // Store tokens data
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const getTokenImage = (symbol: string) => {
    const token = tokensData.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());

    // Return the image if found, otherwise return undefined
    return token ? token.image : '';
  };

  const filteredTokens = tokens.filter(
    token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const priorityFeeValues = {
    low: 0.1,
    mid: 0.75,
    high: 1.5,
  };

  const estimatedTransactionFee = 0.003;
  const [priorityFee, setPriorityFee] = useState<number>(0);

  const handleTokenSelection = (token: Token) => {
    setSelectedToken(token);
  };
  fetchTokensImages(); // Fetch token images when component mounts

  if (selectedToken) {
    return (
      <div className="flex flex-col items-center justify-start w-full h-full p-1 pt-1 overflow-y-auto">
        <div className="w-full flex items-center mb-1">
          <button
            className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
            onClick={onBack}>
            <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
          </button>
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
            Send {selectedToken.name}
          </h1>
        </div>

        <img
          src={getTokenImage(selectedToken.symbol) || 'invalid-url'} // Force error if no image found
          alt={selectedToken.name}
          className="h-12 w-12 my-4 rounded-full object-cover"
          onError={handleImageError}
        />

        <div className="mb-2 text-lg">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            amount * selectedToken.exchangeRate,
          )}
        </div>
        <div className="w-full mb-2 text-right text-xs text-gray-600">
          Available:{' '}
          {selectedToken.balance - amount - estimatedTransactionFee > 0
            ? (selectedToken.balance - amount - estimatedTransactionFee).toFixed(6)
            : '0'}{' '}
          {selectedToken.symbol}
        </div>
        <div className="w-full mb-2 relative">
          <div className="relative w-full mb-4">
            <input
              type="number"
              placeholder="Amount"
              className={`w-full p-2 pr-16 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              style={{ outline: 'none' }}
            />
            <button
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold p-2 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}
              onClick={() => {
                setAmount(selectedToken.balance);
              }}>
              Max
            </button>
          </div>
        </div>

        <div className="relative w-full mb-4">
          <input
            type="text"
            placeholder="Recipient Wallet Address"
            style={{ outline: 'none' }}
            value={selectedContact ? `${selectedContact} [...${recipientAddress.slice(-10)}]` : recipientAddress}
            className={`w-full p-2 pr-12 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
            onChange={e => {
              setSelectedContact(null);
              setRecipientAddress(e.target.value);
            }}
          />

          {!selectedContact && (
            <button
              className="text-white absolute w-8 h-8 right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold p-2 rounded-full bg-[#70C7BA] flex items-center justify-center"
              onClick={() => setShowContactsDropdown(!showContactsDropdown)}>
              +
            </button>
          )}

          {selectedContact && (
            <button
              className="absolute w-8 h-8 right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold p-2 rounded-full bg-red-700 text-white flex items-center justify-center"
              onClick={() => {
                setSelectedContact(null);
                setRecipientAddress('');
              }}>
              x
            </button>
          )}

          {showContactsDropdown && (
            <div
              className={`absolute z-10 w-full mt-1 shadow-lg rounded-lg max-h-40 overflow-y-auto ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className={`p-2 cursor-pointer hover:${isLight ? 'bg-gray-200' : 'bg-gray-700'} ${isLight ? 'text-gray-900' : 'text-gray-200'}`}
                  onClick={() => {
                    setSelectedContact(contact.name);
                    setRecipientAddress(contact.address);
                    setShowContactsDropdown(false);
                  }}>
                  {contact.name} [...{contact.address.slice(-10)}]
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full mb-2 text-left text-xs text-gray-600">
          Estimated Transaction Fee: {estimatedTransactionFee.toFixed(3)} KAS
        </div>
        <div className="relative w-full mb-1">
          <input
            type="number"
            placeholder="Priority Fee (optional)" // Always shows the placeholder when the input is empty
            value={priorityFee || ''} // If priorityFee is 0 or not a valid number, show an empty string
            step="0.001" // Allows incrementing/decrementing in 0.001 steps
            style={{ outline: 'none' }}
            className={`w-full p-2 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
            onChange={e => setPriorityFee(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="w-full flex justify-around mb-3">
          <button
            className={`w-1/4 p-1 rounded font-bold transition duration-300 ease-in-out ${
              isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'
            } hover:scale-105`}
            onClick={() => setPriorityFee(priorityFeeValues.low)}>
            Low
          </button>
          <button
            className={`w-1/4 p-1 rounded font-bold transition duration-300 ease-in-out ${
              isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'
            } hover:scale-105`}
            onClick={() => setPriorityFee(priorityFeeValues.mid)}>
            Mid
          </button>
          <button
            className={`w-1/4 p-1 rounded font-bold transition duration-300 ease-in-out ${
              isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'
            } hover:scale-105`}
            onClick={() => setPriorityFee(priorityFeeValues.high)}>
            High
          </button>
        </div>
        {/* Ensure the 'Next' button is visible */}
        <div className="w-full mt-2 flex justify-center">
          <button
            className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
              isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
            } hover:scale-105`}
            onClick={() => {
              if (selectedToken && amount > 0 && recipientAddress) {
                onNext(selectedToken, amount, recipientAddress);
              }
            }}>
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <button
        className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
        onClick={onBack}>
        <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
      </button>
      <input
        type="text"
        placeholder="Search Token"
        style={{ outline: 'none' }}
        className={`w-full p-2 mb-4 rounded ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="w-full space-y-4">
        {filteredTokens.map((token, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
            onClick={() => handleTokenSelection(token)}>
            <div className="flex items-center space-x-4">
              <img
                src={getTokenImage(token.symbol) || 'invalid-url'}
                alt={token.name}
                className="h-9 w-9 rounded-full object-cover"
                onError={handleImageError}
              />
              <div>
                <h3 className={`text-base text-left font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                  {token.name}
                </h3>
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
