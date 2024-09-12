import React, { useEffect, useState } from 'react';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

type AccountInfoProps = {
  isLight: boolean;
  onBack: () => void;
};

const AccountInfo: React.FC<AccountInfoProps> = ({ isLight, onBack }) => {
  const [showAddress, setShowAddress] = useState(false);
  const newWalletAddress = 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl';

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-3 pt-1 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>New Account</h1>
      </div>

      {/* Change Account Name */}
      <div className="w-full mb-2">
        <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Account Name
        </label>
        <input
          type="text"
          style={{ outline: 'none' }}
          className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
        />
      </div>
      {!showAddress && (
        <div className="w-full mb-4">
          <button
            className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
              isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
            } hover:scale-105`}
            onClick={() => setShowAddress(true)}>
            Save New Account
          </button>
        </div>
      )}
      {/* Display Account Address */}
      {showAddress && (
        <div className="w-full mb-4">
          <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
            Account Address
          </label>
          <p className={`p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}>
            {newWalletAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;
