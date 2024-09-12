import React, { useState } from 'react';

const jsonUrl = '/popup/tokens.json';

type Send2Props = {
  isLight: boolean;
  passcode: string;
  onBack: () => void;
  selectedToken: {
    name: string;
    symbol: string;
    balance: number;
    exchangeRate: number;
  };
  amount: number;
  recipientAddress: string;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const randomImageNumber = Math.floor(Math.random() * 4) + 1;

  // Full fallback image URL from GitHub repository
  const fallbackImageUrl = `/popup/token-logos/ksprwallet${randomImageNumber}.png`;

  // Set fallback image URL directly if not already set
  e.currentTarget.src = fallbackImageUrl;
  e.currentTarget.onerror = null; // Stop further error handling after retry
};

const estimatedFee = 0.003;
const priorityFee = 0.001;

const Send2: React.FC<Send2Props> = ({ isLight, passcode, onBack, selectedToken, amount, recipientAddress }) => {
  const currentDate = new Date().toLocaleString(); // Get the current date and time
  const [tokensData, setTokensData] = useState<any[]>([]); // Store fetched token images

  const getTokenImage = (symbol: string) => {
    const token = tokensData.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());

    // Ensure the fallback is also the full GitHub URL
    return token ? token.image : '';
  };

  const fetchTokensImages = async () => {
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      setTokensData(data.tokens); // Store tokens data
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  fetchTokensImages(); // Fetch token images when component mounts

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-2 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Send Details</h1>
      </div>

      <img
        src={getTokenImage(selectedToken.symbol) || 'invalid-url'}
        alt={selectedToken.name}
        className="h-16 w-16 my-4 rounded-full object-cover"
        onError={handleImageError}
      />

      <div className="text-center mb-2">
        <div className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}{' '}
          {selectedToken.symbol}
        </div>
        <div className={`text-lg ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          {selectedToken.exchangeRate
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                amount * selectedToken.exchangeRate,
              )
            : '$-'}
        </div>

        {/* Add Estimated Fee and Priority Fee */}
        <div className={`text-sm mt-2 ${isLight ? 'text-gray-900' : 'text-gray-200'} text-center`}>
          <p>Estimated Fee: {estimatedFee.toFixed(3)} KAS</p>
          <p>Priority Fee: {priorityFee.toFixed(3)} KAS</p>
        </div>

        <div
          className={`text-sm mt-2 ${isLight ? 'text-gray-900' : 'text-gray-200'} text-center mx-auto`}
          style={{ maxWidth: '80%' }}>
          <span className="font-bold">Sent to:</span>
          <p className="break-all">{recipientAddress}</p>
        </div>

        <div className={`text-base font-bold mt-2 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{currentDate}</div>
      </div>

      <button
        className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
          isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
        } hover:scale-105`}
        onClick={() => {
          // Handle the confirm button click (example functionality)
          console.log('Confirm button clicked');
        }}>
        Confirm
      </button>
    </div>
  );
};

export default Send2;
