import React from 'react';
import Balance from '@src/components/utils/Balance';

const Main: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <p className={`text-xl ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        Welcome! You have successfully unlocked the app.
      </p>
      <h2 className={`text-xl ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
        <Balance />
      </h2>
    </div>
  );
};

export default Main;
