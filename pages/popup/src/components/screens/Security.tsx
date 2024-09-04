import React, { useState } from 'react';

type SecurityProps = {
  isLight: boolean;
  onBack: () => void;
};

const Security: React.FC<SecurityProps> = ({ isLight, onBack }) => {
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
                onChange={e => setConfirmPasscode(e.target.value)}
                className={`w-full p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
              />
            </div>
            <button className="w-full p-4 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition duration-300 ease-in-out">
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
            <button className="w-full p-4 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition duration-300 ease-in-out">
              Save
            </button>
          </div>
        );
      case 'hardReset':
        return (
          <div className="w-full mt-4">
            <h3 className={`text-2xl font-bold mb-6 ${isLight ? 'text-red-600' : 'text-red-400'}`}>Hard Reset</h3>
            <p className={`text-sm mb-4 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
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
              />
              <label className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                I understand all the risks associated with this action.
              </label>
            </div>
            <button
              className={`w-full p-4 rounded-lg ${isCheckboxChecked ? 'bg-red-500' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold hover:bg-red-600 transition duration-300 ease-in-out`}
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
