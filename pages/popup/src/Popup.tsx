import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';
  const svgContainerRef = useRef<SVGSVGElement>(null);
  const [isEyesOpen, setIsEyesOpen] = useState(true);

  useEffect(() => {
    // Change the fill color of the SVG paths based on the theme
    if (svgContainerRef.current) {
      const paths = svgContainerRef.current.querySelectorAll('path.Border1');
      paths.forEach(path => {
        path.setAttribute('fill', isLight ? '#000000' : '#FFFFFF');
      });
    }
  }, [isLight]);

  useEffect(() => {
    const blinkTwice = () => {
      setIsEyesOpen(false);
      setTimeout(() => {
        setIsEyesOpen(true);
      }, 100); // Time for the first blink

      setTimeout(() => {
        setIsEyesOpen(false);
      }, 300); // Time for the second blink

      setTimeout(() => {
        setIsEyesOpen(true);
      }, 400); // Time to open eyes after second blink
    };

    const getRandomInterval = () => {
      return Math.random() * 8000 + 2000; // Random interval between 2000ms (2s) and 10000ms (10s)
    };

    const startBlinking = () => {
      blinkTwice();
      const timeoutId = setTimeout(startBlinking, getRandomInterval());
      return timeoutId; // Return timeout ID for cleanup
    };

    const timeoutId = startBlinking();

    return () => clearTimeout(timeoutId); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    if (svgContainerRef.current) {
      const leftEye = svgContainerRef.current.querySelector('path.leftEye');
      const rightEye = svgContainerRef.current.querySelector('path.rightEye');

      if (isEyesOpen) {
        leftEye?.setAttribute('d', eyesOpenPathsData[0]);
        rightEye?.setAttribute('d', eyesOpenPathsData[1]);
      } else {
        leftEye?.setAttribute('d', eyesClosedPaths[0]);
        rightEye?.setAttribute('d', eyesClosedPaths[1]);
      }
    }
  }, [isEyesOpen]);

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
          <svg
            ref={svgContainerRef}
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="187"
            height="230"
            viewBox="0 0 646.000000 745.000000"
            preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0.000000,745.000000) scale(0.100000,-0.100000)" stroke="none">
              <path
                className="Border1"
                d="M2260 6830 l0 -100 -100 0 -100 0 0 -100 0 -100 -100 0 -100 0 0
       -100 0 -100 -100 0 -100 0 0 -200 0 -200 -100 0 -100 0 0 -300 0 -300 -100 0
       -100 0 0 -500 0 -500 -100 0 -100 0 0 -100 0 -100 -100 0 -100 0 0 -100 0
       -100 -100 0 -100 0 0 -200 0 -200 100 0 100 0 0 -100 0 -100 100 0 100 0 0
       -100 0 -100 200 0 200 0 0 -300 0 -300 -100 0 -100 0 0 -100 0 -100 -200 0
       -200 0 0 -100 0 -100 300 0 300 0 0 -100 0 -100 300 0 300 0 0 -200 0 -200
       100 0 100 0 0 -200 0 -200 100 0 100 0 0 -100 0 -100 100 0 100 0 0 -100 0
       -100 200 0 200 0 0 -100 0 -100 500 0 500 0 0 100 0 100 200 0 200 0 0 100 0
       100 100 0 100 0 0 100 0 100 100 0 100 0 0 200 0 200 100 0 100 0 0 500 0 500
       -100 0 -100 0 0 200 0 200 -100 0 -100 0 0 200 0 200 100 0 100 0 0 -100 0
       -100 300 0 300 0 0 100 0 100 100 0 100 0 0 100 0 100 100 0 100 0 0 200 0
       200 -100 0 -100 0 0 100 0 100 -100 0 -100 0 0 100 0 100 -100 0 -100 0 0 500
       0 500 -100 0 -100 0 0 300 0 300 -100 0 -100 0 0 200 0 200 -100 0 -100 0 0
       100 0 100 -100 0 -100 0 0 100 0 100 -100 0 -100 0 0 100 0 100 -1000 0 -1000
       0 0 -100z m2000 -200 l0 -100 100 0 100 0 0 -100 0 -100 100 0 100 0 0 -200 0
       -200 100 0 100 0 0 -300 0 -300 100 0 100 0 0 -400 0 -400 -200 0 -200 0 0
       -100 0 -100 -200 0 -200 0 0 -100 0 -100 -200 0 -200 0 0 -100 0 -100 -400 0
       -400 0 0 100 0 100 -200 0 -200 0 0 100 0 100 -200 0 -200 0 0 100 0 100 -200
       0 -200 0 0 100 0 100 -200 0 -200 0 0 300 0 300 100 0 100 0 0 300 0 300 100
       0 100 0 0 200 0 200 100 0 100 0 0 100 0 100 100 0 100 0 0 100 0 100 1000 0
       1000 0 0 -100z m-2600 -2200 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0
       -100z m400 -200 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z m3000
       0 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z m-3400 -200 l0 -100
       200 0 200 0 0 -100 0 -100 200 0 200 0 0 -100 0 -100 200 0 200 0 0 -100 0
       -100 -100 0 -100 0 0 -100 0 -100 200 0 200 0 0 100 0 100 500 0 500 0 0 100
       0 100 200 0 200 0 0 100 0 100 200 0 200 0 0 100 0 100 300 0 300 0 0 -100 0
       -100 100 0 100 0 0 -100 0 -100 -100 0 -100 0 0 -100 0 -100 -300 0 -300 0 0
       100 0 100 -100 0 -100 0 0 -100 0 -100 -300 0 -300 0 0 -100 0 -100 200 0 200
       0 0 -100 0 -100 100 0 100 0 0 -200 0 -200 100 0 100 0 0 -500 0 -500 -100 0
       -100 0 0 -200 0 -200 -100 0 -100 0 0 -100 0 -100 -200 0 -200 0 0 -100 0
       -100 -500 0 -500 0 0 100 0 100 -200 0 -200 0 0 100 0 100 -100 0 -100 0 0
       200 0 200 -100 0 -100 0 0 500 0 500 -100 0 -100 0 0 -200 0 -200 -300 0 -300
       0 0 200 0 200 100 0 100 0 0 400 0 400 -300 0 -300 0 0 100 0 100 -100 0 -100
       0 0 200 0 200 100 0 100 0 0 100 0 100 300 0 300 0 0 -100z m800 0 l0 -100
       -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z m2200 0 l0 -100 -100 0 -100 0
       0 100 0 100 100 0 100 0 0 -100z m-1800 -200 l0 -100 -100 0 -100 0 0 100 0
       100 100 0 100 0 0 -100z m1400 0 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100
       0 0 -100z m-1000 -200 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z
       m600 0 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z"
                fill="#000000"
              />
              <path
                className="leftEye"
                d="M2460 5630 l0 -100 -100 0 -100 0 0 -300 0 -300 100 0 100 0 0 -100
       0 -100 200 0 200 0 0 100 0 100 100 0 100 0 0 300 0 300 -100 0 -100 0 0 100
       0 100 -200 0 -200 0 0 -100z m200 -200 l0 -100 -100 0 -100 0 0 100 0 100 100
       0 100 0 0 -100z"
                fill="#000000"
              />
              <path
                className="rightEye"
                d="M4060 5630 l0 -100 -100 0 -100 0 0 -300 0 -300 100 0 100 0 0 -100
       0 -100 200 0 200 0 0 100 0 100 100 0 100 0 0 300 0 300 -100 0 -100 0 0 100
       0 100 -200 0 -200 0 0 -100z m200 -200 l0 -100 -100 0 -100 0 0 100 0 100 100
       0 100 0 0 -100z"
                fill="#000000"
              />
              <path
                className="mouth"
                d="M3060 4430 l0 -100 100 0 100 0 0 -100 0 -100 200 0 200 0 0 100 0
       100 100 0 100 0 0 100 0 100 -400 0 -400 0 0 -100z"
                fill="#000000"
              />
              <path
                className="Border2"
                d="M1660 3430 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z"
                fill="#000000"
              />
              <path
                className="Border3"
                d="M2460 3030 l0 -100 -100 0 -100 0 0 -200 0 -200 100 0 100 0 0 200 0
       200 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z"
                fill="#000000"
              />
              {/*letter K of Kaspa logo*/}
              <path
                className="KaspaLogo"
                d="M3060 2630 l0 -100 100 0 100 0 0 -100 0 -100 100 0 100 0 0 -200 0
       -200 -100 0 -100 0 0 -100 0 -100 -100 0 -100 0 0 -100 0 -100 200 0 200 0 0
       100 0 100 100 0 100 0 0 100 0 100 100 0 100 0 0 -300 0 -300 100 0 100 0 0
       700 0 700 -100 0 -100 0 0 -200 0 -200 -100 0 -100 0 0 100 0 100 -100 0 -100
       0 0 100 0 100 -200 0 -200 0 0 -100z"
                fill="#000000"
              />
              {/* <!-- chainlinks --> */}
              <path d="M1460 4430 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#d8a304" />
              <path d="M1860 4230 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f8ca3f" />
              <path d="M4860 4230 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#d8a304" />
              <path d="M2260 4030 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f2d680" />
              <path d="M4460 4030 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f8ca3f" />
              <path d="M2660 3830 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f2d680" />
              <path d="M4060 3830 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f2d680" />
              <path d="M3060 3630 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#fcebb8" />
              <path d="M3660 3630 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#fcebb8" />
              {/* <!-- darker medallon turquese fill --> */}
              <path
                d="M3060 3030 l0 -100 -200 0 -200 0 0 -200 0 -200 -100 0 -100 0 0
       -500 0 -500 100 0 100 0 0 -200 0 -200 200 0 200 0 0 -100 0 -100 100 0 100 0
       0 100 0 100 -100 0 -100 0 0 100 0 100 -100 0 -100 0 0 200 0 200 -100 0 -100
       0 0 300 0 300 100 0 100 0 0 200 0 200 100 0 100 0 0 100 0 100 100 0 100 0 0
       100 0 100 -100 0 -100 0 0 -100z"
                fill="#39c2a8"
              />
              <path
                d="M4060 2830 l0 -100 100 0 100 0 0 -100 0 -100 100 0 100 0 0 -500 0
       -500 -100 0 -100 0 0 -100 0 -100 -100 0 -100 0 0 -100 0 -100 200 0 200 0 0
       200 0 200 100 0 100 0 0 500 0 500 -100 0 -100 0 0 200 0 200 -200 0 -200 0 0
       -100z"
                fill="#39c2a8"
              />
              {/* <!-- lighter medallon turquese fill --> */}
              <path
                d="M3260 3030 l0 -100 -100 0 -100 0 0 -100 0 -100 -100 0 -100 0 0
        -200 0 -200 -100 0 -100 0 0 -300 0 -300 100 0 100 0 0 -200 0 -200 100 0 100
        0 0 -100 0 -100 100 0 100 0 0 -100 0 -100 400 0 400 0 0 200 0 200 100 0 100
        0 0 100 0 100 100 0 100 0 0 500 0 500 -100 0 -100 0 0 100 0 100 -100 0 -100
        0 0 200 0 200 -400 0 -400 0 0 -100z m200 -400 l0 -100 100 0 100 0 0 -100 0
        -100 100 0 100 0 0 200 0 200 100 0 100 0 0 -700 0 -700 -100 0 -100 0 0 300
        0 300 -100 0 -100 0 0 -100 0 -100 -100 0 -100 0 0 -100 0 -100 -200 0 -200 0
        0 100 0 100 100 0 100 0 0 100 0 100 100 0 100 0 0 200 0 200 -100 0 -100 0 0
        100 0 100 -100 0 -100 0 0 100 0 100 200 0 200 0 0 -100z"
                fill="#4aeecb"
              />
              {/* <!-- goldenmedallonfill-->   */}
              <path d="M3060 3230 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f2d680" />
              <path d="M2660 3030 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f8ca3f" />
              <path d="M4060 3030 l0 -100 200 0 200 0 0 100 0 100 -200 0 -200 0 0 -100z" fill="#f2d680" />
              <path d="M2260 2030 l0 -500 100 0 100 0 0 500 0 500 -100 0 -100 0 0 -500z" fill="#d8a304" />
              <path d="M4660 2030 l0 -500 100 0 100 0 0 500 0 500 -100 0 -100 0 0 -500z" fill="#d8a304" />
              <path d="M2660 1030 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f8ca3f" />
              <path d="M4060 1030 l0 -100 200 0 200 0 0 100 0 100 -200 0 -200 0 0 -100z" fill="#f2d680" />
              <path d="M3060 830 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f2d680" />
              <path d="M3260 3230 l0 -100 400 0 400 0 0 100 0 100 -400 0 -400 0 0 -100z" fill="#fcebb8" />
              <path d="M2860 3030 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#fcebb8" />
              <path d="M2460 2730 l0 -200 100 0 100 0 0 200 0 200 -100 0 -100 0 0 -200z" fill="#f8ca3f" />
              <path d="M4460 2730 l0 -200 100 0 100 0 0 200 0 200 -100 0 -100 0 0 -200z" fill="#f8ca3f" />
              <path d="M2460 1330 l0 -200 100 0 100 0 0 200 0 200 -100 0 -100 0 0 -200z" fill="#f8ca3f" />
              <path d="M4460 1330 l0 -200 100 0 100 0 0 200 0 200 -100 0 -100 0 0 -200z" fill="#f8ca3f" />
              <path d="M2860 1030 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z" fill="#f2d680" />
              <path d="M3260 830 l0 -100 400 0 400 0 0 100 0 100 -400 0 -400 0 0 -100z" fill="#fcebb8" />
            </g>
          </svg>
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

  useEffect(() => {
    if (theme === 'light') {
      document.body.style.backgroundColor = '#FFFFFF'; // Light mode background color
    } else {
      document.body.style.backgroundColor = '#231F20'; // Dark mode background color
    }
  }, [theme]);

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

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);

