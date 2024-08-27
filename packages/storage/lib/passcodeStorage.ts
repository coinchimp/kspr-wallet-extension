import { createStorage } from './base';
import { StorageEnum } from './enums';

const storePasscode = createStorage<string | null>('passcode-storage-key', null, {
  storageEnum: StorageEnum.Session,
  liveUpdate: true,
});

export const passcodeStorage = {
  ...storePasscode,
  savePasscode: async (passcode: string) => {
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    const passcodeData = { passcode, expiryTime };
    await storePasscode.set(() => JSON.stringify(passcodeData));
  },
  getPasscode: async () => {
    const passcodeData = await storePasscode.get();
    if (passcodeData) {
      const { passcode, expiryTime } = JSON.parse(passcodeData);
      if (Date.now() < expiryTime) {
        await passcodeStorage.savePasscode(passcode);
        return passcode;
      } else {
        await passcodeStorage.clearPasscode(); // Clear expired passcode
      }
    }
    return null;
  },
  clearPasscode: async () => {
    await storePasscode.set(() => null);
  },
};
