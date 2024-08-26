import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ComponentPropsWithoutRef, useState } from 'react';
import Unlock from '@src/components/screens/Unlock';
import Main from '@src/components/screens/Main';
import Start from '@src/components/screens/Start';
import Secret from '@src/components/screens/Secret';
import Secret2 from '@src/components/screens/Secret2';
import Import from '@src/components/screens/Import';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  const [isUnlocked, setIsUnlocked] = useState(false);

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
          {/* {!isUnlocked ? <Unlock onUnlock={() => setIsUnlocked(true)} isLight={isLight} /> : <Main isLight={isLight} />} */}
          {/* <Start isLight={isLight} /> */} {/* Start new wallet: choose a new secret prahse or import one */}
          {/* <Secret isLight={isLight} /> */} {/* Create New 24-words Secret Phrase */}
          {/* <Secret2 isLight={isLight} /> */} {/* Validate New 24-words Secret Phrase */}
          <Import isLight={isLight} /> {/* Import 24-words Secret Phrase */}
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
