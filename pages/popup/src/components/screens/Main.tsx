import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
import { createAccounts } from '../../../../../chrome-extension/utils/Kaspa';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

const Main: React.FC<{ isLight: boolean; passcode: string }> = ({ isLight, passcode }) => {
  const [accountAddress, setAccountAddress] = useState<string>('');

  useEffect(() => {
    const loadAccountAddress = async () => {
      try {
        // Step 1: Retrieve the encrypted seed from storage
        const encryptedSeed = await encryptedSeedStorage.getSeed();
        if (!encryptedSeed) {
          throw new Error('No seed found in storage.');
        }

        // Step 2: Decrypt the seed using the provided passcode
        const seed = await decryptData(passcode, encryptedSeed);

        // Step 3: Create accounts using the decrypted seed
        const accounts = await createAccounts(seed);
        console.log('Generated accounts:', accounts);

        if (accounts && accounts.length > 0) {
          setAccountAddress(accounts[0].address); // Set the address of Account #1
        } else {
          throw new Error('No accounts generated.');
        }
      } catch (error) {
        console.error('Failed to load account address:', error);
      }
    };

    loadAccountAddress(); // Load the account address on component mount
  }, [passcode]); // Ensure that the effect runs again if the passcode changes

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <p className={`text-xl ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        Welcome! You have successfully unlocked the app.
      </p>
      <h2 className={`text-xl ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        <Balance />
      </h2>
      <div className={`text-s ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        Account 1 Address: {accountAddress || 'Loading...'}
      </div>
    </div>
  );
};

export default Main;
