import React, { useEffect, useState } from 'react';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

type AccountInfoProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  passcode: string;
  onBack: () => void;
  onRemove: () => void;
  onShowKey: () => void;
  onShowSecret: () => void;
};

const AccountInfo: React.FC<AccountInfoProps> = ({
  isLight,
  selectedAccount,
  passcode,
  onBack,
  onRemove,
  onShowKey,
  onShowSecret,
}) => {
  const [accountName, setAccountName] = useState(selectedAccount.name);
  const accountAddressTemp = 'kaspatest:qz7d28dacezxdz066pzpkrrf2p45h2rr28evyedwmzlzer6kgvpvc36tjzvcj';
  const [accountAddress, setAccountAddress] = useState<string>('');
  const [AccountRenamed, setAccountRenamed] = useState(false);

  useEffect(() => {
    const loadAccountAddress = async () => {
      try {
        const encryptedSeed = await encryptedSeedStorage.getSeed();
        if (!encryptedSeed) {
          throw new Error('No seed found in storage.');
        }

        const seed = await decryptData(passcode, encryptedSeed);
        const accounts = [
          {
            name: 'Account #1',
            address: 'kaspatest:qzkstpzavl0xp479m573uhu3ujqj6u775vrtqrq0a7qzu0z2m89lq7hwkzgj4',
          },
          {
            name: 'Account #2',
            address: 'kaspatest:qz7d28dacezxdz066pzpkrrf2p45h2rr28evyedwmzlzer6kgvpvc36tjzvcj',
          },
        ];
        console.log('Generated accounts:', accounts);

        if (accounts && accounts.length > 0) {
          setAccountAddress(accounts[0].address);
        } else {
          throw new Error('No accounts generated.');
        }
      } catch (error) {
        console.error('Failed to load account address:', error);
      }
    };

    loadAccountAddress();
  }, [passcode]);

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-3 pt-1 overflow-y-auto">
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
      <div className="w-full mb-2">
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
      {!AccountRenamed && (
        <div className="w-full mb-4">
          <button
            className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
              isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
            } hover:scale-105`}
            onClick={() => setAccountRenamed(true)}>
            Save Account Name
          </button>
        </div>
      )}
      {/* Display Account Address */}
      <div className="w-full mb-4">
        <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Account Address
        </label>
        <p
          className={`p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
          style={{ wordBreak: 'break-all' }}>
          {accountAddressTemp}
        </p>
      </div>

      {/* Show Secret Phrase */}
      <div className="w-full mb-2">
        <button
          className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={onShowSecret}>
          Secret Phrase
        </button>
      </div>

      {/* Show Private Key */}
      <div className="w-full mb-4">
        <button
          className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={onShowKey}>
          Private Key
        </button>
      </div>

      {/* Remove Account Button */}
      <div className="w-full">
        <button
          className={`w-full text-base p-3 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-600'} hover:scale-105`}
          onClick={onRemove}>
          Remove Account
        </button>
      </div>
    </div>
  );
};

export default AccountInfo;
