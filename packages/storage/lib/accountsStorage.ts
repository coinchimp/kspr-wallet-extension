import { createStorage } from './base';
import { StorageEnum } from './enums';

const storeAccounts = createStorage<any>('accounts-storage-key', null, {
  storageEnum: StorageEnum.Session,
  liveUpdate: true,
});

export const accountsStorage = {
  ...storeAccounts,
  saveAccounts: async (accounts: any) => {
    await storeAccounts.set(() => accounts);
  },
  getAccounts: async () => {
    return await storeAccounts.get();
  },
  clearAccounts: async () => {
    await storeAccounts.set(() => null);
  },
};
