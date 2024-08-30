import QRCode from 'react-qr-code';
import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
import { createAccounts } from '../../../../../chrome-extension/utils/Kaspa';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';
//import { useNavigate } from 'react-router-dom';

type ReceivedProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  passcode: string;
};

const Received: React.FC<ReceivedProps> = ({ isLight, selectedAccount, passcode }) => {
  //const navigate = useNavigate(); // Hook for navigation
  const [accountAddress, setAccountAddress] = useState<string>('');
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedAccount.address);
    console.log(`Copied address: ${selectedAccount.address}`);
  };

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

  const handleClose = () => {
    //navigate('/'); // Assuming '/' is the route for your Main screen
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 pt-6">
      <h1 className={`text-2xl font-bold mb-6 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Receive Address</h1>

      {/* QR Code */}
      <QRCode value={selectedAccount.address} size={200} className="mb-6" />

      {/* Wallet Address */}
      <div className="flex flex-col items-center">
        <p className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          {selectedAccount.address}
        </p>
        <button onClick={handleCopyAddress} className="hover:scale-105">
          <img src="/popup/icons/copy.svg" alt="Copy Address" className="h-6 w-6" />
        </button>
      </div>

      {/* Close Button */}
      <button
        className={`mt-10 px-6 py-2 rounded-full ${isLight ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-gray-200'} hover:scale-105 transition duration-300`}
        onClick={handleClose}>
        Close
      </button>
    </div>
  );
};

export default Received;
