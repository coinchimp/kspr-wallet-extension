import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
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
  onAccounts: () => void;
  onSecurity: () => void;
  onNetwork: () => void;
  onContacts: () => void;
  onAbout: () => void;
};

const Settings: React.FC<SettingsProps> = ({
  isLight,
  selectedAccount,
  passcode,
  onBack,
  onAccounts,
  onSecurity,
  onNetwork,
  onContacts,
  onAbout,
}) => {
  const [accountAddress, setAccountAddress] = useState<string>('');

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

  const settingsItems = [
    { label: 'Accounts', icon: '/popup/icons/accounts.svg', action: onAccounts },
    { label: 'Security', icon: '/popup/icons/security.svg', action: onSecurity },
    { label: 'Network', icon: '/popup/icons/network.svg', action: onNetwork },
    { label: 'Contacts', icon: '/popup/icons/contacts.svg', action: onContacts },
    { label: 'About', icon: '/popup/icons/about.svg', action: onAbout },
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
            className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
            onClick={item.action} // Navigate to the respective page
          >
            <div className="flex items-center space-x-4">
              <img src={item.icon} alt={item.label} className="h-7 w-7" />
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