// Eye paths data (you can move these outside the component or to a separate file if needed)
const eyesClosedPaths = [
  'M2260 5035 l0 -95 95 0 95 0 0 -95 0 -95 200 0 200 0 0 95 0 95 100 0 100 0 0 95 0 95 -395 0 -395 0 0 -95z',
  'M3860 5025 l0 -95 100 0 100 0 0 -95 0 -95 200 0 200 0 0 95 0 95 95 0 95 0 0 95 0 95 -395 0 -395 0 0 -95z',
];

const eyesOpenPathsData = [
  'M2460 5630 l0 -100 -100 0 -100 0 0 -300 0 -300 100 0 100 0 0 -100 0 -100 200 0 200 0 0 100 0 100 100 0 100 0 0 300 0 300 -100 0 -100 0 0 100 0 100 -200 0 -200 0 0 -100z m200 -200 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z',
  'M4060 5630 l0 -100 -100 0 -100 0 0 -300 0 -300 100 0 100 0 0 -100 0 -100 200 0 200 0 0 100 0 100 100 0 100 0 0 300 0 300 -100 0 -100 0 0 100 0 100 -200 0 -200 0 0 -100z m200 -200 l0 -100 -100 0 -100 0 0 100 0 100 100 0 100 0 0 -100z',
];
