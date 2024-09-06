import React, { useEffect } from 'react';

type BalanceProps = {
  address: string; // Accept address as a prop
  onBalanceUpdate: (balance: number) => void; // Accept a callback to update balance
};

const Balance: React.FC<BalanceProps> = ({ address, onBalanceUpdate }) => {
  useEffect(() => {
    const getBalance = async () => {
      try {
        const balance = await fetchBalance(address);
        onBalanceUpdate(balance); // Call the callback with fetched balance
      } catch (error) {
        console.error('Error fetching balance:', error);
        onBalanceUpdate(0); // Set balance to 0 or handle error appropriately
      }
    };

    getBalance();
  }, [address, onBalanceUpdate]);

  async function fetchBalance(address: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'FETCH_BALANCE', address }, response => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.balance);
        }
      });
    });
  }

  return null; // This component only handles balance fetching, no UI needed here
};

export default Balance;
