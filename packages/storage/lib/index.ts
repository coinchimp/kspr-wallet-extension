import { createStorage } from './base';
import { exampleThemeStorage } from './exampleThemeStorage';
import { encryptedSeedStorage } from './encryptedSeedStorage';
import { passcodeStorage } from './passcodeStorage';
import { accountsStorage } from './accountsStorage';
import { SessionAccessLevelEnum, StorageEnum } from './enums';
import type { BaseStorage } from './types';

export {
  exampleThemeStorage,
  encryptedSeedStorage,
  passcodeStorage,
  accountsStorage,
  createStorage,
  StorageEnum,
  SessionAccessLevelEnum,
};
export type { BaseStorage };
