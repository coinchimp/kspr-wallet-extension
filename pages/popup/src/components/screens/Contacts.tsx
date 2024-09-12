import React from 'react';

type ContactsProps = {
  isLight: boolean;
  onBack: () => void;
  onContactInfo: () => void;
  onNewContact: () => void;
};

const contacts = [
  { name: 'Alice', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk833qkcl' },
  { name: 'Bob', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m396333aa4ed7pva2u9vcsk8583qkcl' },
  { name: 'Charlie', address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl' },
];

const recentlyUsed = [
  { address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl' },
  { address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl' },
  { address: 'kaspatest:qr63dcf5mfexwg9kcx77gr6pgcy099m3963geaa4ed7pva2u9vcsk8583qkcl' },
];

const reduceKaspaAddress = (address: string): string => {
  if (address.length > 20) {
    return `${address.slice(0, 12)}...${address.slice(-10)}`;
  }
  return address;
};

// Function to generate a random turquoise tone color
const getRandomTurquoiseColor = () => {
  const turquoiseColors = ['#40E0D0', '#48D1CC', '#00CED1', '#20B2AA', '#2C887A', '#2C8888', '#25AD92', '#278C89'];
  return turquoiseColors[Math.floor(Math.random() * turquoiseColors.length)];
};

const Contacts: React.FC<ContactsProps> = ({ isLight, onBack, onContactInfo, onNewContact }) => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Contacts</h1>
      </div>

      {/* Contacts Section */}
      <div className="w-full space-y-4">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className={`flex justify-between items-center cursor-pointer p-3 rounded-lg ${
              isLight ? 'bg-gray-100' : 'bg-gray-800'
            } transition duration-300 ease-in-out ${
              isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'
            }`}
            onClick={onContactInfo}>
            <div className="flex items-center space-x-4">
              {/* Random Turquoise Logo */}
              <div
                className="rounded-full h-11 w-11 flex items-center justify-center space-x-4"
                style={{ backgroundColor: getRandomTurquoiseColor() }}>
                <span className="text-white text-xl font-bold">{contact.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* Contact Name and Address */}
              <div>
                <h3 className={`text-base text-left font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
                  {contact.name}
                </h3>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {reduceKaspaAddress(contact.address)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Used Section */}
      <div className="w-full mt-8 space-y-4">
        <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Recently Used</h2>
        {recentlyUsed.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
            {/* Wallet Address */}
            <p className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>
              {reduceKaspaAddress(item.address)}
            </p>

            {/* Add Button */}
            <button
              className="rounded-full h-8 w-8 bg-[#70C7BA] flex items-center justify-center hover:scale-105 transition duration-300 ease-in-out"
              onClick={onNewContact}>
              <span className="text-white text-base font-bold">+</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Contact Button */}
      <div className="w-full mt-8">
        <button
          className={`w-full text-base mb-6 p-3 rounded-lg font-bold transition duration-300 ease-in-out ${
            isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white'
          } hover:scale-105`}
          onClick={onNewContact}>
          Add New Contact
        </button>
      </div>
    </div>
  );
};

export default Contacts;
