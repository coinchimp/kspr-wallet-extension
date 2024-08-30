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
import Receive from '@src/components/screens/Receive';
import Send1 from '@src/components/screens/Send1';
import { encryptedSeedStorage } from '@extension/storage';

enum Screen {
  Start,
  Secret,
  Secret2,
  Import,
  Unlock,
  Main,
  Receive,
  Send1,
}

const accounts = [
  { name: 'Account 1', address: 'kaspa:qz0a4...someaddress1' },
  { name: 'Account 2', address: 'kaspa:qz0a4...someaddress2' },
  { name: 'Account 3', address: 'kaspa:qz0a4...someaddress3' },
];

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [passcode, setPasscode] = useState<string>('');
  const [secretWords, setSecretWords] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]); // Add this line

  useEffect(() => {
    const checkForExistingSeed = async () => {
      const encryptedSeed = await encryptedSeedStorage.getSeed();
      if (encryptedSeed) {
        setCurrentScreen(Screen.Unlock);
      } else {
        setCurrentScreen(Screen.Start);
      }
    };

    checkForExistingSeed();
  }, []);

  const handleCreateWallet = () => {
    setCurrentScreen(Screen.Secret);
  };

  const handleImportWallet = () => {
    setCurrentScreen(Screen.Import);
  };

  const handleSecretVerified = (words: string[]) => {
    setSecretWords(words);
    setCurrentScreen(Screen.Secret2);
  };

  const handleSecret2Finished = (passcode: string) => {
    setPasscode(passcode);
    setCurrentScreen(Screen.Main);
  };

  const handleWalletImported = (importedPasscode: string) => {
    setPasscode(importedPasscode);
    setCurrentScreen(Screen.Main);
  };

  const handleUnlock = (enteredPasscode: string) => {
    setPasscode(enteredPasscode);
    setCurrentScreen(Screen.Main);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Start:
        return <Start isLight={isLight} onCreateWallet={handleCreateWallet} onImportWallet={handleImportWallet} />;
      case Screen.Secret:
        return <Secret isLight={isLight} onNextStep={handleSecretVerified} />;
      case Screen.Secret2:
        return <Secret2 isLight={isLight} onFinish={handleSecret2Finished} secretWords={secretWords} />;
      case Screen.Import:
        return <Import isLight={isLight} onImport={handleWalletImported} />;
      case Screen.Unlock:
        return (
          <Unlock
            isLight={isLight}
            onUnlock={handleUnlock}
            isSettingPasscode={false}
            onForgotPassword={() => setCurrentScreen(Screen.Import)}
          />
        );
      case Screen.Main:
        return (
          <Main
            isLight={isLight}
            passcode={passcode}
            onSend={() => setCurrentScreen(Screen.Send1)}
            onReceive={() => setCurrentScreen(Screen.Receive)}
          />
        );
      case Screen.Receive:
        return (
          <Receive
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Main)}
          />
        ); // Pass selectedAccount and passcode
      case Screen.Send1:
        return <Send1 isLight={isLight} passcode={passcode} onBack={() => setCurrentScreen(Screen.Main)} />;
      default:
        return null;
    }
  };

  if (currentScreen === null) {
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
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            paddingTop: '72px',
          }}>
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
