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
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <section
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <SvgComponent isLight={isLight} isEyesOpen={isEyesOpen} />
        </section>
        <p>
          Edit <code>pages/popup/src/Popup.tsx</code>
        </p>
        <button
          className={
            'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
            (isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white')
          }
          onClick={injectContentScript}>
          Click to inject Content Script
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
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-[#231F20] text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
