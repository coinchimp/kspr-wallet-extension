import QRCode from 'react-qr-code';
import React, { useEffect, useState } from 'react';
import Balance from '@src/components/utils/Balance';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

type ReceiveProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  passcode: string;
  onBack: () => void;
};

const Receive: React.FC<ReceiveProps> = ({ isLight, selectedAccount, passcode, onBack }) => {
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

  const handleClose = () => {
    console.log('Receive: handleClose');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 pt-4">
      <button
        className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
        onClick={onBack}>
        <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
      </button>
      <h1 className={`text-2xl font-bold mb-6 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Receive Address</h1>

      {/* QR Code */}
      <QRCode
        value={selectedAccount.address}
        size={160}
        className={`mb-6 ${isLight ? 'bg-gray-200' : 'bg-white'} p-1 rounded-md`}
      />

      {/* Wallet Address */}
      <div className="flex flex-col items-center">
        <p className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          {selectedAccount.address}
        </p>
        <button onClick={handleCopyAddress} className="hover:scale-105">
          <img src="/popup/icons/copy.svg" alt="Copy Address" className="h-10 w-10" />
        </button>
      </div>
    </div>
  );
};

export default Receive;
