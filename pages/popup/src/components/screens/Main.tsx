import React, { useEffect, useState, useMemo } from 'react';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const jsonUrl = '/popup/tokens.json';
const kasplexApiUrl = 'https://tn10api.kasplex.org/v1/krc20/address';
const marketplaceApiUrl = 'https://storage.googleapis.com/testnet-kspr-api-v1/marketplace/marketplace.json';

type MainProps = {
  isLight: boolean;
  passcode: string;
  onSend: () => void;
  onReceive: () => void;
  onActions: () => void;
  onCompound: () => void;
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

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const randomImageNumber = Math.floor(Math.random() * 4) + 1;

  // Full fallback image URL from GitHub repository
  const fallbackImageUrl = `/popup/token-logos/ksprwallet${randomImageNumber}.png`;

  // Set fallback image URL directly if not already set
  e.currentTarget.src = fallbackImageUrl;
  e.currentTarget.onerror = null; // Stop further error handling after retry
};

const Main: React.FC<MainProps> = ({ isLight, passcode, onSend, onReceive, onActions, onCompound }) => {
  const [tokensData, setTokensData] = useState<any[]>([]);
  const [tokensFromApi, setTokensFromApi] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [marketData, setMarketData] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const utxo_count = useMemo(() => selectedAccount?.utxoCount || 0, [selectedAccount]);

  const kasToken = useMemo(() => {
    const kasData = marketData?.KAS || { floor_price: 0, change_24h: 0 };
    return {
      name: 'Kaspa',
      symbol: 'KAS',
      balance: selectedAccount?.balance || 0,
      exchangeRate: kasData.floor_price,
      change24h: kasData.change_24h,
    };
  }, [selectedAccount, marketData]);

  const totalUSD = useMemo(() => {
    return [kasToken, ...tokensFromApi].reduce(
      (sum, token) => sum + token.balance * token.exchangeRate,
      0
    );
  }, [selectedAccount, kasToken, tokensFromApi, marketData]);

  const totalChange24h = useMemo(() => {
    return totalUSD !== 0
      ? [kasToken, ...tokensFromApi].reduce(
          (sum, token) => sum + token.change24h * token.balance * token.exchangeRate,
          0
        ) / totalUSD
      : 0;
  }, [selectedAccount, totalUSD, kasToken, tokensFromApi, marketData]);

  const fetchMarketData = async () => {
    try {
      const urlWithCacheBuster = `${marketplaceApiUrl}?t=${new Date().getTime()}`;
      const response = await fetch(urlWithCacheBuster);
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchTokensImages = async () => {
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      setTokensData(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const fetchTokensFromKasplex = async (address: string) => {
    try {
      const response = await fetch(`${kasplexApiUrl}/${address}/tokenlist`);
      const data = await response.json();
      const tokens = data.result.map((token: any) => {
        const marketToken = marketData ? marketData[token.tick] : null;
        const exchangeRate = marketToken ? marketToken.floor_price * kasToken.exchangeRate : 0;
        const change24h = marketToken ? marketToken.change_24h + kasToken.change24h : 0;
        return {
          name: token.tick,
          symbol: token.tick,
          balance: Number(token.balance) / 10 ** Number(token.dec),
          exchangeRate,
          change24h,
        };
      });
      setTokensFromApi(tokens);
    } catch (error) {
      console.error('Error fetching tokens from Kasplex API:', error);
      setTokensFromApi([]);
    }
  };

  // Fetch and display accounts progressively from the background script
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        chrome.runtime.sendMessage({ type: 'GET_ACCOUNTS' }, async response => {
          if (response.error) {
            console.error('Error fetching accounts:', response.error);
          } else {
            if (response.accounts) {
              setAccounts(response.accounts);
              setSelectedAccount((prev: any) => prev || response.accounts[0]); // Select the first account if none selected
            } else {
              const encryptedSeed = await encryptedSeedStorage.getSeed();
              if (!encryptedSeed) throw new Error('No seed found in storage.');

              const seed = await decryptData(passcode, encryptedSeed);

              // Send message to background script to start scanning, and update state progressively
              chrome.runtime.sendMessage({ type: 'GET_AND_STORE_ACCOUNTS', seed }, response => {
                if (response.error) {
                  console.error('Error fetching accounts:', response.error);
                } else {
                  setAccounts(response.accounts);
                  setSelectedAccount((prev: any) => prev || response.accounts[0]); // Select the first account if none selected
                }
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };

    loadAccounts();
    fetchTokensImages();
    fetchMarketData();
  }, [passcode]);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'ACCOUNTS_UPDATED' && message.accounts) {
        setAccounts(message.accounts);

        // Force a re-render even if selectedAccount is the same
        setSelectedAccount((prev: any) => {
          if (prev && prev.address === message.accounts[0].address) {
            // Create a new object reference
            return { ...message.accounts[0] };
          }
          return message.accounts[0];
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    let intervalId;

    const fetchTokensPeriodically = async () => {
      if (selectedAccount) {
        await fetchTokensFromKasplex(selectedAccount.address); // Fetch tokens for selected account
      }
    };

    fetchTokensPeriodically();
    intervalId = setInterval(fetchTokensPeriodically, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedAccount, marketData]);

  const getTokenImage = (symbol: string) => {
    const token = tokensData.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
    return token ? token.image : '';
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
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
                }`}>
                {accounts.map((account, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 cursor-pointer transition duration-300 ease-in-out ${
                      isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedAccount(account);
                      setDropdownOpen(false);
                    }}>
                    {account.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Copy address button */}
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
        <h1 className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalUSD.toFixed(2))}
        </h1>
        <p className={`text-lg ${totalChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {totalChange24h >= 0 ? '+' : ''}
          {totalChange24h.toFixed(2)}%
        </p>
      </div>

      {/* Actions: Send, Receive, Compound */}
      <div className="flex justify-around w-full mb-6">
        {['Send', 'Receive', 'Compound'].map((action, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div
              className={`rounded-full p-4 ${
                isLight ? 'bg-gray-100' : 'bg-gray-800'
              } mb-2 hover:scale-105 transition duration-300 ease-in-out cursor-pointer ${
                isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'
              }`}
              onClick={
                action === 'Send'
                  ? onSend
                  : action === 'Receive'
                    ? onReceive
                    : action === 'Compound'
                      ? onCompound
                      : undefined
              }>
              <img src={`/popup/icons/${action.toLowerCase()}.svg`} alt={action} className="h-8 w-8" />
            </div>

            {/* Notification badge for "Compound" */}
            {action === 'Compound' && utxo_count > 2 && (
              <div className="absolute bottom-6 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {utxo_count}
              </div>
            )}

            <p className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{action}</p>
          </div>
        ))}
      </div>

      {/* Render tokens */}
      <div className="w-full space-y-4">
        {[kasToken, ...tokensFromApi].map((token, index) => (
          <div
            key={index}
            className={`flex justify-between items-center cursor-pointer p-3 rounded-lg ${
              isLight ? 'bg-gray-100' : 'bg-gray-800'
            } transition duration-300 ease-in-out ${
              isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'
            }`}
            onClick={onActions}>
            <div className="flex items-center space-x-4">
              <img
                src={getTokenImage(token.symbol) || 'invalid-url'}
                alt={token.name}
                className="h-9 w-9 rounded-full object-cover"
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
