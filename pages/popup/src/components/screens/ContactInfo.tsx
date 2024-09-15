import React, { useEffect, useState } from 'react';
import { decryptData } from '../../../../../chrome-extension/utils/Crypto';
import { encryptedSeedStorage } from '@extension/storage';

type ContactInfoProps = {
  isLight: boolean;
  onBack: () => void;
};

const getRandomTurquoiseColor = () => {
  const turquoiseColors = ['#AFEEEE', '#40E0D0', '#48D1CC', '#00CED1', '#20B2AA'];
  return turquoiseColors[Math.floor(Math.random() * turquoiseColors.length)];
};

const ContactInfo: React.FC<ContactInfoProps> = ({ isLight, onBack }) => {
  const contactName = 'Alice';
  const contactWalletAddress = 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl';
  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-3 pt-1 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Contact Info</h1>
      </div>

      <div
        className="rounded-full h-14 w-14 flex items-center justify-center space-x-4 mb-3"
        style={{ backgroundColor: getRandomTurquoiseColor() }}>
        <span className="text-white text-2xl font-bold">{contactName.charAt(0).toUpperCase()}</span>
      </div>

      <div className="w-full mb-4">
        <label className={`block mb-2 text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Contact Name
        </label>
        <p className={`p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}>
          {contactName}
        </p>
      </div>

      <div className="w-full mb-4">
        <label className={`block mb-2 text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
          Wallet Address
        </label>
        <p
          className={`p-3 rounded-lg ${isLight ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-200'}`}
          style={{ wordBreak: 'break-all' }}>
          {contactWalletAddress}
        </p>
      </div>
      <div className="w-full mt-8">
        <button
          className={`w-full text-base mb-6 p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
            isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
          } hover:scale-105`}
          onClick={onBack}>
          Delete Contact
        </button>
      </div>
    </div>
  );
};

export default ContactInfo;
