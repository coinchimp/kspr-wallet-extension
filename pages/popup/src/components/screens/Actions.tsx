import React, { useEffect, useState } from 'react';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const jsonUrl = '/popup/tokens.json';

type Action = {
  tokenName: string;
  tokenSymbol: string;
  actionType: 'Sent' | 'Received';
  amount: number;
  address: string;
  transactionId: string;
  date: string;
  status: string;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const randomImageNumber = Math.floor(Math.random() * 4) + 1;

  // Full fallback image URL from GitHub repository
  const fallbackImageUrl = `/popup/token-logos/ksprwallet${randomImageNumber}.png`;

  // Set fallback image URL directly if not already set
  e.currentTarget.src = fallbackImageUrl;
  e.currentTarget.onerror = null; // Stop further error handling after retry
};

// Custom date comparison functions
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

const isLastWeek = (date: Date): boolean => {
  const today = new Date();
  const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));
  return date >= oneWeekAgo;
};

const isLastMonth = (date: Date): boolean => {
  const today = new Date();
  const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
  return date >= oneMonthAgo;
};

const reduceKaspaAddress = (address: string): string => {
  if (address.length > 20) {
    return `${address.slice(0, 12)}...${address.slice(-10)}`;
  }
  return address;
};

const reduceTransactionId = (txId: string): string => {
  if (txId.length > 20) {
    return `${txId.slice(0, 12)}...${txId.slice(-10)}`;
  }
  return txId;
};

const formatBalance = (balance: number | null | undefined): string => {
  if (balance == null || isNaN(balance)) {
    return '0';
  }
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

const kaspaExplorer = 'https://explorer-tn10.kaspa.org';

// Example array of actions with tokenName, tokenSymbol, and date
const exampleActions: Action[] = [
  {
    tokenName: 'Kaspa',
    tokenSymbol: 'KAS',
    actionType: 'Sent',
    amount: 1200,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk85844kcl',
    transactionId: '1eac8bc8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474708',
    date: new Date().toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'KSPR',
    tokenSymbol: 'KSPR',
    actionType: 'Received',
    amount: 534578923.12,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk833qkcl',
    transactionId: '1eac8bc8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474708',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'Nacho',
    tokenSymbol: 'NACHO',
    actionType: 'Sent',
    amount: 200,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl',
    transactionId: '2a4b8df8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474709',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'Chimp',
    tokenSymbol: 'CHIMP',
    actionType: 'Received',
    amount: 10000,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk833qkcl',
    transactionId: '3b5c9ef8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474710',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'failed',
  },
  {
    tokenName: 'Kaspa',
    tokenSymbol: 'KAS',
    actionType: 'Sent',
    amount: 1500,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk85844jkl',
    transactionId: '4c6d0af8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474711',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'KSPR',
    tokenSymbol: 'KSPR',
    actionType: 'Received',
    amount: 123456789.12,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583q33m',
    transactionId: '5d7e1bf8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474712',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'Nacho',
    tokenSymbol: 'NACHO',
    actionType: 'Sent',
    amount: 250,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkfm',
    transactionId: '6e8f2cf8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474713',
    date: new Date(Date.now() - 14 * 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'Chimp',
    tokenSymbol: 'CHIMP',
    actionType: 'Received',
    amount: 50000,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qk12',
    transactionId: '7f9g3df8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474714',
    date: new Date(Date.now() - 21 * 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'Kaspa',
    tokenSymbol: 'KAS',
    actionType: 'Sent',
    amount: 1750,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk85844nlk',
    transactionId: '8g0h4ef8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474715',
    date: new Date(Date.now() - 25 * 86400000).toISOString(),
    status: 'confirmed',
  },
  {
    tokenName: 'KSPR',
    tokenSymbol: 'KSPR',
    actionType: 'Received',
    amount: 987654321.12,
    address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583q33p',
    transactionId: '9h1i5gf8013fe0a3c7fc112be233186a06c77015f71d13c91138e9af70474716',
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    status: 'confirmed',
  },
];

const contacts = [
  { name: 'Alice', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk833qkcl' },
  { name: 'Bob', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m396333aa4ed7pva2u9vcsk8583qkcl' },
  { name: 'Charlie', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl' },
];

const getContactName = (address: string): string | null => {
  const contact = contacts.find(contact => contact.address === address);
  return contact ? contact.name : null;
};

const groupActionsByDate = (actions: Action[]) => {
  return actions.reduce<{ [key: string]: Action[] }>((grouped, action) => {
    const actionDate = new Date(action.date);
    let label = '';

    if (isToday(actionDate)) {
      label = 'Today';
    } else if (isYesterday(actionDate)) {
      label = 'Yesterday';
    } else if (isLastWeek(actionDate)) {
      label = 'Last Week';
    } else if (isLastMonth(actionDate)) {
      label = 'Last Month';
    } else {
      label = actionDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    }

    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(action);
    return grouped;
  }, {});
};

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
  const [search, setSearch] = useState<string>('');
  const [filteredActions, setFilteredActions] = useState<Action[]>(exampleActions);
  const [tokensData, setTokensData] = useState<any[]>([]); // Store fetched token images

  const fetchTokensImages = async () => {
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      setTokensData(data.tokens); // Store tokens data
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const getTokenImage = (symbol: string) => {
    const token = tokensData.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());

    // Return the image if found, otherwise return undefined
    return token ? token.image : '';
  };

  useEffect(() => {
    const filtered = exampleActions.filter(action => {
      return (
        action.tokenName.toLowerCase().includes(search.toLowerCase()) ||
        action.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        action.address.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredActions(filtered);
  }, [search]);

  const groupedActions = groupActionsByDate(filteredActions);

  fetchTokensImages();

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Wallet Actions</h1>
      </div>

      {/* Search Input */}
      <div className="w-full mb-4">
        <input
          type="text"
          value={search}
          style={{ outline: 'none' }}
          onChange={e => setSearch(e.target.value)}
          className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
          placeholder="Search by token, transaction, or address..."
        />
      </div>

      {/* Grouped Transactions */}
      {Object.entries(groupedActions).map(([label, actions]) => (
        <div key={label} className="w-full space-y-4 mt-2">
          <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{label}</h2>
          {actions.map((action, index) => (
            <div
              key={index}
              className={`relative flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
              onClick={() => window.open(`${kaspaExplorer}/txs/${action.transactionId}`, '_blank')}>
              {/* Status icon */}
              <div className="absolute top-1 right-1">
                {action.status === 'confirmed' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                  </svg>
                )}
              </div>

              {/* Token and action details */}
              <div className="flex items-center space-x-4">
                <img
                  src={getTokenImage(action.tokenSymbol.toString()) || 'invalid-url'}
                  alt={action.tokenName}
                  className="h-9 w-9 rounded-full object-cover"
                  onError={handleImageError}
                />

                <div>
                  <h3
                    className={`text-xs text-left font-bold ${
                      action.actionType === 'Received' ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {action.actionType === 'Received' ? '+' : '-'} {formatBalance(action.amount)} {action.tokenSymbol}
                  </h3>
                  <p className={`text-xs text-left ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {action.actionType === 'Sent' ? 'To:' : 'From:'}
                    {getContactName(action.address) ? (
                      <span className={`font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                        {' '}
                        {getContactName(action.address)}
                      </span>
                    ) : (
                      reduceKaspaAddress(action.address)
                    )}
                  </p>
                  <p className={`text-xs text-left ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    TxId: {reduceTransactionId(action.transactionId)}
                  </p>
                  <p className={`text-xs text-left mt-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {new Date(action.date).toLocaleString('default', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Actions;
