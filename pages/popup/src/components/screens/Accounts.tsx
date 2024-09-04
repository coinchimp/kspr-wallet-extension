import React, { useState } from 'react';

type AccountsProps = {
  isLight: boolean;
  selectedAccount: {
    name: string;
    address: string;
  };
  onBack: () => void;
};

const Accounts: React.FC<AccountsProps> = ({ isLight, selectedAccount, onBack }) => {
  const [accounts, setAccounts] = useState([
    { name: 'Account 1', address: 'kaspa:qz0a4...someaddress1' },
    { name: 'Account 2', address: 'kaspa:qz0a4...someaddress2' },
    { name: 'Account 3', address: 'kaspa:qz0a4...someaddress3' },
  ]);

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Use onBack to navigate back to Settings page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Accounts</h1>
      </div>

      {/* List of Accounts */}
      <div className="w-full space-y-4">
        {accounts.map((account, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}>
            <div className="flex items-center space-x-4">
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{account.name}</h3>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{account.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Account Button */}
      <div className="w-full mt-6">
        <button
          className={`w-full p-4 rounded-lg font-bold transition duration-300 ease-in-out ${isLight ? 'bg-[#70C7BA] text-white' : 'bg-[#70C7BA] text-white'} hover:scale-105`}
          onClick={() => {
            // Logic for adding a new account (placeholder)
            const newAccountName = `Account ${accounts.length + 1}`;
            const newAccount = { name: newAccountName, address: `kaspa:qz0a4...newaddress${accounts.length + 1}` };
            setAccounts([...accounts, newAccount]);
          }}>
          Add / Import
        </button>
      </div>
    </div>
  );
};

export default Accounts;
