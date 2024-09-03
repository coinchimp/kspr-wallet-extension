import React, { useEffect, useState } from 'react';
import { createAccounts } from '../../../../../chrome-extension/utils/Kaspa';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

// Define the Action type
type Action = {
  tokenName: string;
  tokenSymbol: string;
  actionType: 'Sent' | 'Received';
  amount: number;
  address: string;
};

// Example array of actions with tokenName and tokenSymbol
const exampleActions: Action[] = [
  {
    tokenName: 'Kaspa',
    tokenSymbol: 'KAS',
    actionType: 'Sent',
    amount: 1200,
    address: 'kaspa:qz0a4...someaddress1',
  },
  {
    tokenName: 'KSPR',
    tokenSymbol: 'KSPR',
    actionType: 'Received',
    amount: 534578923.12,
    address: 'kaspa:qz0a4...someaddress2',
  },
  {
    tokenName: 'Nacho',
    tokenSymbol: 'NACHO',
    actionType: 'Sent',
    amount: 200,
    address: 'kaspa:qz0a4...someaddress3',
  },
  {
    tokenName: 'Chimp',
    tokenSymbol: 'CHIMP',
    actionType: 'Received',
    amount: 10000,
    address: 'kaspa:qz0a4...someaddress4',
  },
];

// Define the Props for the Actions component
type ActionsProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  passcode: string;
  onBack: () => void;
};

const Actions: React.FC<ActionsProps> = ({ isLight, selectedAccount, passcode, onBack }) => {
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

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Use onBack to navigate back to the previous page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Wallet Actions</h1>
      </div>

      <div className="w-full space-y-4">
        {exampleActions.map((action, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}>
            <div className="flex items-center space-x-4">
              <img
                src={`/popup/icons/${action.tokenSymbol.toLowerCase()}.svg`}
                alt={action.tokenName}
                className="h-9 w-9"
              />
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                  {action.actionType} {action.amount} {action.tokenSymbol}
                </h3>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {action.actionType === 'Sent' ? 'To:' : 'From:'} {action.address}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Actions;
