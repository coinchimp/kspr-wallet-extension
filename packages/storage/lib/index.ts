import { createStorage } from './base';
import { exampleThemeStorage } from './exampleThemeStorage';
import { encryptedSeedStorage } from './encryptedSeedStorage';
import { SessionAccessLevelEnum, StorageEnum } from './enums';
import type { BaseStorage } from './types';

export { exampleThemeStorage, encryptedSeedStorage, createStorage, StorageEnum, SessionAccessLevelEnum };
export type { BaseStorage };
