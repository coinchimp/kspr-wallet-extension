import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
import { createAccounts } from '../../../../../chrome-extension/utils/Kaspa';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const exchangeRate = 0.168; // $KAS to USD exchange rate
const tokens = [
  { name: 'Kaspa', symbol: 'KAS', balance: 1200, exchangeRate: 0.17, change24h: -1.23 },
  { name: 'KSPR', symbol: 'KSPR', balance: 534578923.12, exchangeRate: 0, change24h: 0 },
  { name: 'Nacho', symbol: 'NACHO', balance: 200, exchangeRate: 0, change24h: 0 },
  { name: 'Kasper', symbol: 'KASPER', balance: 1345560000.0, exchangeRate: 0.00000123, change24h: 4.67 },
  { name: 'Chimp', symbol: 'CHIMP', balance: 10000, exchangeRate: 0.00312, change24h: 41.67 },
];

type MainProps = {
  isLight: boolean;
  passcode: string;
  onSend: () => void;
  onReceive: () => void;
  onActions: () => void;
};

const accounts = [
  { name: 'Account 1', address: 'kaspa:qz0a4...someaddress1' },
  { name: 'Account 2', address: 'kaspa:qz0a4...someaddress2' },
  { name: 'Account 3', address: 'kaspa:qz0a4...someaddress3' },
];

const formatBalance = (balance: number): string => {
  if (balance >= 1_000_000_000_000) {
    return (balance / 1_000_000_000_000).toFixed(2) + 'T';
  } else if (balance >= 1_000_000_000) {
    return (balance / 1_000_000_000).toFixed(2) + 'B';
  } else if (balance >= 1_000_000) {
    return (balance / 1_000_000).toFixed(2) + 'M';
  } else {
    return balance.toFixed(2);
  }
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

const Main: React.FC<MainProps> = ({ isLight, passcode, onSend, onReceive, onActions }) => {
  const [accountAddress, setAccountAddress] = useState<string>('');
  const [kaspaBalance, setKaspaBalance] = useState<number>(tokens[0].balance);

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const totalUSD = tokens.reduce((sum, token) => sum + token.balance * token.exchangeRate, 0);
  const totalChange24h =
    tokens.reduce((sum, token) => sum + token.change24h * token.balance * token.exchangeRate, 0) / totalUSD;

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

  const kaspaUSD = kaspaBalance * exchangeRate;
  const kaspaChange24h = tokens[0].change24h;

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {/* accounts adn addresses */}
          <div className="relative">
            <button
              className={`text-sm font-bold cursor-pointer ${isLight ? 'text-gray-900' : 'text-gray-200'}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}>
              {selectedAccount.name}
            </button>

            {dropdownOpen && (
              <ul
                className={`absolute mt-2 w-48 rounded-md shadow-lg ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-200'} `}>
                {accounts.map((account, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2  cursor-pointer transition duration-300 ease-in-out ${isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'}`}
                    onClick={() => {
                      console.log(`Selected account: ${account.name}`);
                      setSelectedAccount(account);
                      setDropdownOpen(false);
                    }}>
                    {account.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="ml-2 hover:scale-105"
            onClick={() => {
              navigator.clipboard.writeText(selectedAccount.address);
              console.log(`Copied address: ${selectedAccount.address}`);
            }}>
            <img src="/popup/icons/copy.svg" alt="Copy Address" className="h-6 w-6" />
          </button>
        </div>
        {/* Total Balance */}
        <h1 className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>${totalUSD.toFixed(2)}</h1>
        <p className={`text-lg ${totalChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {totalChange24h >= 0 ? '+' : ''}
          {totalChange24h.toFixed(2)}%
        </p>
      </div>

      {/* Icons */}
      <div className="flex justify-around w-full mb-6">
        {['Send', 'Receive', 'Swap', 'Buy'].map((action, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`rounded-full p-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out ${isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'}`}
              onClick={action === 'Send' ? onSend : action === 'Receive' ? onReceive : undefined}>
              <img src={`/popup/icons/${action.toLowerCase()}.svg`} alt={action} className="h-8 w-8" />
            </div>
            <p className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{action}</p>
          </div>
        ))}
      </div>

      {/* Token list */}
      <div className="w-full space-y-4">
        {tokens.map((token, index) => (
          <div
            key={index}
            className={`flex justify-between items-center cursor-pointer p-4 rounded-lg  ${isLight ? 'bg-gray-100' : 'bg-gray-800'} transition duration-300 ease-in-out ${isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'}`}
            onClick={onActions}>
            <div className="flex items-center space-x-4">
              <img
                src={`/popup/${token.symbol.toLowerCase()}.png`}
                alt={token.name}
                className="h-9 w-9"
                onError={handleImageError}
              />

              <div>
                <h3 className={`text-base text-left font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                  {token.name}
                </h3>
                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {formatBalance(token.balance)} {token.symbol}
                </p>
              </div>
            </div>

            <div className="text-right">
              <h3 className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                {token.exchangeRate ? `$${(token.balance * token.exchangeRate).toFixed(2)}` : '$-'}
              </h3>
              <p
                className={`text-sm ${token.exchangeRate ? (token.change24h >= 0 ? 'text-green-500' : 'text-red-500') : isLight ? 'text-gray-400' : 'text-gray-600'}`}>
                {token.exchangeRate ? `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%` : '-%'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;
