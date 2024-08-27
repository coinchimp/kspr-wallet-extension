import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { passcodeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

// Function to check and clear expired passcode
const checkPasscodeExpiry = async () => {
  const passcodeData = await passcodeStorage.getPasscode();
  if (!passcodeData) {
    console.log('Passcode has expired or does not exist.');
  } else {
    console.log('Passcode is still valid.');
  }
};

// Check passcode expiry every 5 minutes
setInterval(checkPasscodeExpiry, 5 * 60 * 1000); // Every 5 minutes

console.log('background loaded');
console.log("Edit 'chrome-extension/lib/background/index.ts' and save to reload.");
