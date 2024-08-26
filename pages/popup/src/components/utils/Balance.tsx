import React, { useEffect, useState } from 'react';
import { fetchBalance } from '../../../../../chrome-extension/utils/Kaspa';

const Balance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const address = 'kaspatest:qr0gskdc3nekflse693ukz0ckg6mqzz9nql2htvl08rw2qu0epl8s2lptp06k';

  useEffect(() => {
    const getBalance = async () => {
      try {
        const balance = await fetchBalance(address);
        setBalance(balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    getBalance();
  }, [address]);

  return <>{balance !== null ? <span>Balance: {balance.toFixed(2)} KAS</span> : <span>Loading balance...</span>}</>;
};

export default Balance;
