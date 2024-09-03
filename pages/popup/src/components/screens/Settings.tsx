import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
import { createAccounts } from '../../../../../chrome-extension/utils/Kaspa';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

type SettingsProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  passcode: string;
  onBack: () => void;
};

const Settings: React.FC<SettingsProps> = ({ isLight, selectedAccount, passcode, onBack }) => {
  const [accountAddress, setAccountAddress] = useState<string>('');

  useEffect(() => {
    const loadAccountAddress = async () => {
      try {
        const encryptedSeed = await encryptedSeedStorage.getSeed();
        if (!encryptedSeed) {
          throw new Error('No seed found in storage.');
        }

        const seed = await decryptData(passcode, encryptedSeed);
        const accounts = await createAccounts(seed);
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

  const settingsItems = [
    { label: 'Accounts', icon: '/popup/icons/accounts.svg' },
    { label: 'Security', icon: '/popup/icons/security.svg' },
    { label: 'Network', icon: '/popup/icons/network.svg' },
    { label: 'Contacts', icon: '/popup/icons/contacts.svg' },
    { label: 'About', icon: '/popup/icons/about.svg' },
  ];

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Use onBack to navigate back to the previous page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Wallet Settings</h1>
      </div>

      <div className="w-full space-y-4">
        {settingsItems.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}>
            <div className="flex items-center space-x-4">
              <img src={item.icon} alt={item.label} className="h-9 w-9" />
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{item.label}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
