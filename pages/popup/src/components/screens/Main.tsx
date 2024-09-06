import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const exchangeRate = 0.168; // $KAS to USD exchange rate
const jsonUrl =
  'https://raw.githubusercontent.com/coinchimp/kspr-wallet-extension/main/chrome-extension/public/tokens.json';
const kasplexApiUrl = 'https://tn10api.kasplex.org/v1/krc20/address'; // Base URL for Kasplex API

type MainProps = {
  isLight: boolean;
  passcode: string;
  onSend: () => void;
  onReceive: () => void;
  onActions: () => void;
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

// Generates a random number between 1 and 10 for the default image
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const randomImageNumber = Math.floor(Math.random() * 10) + 1;
  e.currentTarget.src = `/popup/ksprwallet${randomImageNumber}.jpg`; // Use random default image
  e.currentTarget.onerror = null; // Prevent infinite loop if all images fail
};

const Main: React.FC<MainProps> = ({ isLight, passcode, onSend, onReceive, onActions }) => {
  const [kasBalance, setKasBalance] = useState<number | null>(null); // Store Kaspa balance
  const [kasBalanceFetched, setKasBalanceFetched] = useState<boolean>(false); // Track if Kaspa balance is fetched
  const [tokensData, setTokensData] = useState<any[]>([]); // Store fetched token images
  const [tokensFromApi, setTokensFromApi] = useState<any[]>([]); // Store tokens from Kasplex API
  const [accounts, setAccounts] = useState<any[]>([]); // Store fetched accounts
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Kaspa token object
  const kasToken = {
    name: 'Kaspa',
    symbol: 'KAS',
    balance: kasBalance || 0,
    exchangeRate: exchangeRate, // $KAS to USD exchange rate
    change24h: -1.23, // Add the change value for Kaspa
  };

  const totalUSD = [kasToken, ...tokensFromApi].reduce((sum, token) => sum + token.balance * token.exchangeRate, 0);
  const totalChange24h =
    totalUSD !== 0
      ? [kasToken, ...tokensFromApi].reduce(
          (sum, token) => sum + token.change24h * token.balance * token.exchangeRate,
          0,
        ) / totalUSD
      : 0;

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const encryptedSeed = await encryptedSeedStorage.getSeed();
        if (!encryptedSeed) {
          throw new Error('No seed found in storage.');
        }

        const seed = await decryptData(passcode, encryptedSeed);

        // Send message to background script to get and store accounts
        chrome.runtime.sendMessage({ type: 'GET_AND_STORE_ACCOUNTS', seed }, response => {
          if (response.error) {
            console.error('Error fetching accounts:', response.error);
          } else {
            setAccounts(response.accounts);
            setSelectedAccount(response.accounts[0]); // Select the first account by default
          }
        });
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };

    const fetchTokensImages = async () => {
      try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        setTokensData(data.tokens); // Store tokens data
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    loadAccounts();
    fetchTokensImages(); // Fetch token images when component mounts
  }, [passcode]);

  const fetchTokensFromKasplex = async (address: string) => {
    try {
      const response = await fetch(`${kasplexApiUrl}/${address}/tokenlist`);
      const data = await response.json();
      const tokensFromApi = data.result.map((token: any) => ({
        name: token.tick,
        symbol: token.tick,
        balance: Number(token.balance) / 10 ** Number(token.dec), // Convert balance using decimals
        exchangeRate: 0, // Placeholder, as API does not provide exchange rates
        change24h: 0, // Placeholder, as API does not provide change values
      }));
      setTokensFromApi(tokensFromApi); // Store tokens from Kasplex
    } catch (error) {
      console.error('Error fetching tokens from Kasplex API:', error);
      setTokensFromApi([]); // Reset tokens in case of error
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      fetchTokensFromKasplex(selectedAccount.address); // Fetch tokens when account is selected

      // Fetch Kaspa balance only once per account
      if (!kasBalanceFetched) {
        setKasBalanceFetched(true); // Mark Kaspa balance as fetched
      }
    }
  }, [selectedAccount, kasBalanceFetched]);

  const getTokenImage = (symbol: string) => {
    const token = tokensData.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
    return token ? token.image : `ksprwallet${Math.floor(Math.random() * 10) + 1}.jpg`; // Random default image if not found
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      {/* Fetch Kaspa balance only if the selected account is available and not yet fetched */}
      {selectedAccount && !kasBalanceFetched && (
        <Balance address={selectedAccount.address} onBalanceUpdate={balance => setKasBalance(balance)} />
      )}

      {/* UI rendering code */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="relative">
            <button
              className={`text-sm font-bold cursor-pointer ${isLight ? 'text-gray-900' : 'text-gray-200'}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}>
              {selectedAccount ? selectedAccount.name : 'Loading...'}
            </button>

            {dropdownOpen && accounts.length > 0 && (
              <ul
                className={`absolute mt-2 w-48 rounded-md shadow-lg ${
                  isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-200'
                } `}>
                {accounts.map((account, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 cursor-pointer transition duration-300 ease-in-out ${
                      isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedAccount(account);
                      setKasBalanceFetched(false); // Reset Kaspa balance fetch for new account
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
              if (selectedAccount) {
                navigator.clipboard.writeText(selectedAccount.address);
                console.log(`Copied address: ${selectedAccount.address}`);
              }
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

      {/* Render tokens */}
      <div className="w-full space-y-4">
        {[kasToken, ...tokensFromApi].map((token, index) => (
          <div
            key={index}
            className={`flex justify-between items-center cursor-pointer p-4 rounded-lg ${
              isLight ? 'bg-gray-100' : 'bg-gray-800'
            } transition duration-300 ease-in-out ${
              isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'
            }`}>
            <div className="flex items-center space-x-4">
              <img
                src={`/popup/${getTokenImage(token.symbol)}`}
                alt={token.name}
                className="h-9 w-9 rounded-full" // Add rounded-full for rounding the token image
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
                className={`text-sm ${
                  token.exchangeRate
                    ? token.change24h >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                    : isLight
                      ? 'text-gray-400'
                      : 'text-gray-600'
                }`}>
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
