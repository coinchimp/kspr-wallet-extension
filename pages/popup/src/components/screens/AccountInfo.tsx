import React, { useState } from 'react';

type AccountInfoProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
    secretPhrase: string;
    privateKey: string;
  };
  onBack: () => void;
  onRemove: () => void;
};

const AccountInfo: React.FC<AccountInfoProps> = ({ isLight, selectedAccount, onBack, onRemove }) => {
  const [accountName, setAccountName] = useState(selectedAccount.name);
  const [showSecretPhrase, setShowSecretPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Use onBack to navigate back to the previous page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Account Info</h1>
      </div>

      {/* Change Account Name */}
      <div className="w-full mb-6">
        <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Account Name
        </label>
        <input
          type="text"
          value={accountName}
          onChange={e => setAccountName(e.target.value)}
          className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
        />
      </div>

      {/* Display Account Address */}
      <div className="w-full mb-6">
        <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Account Address
        </label>
        <p className={`p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}>
          {selectedAccount.address}
        </p>
      </div>

      {/* Show Secret Phrase */}
      <div className="w-full mb-4">
        <button
          className={`w-full p-4 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setShowSecretPhrase(!showSecretPhrase)}>
          {showSecretPhrase ? 'Hide Secret Phrase' : 'Show Secret Phrase'}
        </button>
        {showSecretPhrase && (
          <p className={`mt-2 p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}>
            {selectedAccount.secretPhrase}
          </p>
        )}
      </div>

      {/* Show Private Key */}
      <div className="w-full mb-4">
        <button
          className={`w-full p-4 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setShowPrivateKey(!showPrivateKey)}>
          {showPrivateKey ? 'Hide Private Key' : 'Show Private Key'}
        </button>
        {showPrivateKey && (
          <p className={`mt-2 p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}>
            {selectedAccount.privateKey}
          </p>
        )}
      </div>

      {/* Remove Account Button */}
      <div className="w-full mt-6">
        <button
          className={`w-full p-4 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-600'} hover:scale-105`}
          onClick={onRemove}>
          Remove Account
        </button>
      </div>
    </div>
  );
};

export default AccountInfo;
