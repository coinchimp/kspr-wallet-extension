// src/pages/popup/Popup.tsx
import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import SvgComponent from '@src/components/SvgComponent';
import { useBlinkingEffect } from '@src/hooks/useBlinkingEffect';
import { ComponentPropsWithoutRef } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';
  const isEyesOpen = useBlinkingEffect();

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      files: ['content-runtime/index.iife.js'],
    });
  };

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-900'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        {/* Top legend */}
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
        {/* Fine line */}
        <div className={`border-t-2 w-full ${isLight ? 'border-gray-900' : 'border-gray-100'} my-4`} />
        <section
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <SvgComponent isLight={isLight} isEyesOpen={isEyesOpen} />
        </section>
        {/* Enter your passcode */}
        <h2 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-gray-200'} mb-4`}>
          Enter your passcode
        </h2>

        {/* Passcode Input */}
        <input
          type="password"
          className={`w-full py-2 px-4 text-lg font-bold rounded-md mb-6 ${isLight ? 'bg-gray-100 text-gray-900 border-2 border-gray-900' : 'bg-gray-700 text-white border-none'}`}
          placeholder="Passcode"
        />

        {/* Forgot Passcode */}
        <button
          className={`text-sm font-bold mb-4 ${isLight ? 'text-gray-400' : 'text-gray-500'} bg-transparent`}
          onClick={() => console.log('Forgot Passcode Clicked')}>
          Forgot Passcode
        </button>

        {/* UNLOCK Button */}
        <button
          className={
            'font-extrabold text-xl py-2 px-6 rounded shadow hover:scale-105 text-white w-[70%] ' +
            (isLight ? 'bg-[#70C7BA] text-white shadow-black' : 'bg-[#70C7BA] text-white')
          }
          onClick={injectContentScript}>
          UNLOCK
        </button>
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
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
