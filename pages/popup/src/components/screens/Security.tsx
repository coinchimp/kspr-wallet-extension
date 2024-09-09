import React, { useEffect, useState } from 'react';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

type SecurityProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  passcode: string;
  onBack: () => void;
};

const Security: React.FC<SecurityProps> = ({ isLight, selectedAccount, passcode, onBack }) => {
  const [accountName, setAccountName] = useState(selectedAccount.name);
  const [accountAddress, setAccountAddress] = useState<string>('');

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

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [lockTimer, setLockTimer] = useState<number | null>(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const lockTimerOptions = [1, 5, 15, 30, 60, 120]; // In minutes (1min to 2 hours)

  const renderContent = () => {
    switch (selectedOption) {
      case 'changePasscode':
        return (
          <div className="w-full mt-4">
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                Current Passcode
              </label>
              <input
                type="password"
                style={{ outline: 'none' }}
                value={currentPasscode}
                onChange={e => setCurrentPasscode(e.target.value)}
                className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                New Passcode
              </label>
              <input
                type="password"
                value={newPasscode}
                style={{ outline: 'none' }}
                onChange={e => setNewPasscode(e.target.value)}
                className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
              />
            </div>
            <div className="mb-4">
              <label className={`block mb-2 text-sm font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                Confirm New Passcode
              </label>
              <input
                type="password"
                value={confirmPasscode}
                style={{ outline: 'none' }}
                onChange={e => setConfirmPasscode(e.target.value)}
                className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
              />
            </div>
            <button
              className={`w-full text-base mb-6 p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
                isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
              } hover:scale-105`}>
              Save
            </button>
          </div>
        );
      case 'lockTimer':
        return (
          <div className="w-full mt-4">
            <div className="mb-6">
              <h3 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Lock Timer</h3>
              <ul className="space-y-3">
                {lockTimerOptions.map(time => (
                  <li key={time} className="flex items-center">
                    <input
                      type="radio"
                      checked={lockTimer === time}
                      onChange={() => setLockTimer(time)}
                      className="mr-2"
                    />
                    <label className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                      {time < 60 ? `${time} min` : `${time / 60} hours`}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className={`w-full text-base mb-6 p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
                isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
              } hover:scale-105`}>
              Save
            </button>
          </div>
        );
      case 'hardReset':
        return (
          <div className="w-full mb-6 flex flex-col items-center">
            <h3 className={`text-2xl font-bold mb-6 ${isLight ? 'text-red-600' : 'text-red-400'}`}>Hard Reset</h3>
            <svg
              height="48px"
              width="48px"
              viewBox="0 0 192.146 192.146"
              fill="currentColor"
              className={`mb-4 ${isLight ? 'text-red-600' : 'text-red-400'}`}
              xmlns="http://www.w3.org/2000/svg">
              <g>
                <g>
                  <g>
                    <path
                      d="M108.186,144.372c0,7.054-4.729,12.32-12.037,12.32h-0.254c-7.054,0-11.92-5.266-11.92-12.32
                    c0-7.298,5.012-12.31,12.174-12.31C103.311,132.062,108.059,137.054,108.186,144.372z M88.44,125.301h15.447l2.951-61.298H85.46
                    L88.44,125.301z M190.372,177.034c-2.237,3.664-6.214,5.921-10.493,5.921H12.282c-4.426,0-8.51-2.384-10.698-6.233
                    c-2.159-3.849-2.11-8.549,0.147-12.349l84.111-149.22c2.208-3.722,6.204-5.96,10.522-5.96h0.332
                    c4.445,0.107,8.441,2.618,10.513,6.546l83.515,149.229C192.717,168.768,192.629,173.331,190.372,177.034z M179.879,170.634
                    L96.354,21.454L12.292,170.634H179.879z"
                    />
                  </g>
                </g>
              </g>
            </svg>
            <p className={`text-xs mb-4 ${isLight ? 'text-red-600' : 'text-red-400'}`}>
              This will remove all data from this wallet, including all accounts. Make sure you have copied your secret
              phrase and private keys for all accounts. Otherwise, you will lose access to your funds. After the
              process, you can import an existing secret phrase or create a new one.
            </p>
            <div className="flex items-start mb-6">
              <input
                type="checkbox"
                checked={isCheckboxChecked}
                onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
                className="mr-2"
                style={{ accentColor: '#70C7BA' }}
              />
              <label className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                I understand all the risks associated with this action.
              </label>
            </div>
            <div className="w-full mt-6"></div>
            <button
              className={`w-full text-base p-4 rounded-lg ${isCheckboxChecked ? 'bg-red-500' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold hover:bg-red-600 transition duration-300 ease-in-out`}
              disabled={!isCheckboxChecked}>
              Hard Reset
            </button>
          </div>
        );
      default:
        return (
          <div className="w-full space-y-4 mt-4">
            <div
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
              onClick={() => setSelectedOption('changePasscode')}>
              <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Change Passcode</h3>
            </div>
            <div
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
              onClick={() => setSelectedOption('lockTimer')}>
              <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Lock Timer</h3>
            </div>
            <div
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}
              onClick={() => setSelectedOption('hardReset')}>
              <h3 className={`text-base font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>Hard Reset</h3>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack}>
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Security Settings</h1>
      </div>

      {/* Render Content based on selected option */}
      {renderContent()}
    </div>
  );
};

export default Security;
