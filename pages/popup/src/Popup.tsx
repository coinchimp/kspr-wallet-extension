import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ComponentPropsWithoutRef, useState, useEffect } from 'react';
import Unlock from '@src/components/screens/Unlock';
import Main from '@src/components/screens/Main';
import Start from '@src/components/screens/Start';
import Secret from '@src/components/screens/Secret';
import Secret2 from '@src/components/screens/Secret2';
import Import from '@src/components/screens/Import';
import { encryptedSeedStorage } from '@extension/storage';

enum Screen {
  Start,
  Secret,
  Secret2,
  Import,
  Unlock,
  Main,
}

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [passcode, setPasscode] = useState<string>(''); // State for passcode
  const [secretWords, setSecretWords] = useState<string[]>([]); // State for secret words

  // Check for an existing seed in storage on component mount
  useEffect(() => {
    const checkForExistingSeed = async () => {
      const encryptedSeed = await encryptedSeedStorage.getSeed();
      if (encryptedSeed) {
        console.log('Seed found in storage, navigating to Unlock screen');
        setCurrentScreen(Screen.Unlock);
      } else {
        console.log('No seed found, navigating to Start screen');
        setCurrentScreen(Screen.Start);
      }
    };

    checkForExistingSeed();
  }, []);

  const handleCreateWallet = () => {
    console.log('Navigating to Secret screen');
    setCurrentScreen(Screen.Secret);
  };

  const handleImportWallet = () => {
    console.log('Navigating to Import screen');
    setCurrentScreen(Screen.Import);
  };

  const handleSecretVerified = (words: string[]) => {
    console.log('Secret Verified, navigating to Secret2 screen');
    setSecretWords(words); // Store the generated secret words
    setCurrentScreen(Screen.Secret2);
  };

  const handleSecret2Finished = (passcode: string) => {
    // Updated to accept a passcode
    setPasscode(passcode); // Store the passcode
    setCurrentScreen(Screen.Main); // Move to Main screen
  };

  const handleWalletImported = (importedPasscode: string) => {
    console.log('Wallet Imported, navigating to Main screen');
    setPasscode(importedPasscode); // Store the imported passcode
    setCurrentScreen(Screen.Main); // Move to the Main screen
  };

  const handleUnlock = (enteredPasscode: string) => {
    setPasscode(enteredPasscode); // Store the passcode
    console.log('Navigating to Main screen');
    setCurrentScreen(Screen.Main); // Move to the Main screen
  };

  const renderScreen = () => {
    console.log('Current screen:', currentScreen); // Log the current screen
    switch (currentScreen) {
      case Screen.Start:
        return <Start isLight={isLight} onCreateWallet={handleCreateWallet} onImportWallet={handleImportWallet} />;
      case Screen.Secret:
        return (
          <Secret
            isLight={isLight}
            onNextStep={handleSecretVerified} // Pass handleSecretVerified to get the secret words
          />
        );
      case Screen.Secret2:
        return (
          <Secret2
            isLight={isLight}
            onFinish={handleSecret2Finished} // Pass handleSecret2Finished expecting a passcode
            secretWords={secretWords} // Pass the stored secret words to Secret2
          />
        );
      case Screen.Import:
        return <Import isLight={isLight} onImport={handleWalletImported} />;
      case Screen.Unlock:
        return (
          <Unlock
            isLight={isLight}
            onUnlock={handleUnlock} // Pass handleUnlock to get the passcode
            isSettingPasscode={false} // Default to entering a passcode
            onForgotPassword={() => setCurrentScreen(Screen.Import)} // Navigate to Import screen on forgot password
          />
        );
      case Screen.Main:
        console.log('Rendering Main screen with passcode:', passcode);
        return <Main isLight={isLight} passcode={passcode} />; // Pass the passcode to Main
      default:
        return null;
    }
  };

  if (currentScreen === null) {
    // Return a loading state while checking for the seed
    return <div>Loading...</div>;
  }

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-900'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        {/* Top legend */}
        <div className={`fixed top-0 left-0 w-full z-10 bg-transparent`}>
          {/* Top legend and question mark */}
          <div className={`flex justify-between items-center p-2`}>
            <div className="text-center w-full">
              <h1 className={`text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>KSPR</h1>
            </div>
            <div className="absolute right-4">
              <button
                className={`p-2 rounded-full ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'} 
                  border border-transparent hover:border-current`}>
                ?
              </button>
            </div>
          </div>
          {/* Fine line below the legend */}
          <div className={`border-t-2 w-full ${isLight ? 'border-gray-900' : 'border-gray-100'}`} />
        </div>

        <section
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          {renderScreen()}
        </section>

        <ToggleButton>Toggle theme</ToggleButton>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorageSuspense(exampleThemeStorage);

  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-2 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
