import React, { useState } from 'react';

const jsonUrl =
  'https://raw.githubusercontent.com/coinchimp/kspr-wallet-extension/main/chrome-extension/public/tokens.json';

type CompoundProps = {
  isLight: boolean;
  passcode: string;
  onBack: () => void;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const randomImageNumber = Math.floor(Math.random() * 4) + 1;

  // Full fallback image URL from GitHub repository
  const fallbackImageUrl = `https://raw.githubusercontent.com/coinchimp/kspr-wallet-extension/main/chrome-extension/public/token-logos/ksprwallet${randomImageNumber}.png`;

  // Set fallback image URL directly if not already set
  e.currentTarget.src = fallbackImageUrl;
  e.currentTarget.onerror = null; // Stop further error handling after retry
};

const estimatedFee = 0.003;
const priorityFee = 0.001;
const recipientAddress = 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk833qkcl';
const amount = 23.9;
const exchangeRate = 0.16;

const Compound: React.FC<CompoundProps> = ({ isLight, passcode, onBack }) => {
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
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-1 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Use onBack to navigate back to the Send1 page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Compound Details</h1>
      </div>

      <img
        src={getTokenImage('kas') || 'invalid-url'}
        alt={'Kaspa'}
        className="h-16 w-16 my-4"
        onError={handleImageError}
      />

      <div className="text-center mb-1">
        <div className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Balance<br></br>
          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}{' '}
          {'KAS'}
        </div>
        <div className={`text-lg ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          {exchangeRate
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount * exchangeRate)
            : '$-'}
        </div>

        {/* Add Estimated Fee and Priority Fee */}
        <div className={`text-sm mt-2 ${isLight ? 'text-gray-900' : 'text-gray-200'} text-center`}>
          <p>Estimated Fee: {estimatedFee.toFixed(3)} KAS</p>
        </div>

        {/* <div
          className={`text-sm mt-2 ${isLight ? 'text-gray-900' : 'text-gray-200'} text-center mx-auto`}
          style={{ maxWidth: '80%' }}>
          <span className="font-bold">Sent to:</span>
          <p className="break-all">{recipientAddress}</p>
        </div> */}

        <div className={`text-base font-bold mb-2 mt-2 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          {currentDate}
        </div>
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

export default Compound;
