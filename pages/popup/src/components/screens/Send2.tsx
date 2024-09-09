import React from 'react';

// Define the Props type for the Send2 component
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
const estimatedFee = 0.003;
const priorityFee = 0.001;

const Send2: React.FC<Send2Props> = ({ isLight, passcode, onBack, selectedToken, amount, recipientAddress }) => {
  const currentDate = new Date().toLocaleString(); // Get the current date and time

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-2 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Use onBack to navigate back to the Send1 page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Send Details</h1>
      </div>

      <img
        src={`/popup/${selectedToken.symbol.toLowerCase()}.png`}
        alt={selectedToken.name}
        className="h-16 w-16 my-4"
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
