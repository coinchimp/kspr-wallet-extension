import React from 'react';

type AboutProps = {
  isLight: boolean;
  onBack: () => void;
};

const About: React.FC<AboutProps> = ({ isLight, onBack }) => {
  const aboutItems = [
    { label: 'Terms of Service', link: 'https://example.com/terms', icon: '/popup/icons/external-link.svg' },
    { label: 'Privacy Policy', link: 'https://example.com/privacy', icon: '/popup/icons/external-link.svg' },
    { label: 'Visit Website', link: 'https://example.com', icon: '/popup/icons/external-link.svg' },
  ];

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-4 pt-6 overflow-y-auto">
      <div className="w-full flex items-center mb-4">
        <button
          className={`text-2xl p-3 w-12 h-12 mr-4 ${isLight ? 'bg-gray-100' : 'bg-gray-800'} mb-2 hover:scale-105 transition duration-300 ease-in-out rounded-full font-bold flex items-center justify-center`}
          onClick={onBack}>
          <img src="/popup/icons/back-arrow-2.svg" alt="Back" className="h-10 w-10" />
        </button>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>About</h1>
      </div>

      {/* Wallet Version */}
      <div className="w-full text-center mb-6">
        <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>Version 24.09.R1a</h2>
      </div>

      {/* About Links */}
      <div className="w-full space-y-4">
        {aboutItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition duration-300 ease-in-out ${isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'}`}>
            <div className="flex items-center space-x-4">
              <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{item.label}</h3>
            </div>
            <img src={item.icon} alt="External Link" className="h-5 w-5" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default About;
