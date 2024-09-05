import React from 'react';

// Define the Contacts and RecentlyUsed arrays
const contacts = [
  { name: 'Alice', address: 'kaspa:qz0a4...someaddress1' },
  { name: 'Bob', address: 'kaspa:qz0a4...someaddress2' },
  { name: 'Charlie', address: 'kaspa:qz0a4...someaddress3' },
];

const recentlyUsed = [
  { address: 'kaspa:qz0a4...someaddress4' },
  { address: 'kaspa:qz0a4...someaddress5' },
  { address: 'kaspa:qz0a4...someaddress6' },
];

type ContactsProps = {
  isLight: boolean;
  onBack: () => void;
};

// Function to generate a random turquoise tone color
const getRandomTurquoiseColor = () => {
  const turquoiseColors = ['#AFEEEE', '#40E0D0', '#48D1CC', '#00CED1', '#20B2AA'];
  return turquoiseColors[Math.floor(Math.random() * turquoiseColors.length)];
};

const Contacts: React.FC<ContactsProps> = ({ isLight, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-4 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold text-[#70C7BA] flex items-center justify-center`}
          onClick={onBack} // Navigate back to the previous page
        >
          ←
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Contacts</h1>
      </div>

      {/* Contacts Section */}
      <div className="w-full space-y-4">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}>
            <div className="flex items-center space-x-4">
              {/* Random Turquoise Logo */}
              <div
                className="rounded-full h-12 w-12 flex items-center justify-center"
                style={{ backgroundColor: getRandomTurquoiseColor() }}>
                <span className="text-white text-xl font-bold">{contact.name.charAt(0).toUpperCase()}</span>
              </div>

              {/* Contact Name and Address */}
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{contact.name}</h3>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{contact.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Used Section */}
      <div className="w-full mt-8">
        <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Recently Used</h2>
        {recentlyUsed.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}>
            {/* Wallet Address */}
            <p className={`text-sm ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{item.address}</p>

            {/* Add Button */}
            <button className="rounded-full h-8 w-8 bg-[#70C7BA] flex items-center justify-center hover:scale-105 transition duration-300 ease-in-out">
              <span className="text-white text-xl font-bold">+</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Contact Button */}
      <div className="w-full mt-8">
        <button
          className={`w-full p-4 rounded-lg text-white font-bold hover:scale-105 transition duration-300 ease-in-out ${isLight ? 'bg-[#70C7BA] hover:bg-[#50B7A4]' : 'bg-[#70C7BA] hover:bg-[#50B7A4]'}`}>
          Add Contact
        </button>
      </div>
    </div>
  );
};

export default Contacts;
