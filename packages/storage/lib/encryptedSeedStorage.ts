import { createStorage } from './base';
import { StorageEnum } from './enums';

const storeEncryptedSeed = createStorage<any>('encrypted-seed-storage-key', null, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const encryptedSeedStorage = {
  ...storeEncryptedSeed,
  saveSeed: async (encryptedSeed: any) => {
    await storeEncryptedSeed.set(() => encryptedSeed);
  },
  getSeed: async () => {
    return await storeEncryptedSeed.get();
  },
  clearSeed: async () => {
    await storeEncryptedSeed.set(() => null);
  },
};
