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
import Send2 from '@src/components/screens/Send2';
import Settings from '@src/components/screens/Settings';
import Actions from '@src/components/screens/Actions';
import Accounts from '@src/components/screens/Accounts';
import AccountInfo from '@src/components/screens/AccountInfo';
import NewAccount from '@src/components/screens/NewAccount';
import PrivateKey from '@src/components/screens/PrivateKey';
import SecretExport from '@src/components/screens/SecretExport';
import Security from '@src/components/screens/Security';
import Network from '@src/components/screens/Network';
import Contacts from '@src/components/screens/Contacts';
import NewContact from '@src/components/screens/NewContact';
import ContactInfo from '@src/components/screens/ContactInfo';
import About from '@src/components/screens/About';
import ImportKey from '@src/components/screens/ImportKey';
import Compound from '@src/components/screens/Compound';

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
  Send2,
  Settings,
  Actions,
  Accounts,
  AccountInfo,
  PrivateKey,
  SecretExport,
  NewAccount,
  Security,
  Network,
  Contacts,
  NewContact,
  ContactInfo,
  About,
  ImportKey,
  Compound,
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
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

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

  const handleSend1Next = (token: any, amount: number, address: string) => {
    setSelectedToken(token);
    setAmount(amount);
    setRecipientAddress(address);
    setCurrentScreen(Screen.Send2);
  };

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
            onActions={() => setCurrentScreen(Screen.Actions)}
            onCompound={() => setCurrentScreen(Screen.Compound)}
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
        );
      case Screen.Settings:
        return (
          <Settings
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Main)}
            onAccounts={() => setCurrentScreen(Screen.Accounts)}
            onSecurity={() => setCurrentScreen(Screen.Security)}
            onNetwork={() => setCurrentScreen(Screen.Network)}
            onContacts={() => setCurrentScreen(Screen.Contacts)}
            onAbout={() => setCurrentScreen(Screen.About)}
          />
        );
      case Screen.Actions:
        return (
          <Actions
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Main)}
          />
        );
      case Screen.Accounts:
        return (
          <Accounts
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Settings)}
            onAccountInfo={() => setCurrentScreen(Screen.AccountInfo)}
            onNewAccount={() => setCurrentScreen(Screen.NewAccount)}
            onImportKey={() => setCurrentScreen(Screen.ImportKey)}
            onShowSecret={() => setCurrentScreen(Screen.SecretExport)}
          />
        );
      case Screen.AccountInfo:
        return (
          <AccountInfo
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Accounts)}
            onRemove={() => setCurrentScreen(Screen.AccountInfo)}
            onShowKey={() => setCurrentScreen(Screen.PrivateKey)}
          />
        );
      case Screen.NewAccount:
        return <NewAccount isLight={isLight} onBack={() => setCurrentScreen(Screen.Accounts)} />;
      case Screen.ImportKey:
        return <ImportKey isLight={isLight} onBack={() => setCurrentScreen(Screen.Accounts)} />;
      case Screen.Security:
        return (
          <Security
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Settings)}
          />
        );
      case Screen.PrivateKey:
        return (
          <PrivateKey
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.AccountInfo)}
          />
        );
      case Screen.SecretExport:
        return (
          <SecretExport
            isLight={isLight}
            selectedAccount={selectedAccount}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Accounts)}
          />
        );
      case Screen.Network:
        return (
          <Network
            isLight={isLight}
            //selectedAccount={selectedAccount}
            //passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Settings)}
          />
        );
      case Screen.Contacts:
        return (
          <Contacts
            isLight={isLight}
            onContactInfo={() => setCurrentScreen(Screen.ContactInfo)}
            onNewContact={() => setCurrentScreen(Screen.NewContact)}
            onBack={() => setCurrentScreen(Screen.Settings)}
          />
        );
      case Screen.ContactInfo:
        return <ContactInfo isLight={isLight} onBack={() => setCurrentScreen(Screen.Contacts)} />;
      case Screen.NewContact:
        return <NewContact isLight={isLight} onBack={() => setCurrentScreen(Screen.Contacts)} />;
      case Screen.About:
        return <About isLight={isLight} onBack={() => setCurrentScreen(Screen.Settings)} />;
      case Screen.Send1:
        return (
          <Send1
            isLight={isLight}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Main)}
            onNext={handleSend1Next}
          />
        );
      case Screen.Send2:
        return (
          <Send2
            isLight={isLight}
            passcode={passcode}
            onBack={() => setCurrentScreen(Screen.Send1)}
            selectedToken={selectedToken}
            amount={amount}
            recipientAddress={recipientAddress}
          />
        );
      case Screen.Compound:
        return <Compound isLight={isLight} passcode={passcode} onBack={() => setCurrentScreen(Screen.Main)} />;
      default:
        return null;
    }
  };

  const settingsButton = () => {
    if (currentScreen !== null && [Screen.Main, Screen.Send1, Screen.Send2, Screen.Receive].includes(currentScreen)) {
      return (
        <button
          className={`p-2 rounded-full ${isLight ? 'bg-gray-100' : 'bg-gray-800'} hover:scale-105 transition duration-300 ease-in-out ${isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'}`}
          style={{ marginLeft: '8px' }}
          onClick={() => setCurrentScreen(Screen.Settings)}>
          <img src="/popup/icons/settings.svg" alt="Settings" className="h-5 w-5" />
        </button>
      );
    } else {
      return (
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            marginLeft: '8px',
          }}
        />
      );
    }
  };

  const LockButton = () => {
    const handleLock = () => {
      chrome.runtime.sendMessage({ type: 'LOCK' }, response => {
        if (response.lock) {
          console.log('Wallet is locked');
          setCurrentScreen(Screen.Unlock);
        } else if (response.error) {
          console.error('Failed to lock:', response.error);
        }
      });
    };

    if (currentScreen !== null && [Screen.Main, Screen.Send1, Screen.Send2, Screen.Receive].includes(currentScreen)) {
      return (
        <button
          className={`absolute right-4 p-2 rounded-full  ${isLight ? 'bg-gray-100' : 'bg-gray-800'} hover:scale-105 transition duration-300 ease-in-out ${isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'}`}
          style={{ marginRight: '8px' }}
          onClick={handleLock}>
          <img src="/popup/icons/lock.svg" alt="Lock" className="h-5 w-5" />
        </button>
      );
    }
    return null;
  };

  if (currentScreen === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-900'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        {/* Top legend */}
        <div className={`fixed top-0 left-0 w-full z-10 bg-transparent`}>
          {/* Top legend and icons */}
          <div className={`flex justify-between items-center p-2`}>
            {/* Settings Button */}
            {settingsButton()}

            {/* KSPR Title Centered */}
            <h1 className={`text-3xl font-extrabold flex-1 text-center ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>
              KSPR
            </h1>

            {/* Help Button on the Right */}
            <button
              className={`p-2 rounded-full ${isLight ? 'bg-gray-100' : 'bg-gray-800'} hover:scale-105 transition duration-300 ease-in-out ${isLight ? 'hover:bg-gray-200 hover:text-gray-900' : 'hover:bg-gray-700 hover:text-gray-100'}`}
              style={{ marginRight: '8px' }} // Adjust margin for positioning
            >
              <img src="/popup/icons/help.svg" alt="Help" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <section
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%', // Ensure the section doesn't overlap with the top legend
            width: '100%',
            paddingTop: '15px',
            overflowY: 'auto', // Make the section scrollable within its area
            marginTop: '24px', // Push the section below the fixed legend
          }}>
          {renderScreen()}
        </section>

        <div className="flex justify-between items-center pb-[5px] p-2">
          {/* Toggle Button in the Center */}
          <ToggleButton />

          {/* Lock Button on the Right */}
          {LockButton()}
        </div>
      </header>
    </div>
  );
};

const ToggleButton: React.FC = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  return (
    <button
      className={`relative w-9 h-6 rounded-full transition duration-300 ease-in-out ${isLight ? 'bg-gray-300' : 'bg-gray-700'} p-3`}
      onClick={exampleThemeStorage.toggle}
      style={{ outline: isLight ? '2px solid gray-800' : '2px solid gray-200', margin: '9px' }} // Add margin and outline
    >
      <div
        className={`absolute w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${isLight ? 'bg-white' : 'bg-gray-900'}`}
        style={{
          transform: isLight ? 'translate(0, -50%)' : 'translate(100%, -50%)', // Combine horizontal and vertical translation
          top: '50%', // Center vertically
          left: '2px', // Adjust left position if necessary
        }}
      />
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
