import React, { useState } from 'react';

type SecretExportProps = {
  isLight: boolean;
  secretPhrase: string;
  onBack: () => void;
};

const SecretExport: React.FC<SecretExportProps> = ({ isLight, secretPhrase, onBack }) => {
  const [passcode, setPasscode] = useState('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const canShowSecret = passcode && isCheckboxChecked;

  const handleCopy = () => {
    navigator.clipboard.writeText(secretPhrase);
    console.log('Secret phrase copied to clipboard');
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack}>
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Secret Phrase</h1>
      </div>

      {/* Warning Messages */}
      <div className="w-full mb-6">
        <p className={`text-sm font-bold mb-2 ${isLight ? 'text-red-600' : 'text-red-400'}`}>
          Your secret phrase is the only way to recover your wallet.
        </p>
        <p className={`text-sm font-bold mb-6 ${isLight ? 'text-red-600' : 'text-red-400'}`}>
          Do not let anyone see your secret phrase.
        </p>
      </div>

      {/* Enter Passcode */}
      <div className="w-full mb-6">
        <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Enter your passcode
        </label>
        <input
          type="password"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
          className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
        />
      </div>

      {/* Checkbox */}
      <div className="w-full flex items-start mb-4">
        <input
          type="checkbox"
          checked={isCheckboxChecked}
          onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
          className="mr-2"
        />
        <label className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          I understand the risks of losing my funds if I share my secret phrase, even with the support team of KSPR
          Wallet.
        </label>
      </div>

      {/* Show me the Secret Phrase Button */}
      <div className="w-full mt-4">
        <button
          className={`w-full p-4 rounded-lg font-bold transition duration-300 ease-in-out ${canShowSecret ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white hover:scale-105`}
          onClick={() => setShowSecret(true)}
          disabled={!canShowSecret} // Disable button unless conditions are met
        >
          Show me the Secret Phrase
        </button>
      </div>

      {/* Secret Phrase Display */}
      {showSecret && canShowSecret && (
        <div className="w-full mt-6">
          <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
            Secret Phrase
          </label>
          <div className="relative">
            <p className={`p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}>
              {secretPhrase}
            </p>
            <button
              onClick={handleCopy}
              className="absolute top-1/2 transform -translate-y-1/2 right-3 hover:scale-105 transition duration-300 ease-in-out">
              <img src="/popup/icons/copy.svg" alt="Copy" className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretExport;
