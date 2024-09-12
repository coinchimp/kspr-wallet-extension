import React, { useState } from 'react';

type NetworkProps = {
  isLight: boolean;
  onBack: () => void;
};

const Network: React.FC<NetworkProps> = ({ isLight, onBack }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet-10' | 'testnet-11'>('mainnet');

  const networks = [
    { name: 'Mainnet', value: 'mainnet' },
    { name: 'Testnet-10', value: 'testnet-10' },
    { name: 'Testnet-11', value: 'testnet-11' },
  ];

  const handleNetworkSwitch = (network: 'mainnet' | 'testnet-10' | 'testnet-11') => {
    setSelectedNetwork(network);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Network Settings</h1>
      </div>

      <div className="w-full space-y-4">
        {networks.map((network, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} `}>
            <div className="flex items-center space-x-4">
              <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{network.name}</h3>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNetwork === network.value}
                onChange={() => handleNetworkSwitch(network.value as 'mainnet' | 'testnet-10' | 'testnet-11')}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-[#70C7BA] dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#70C7BA]`}></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Network;
