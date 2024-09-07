import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { passcodeStorage } from '@extension/storage';
import { accountsStorage } from '@extension/storage';
import * as kaspa from '../../public/kaspa/kaspa';
const { PublicKeyGenerator, createAddress, NetworkType, XPrv, Mnemonic, UtxoContext, UtxoEntryReference } = kaspa;

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

let rpcClient: any = null;
let wasmInitialized = false;
const SOMPI_MULTIPLIER = BigInt(100000000);
const testnetRpcUrls = ['https://1.rpc-kspr.eu', 'https://2.rpc-kspr.eu', 'https://3.rpc-kspr.eu'];

async function ensureWasmModuleInitialized() {
  if (!wasmInitialized) {
    try {
      console.log('Initializing Wasm module...');
      const wasmModule = await fetch('/kaspa/kaspa_bg.wasm')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load Wasm module: ${response.statusText}`);
          }
          return response.arrayBuffer();
        })
        .then(bytes => WebAssembly.compile(bytes));

      await kaspa.default({ module_or_path: wasmModule });
      wasmInitialized = true;
      console.log('Wasm initialized successfully');
    } catch (error) {
      console.error('Error during Wasm initialization:', error);
      throw error;
    }
  }
}

async function ensureRpcClientConnected() {
  try {
    if (!rpcClient || !rpcClient.isConnected) {
      console.log('RPC client not connected, initializing...');
      await ensureWasmModuleInitialized();
      rpcClient = new kaspa.RpcClient({
        resolver: new kaspa.Resolver({
          urls: testnetRpcUrls,
          tls: true,
        }),
        networkId: 'testnet-10',
      });

      await rpcClient.connect();
      console.log('RPC client connected on: testnet-10');
    } else {
      console.log('RPC client already connected.');
    }
  } catch (error) {
    console.error('Error during RPC client connection:', error);
    return { connected: false, error: 'RPC connection failed' };
  }
  return { connected: true };
}

async function updateRpcClient(networkId: string) {
  try {
    if (rpcClient && rpcClient.isConnected) {
      await rpcClient.disconnect();
    }

    await ensureWasmModuleInitialized();
    rpcClient = new kaspa.RpcClient({
      resolver: new kaspa.Resolver({
        urls: networkId === 'testnet-10' ? testnetRpcUrls : [],
        tls: true,
      }),
      networkId: networkId,
    });

    await rpcClient.connect();
    console.log('RPC client connected on:', networkId);
  } catch (error) {
    console.error('Error connecting RPC client on:', networkId, error);
    throw error;
  }
}

// Background message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      await ensureRpcClientConnected();
      if (message.type === 'FETCH_BALANCE') {
        const balanceResponse = await rpcClient.getBalanceByAddress({ address: message.address });
        sendResponse({ balance: fromSompi(balanceResponse.balance) });
      } else if (message.type === 'UPDATE_NETWORK') {
        await updateRpcClient(message.networkId);
        sendResponse({ status: 'Network updated successfully' });
      } else if (message.type === 'GENERATE_WALLET') {
        const mnemonicString = await generateMnemonic();
        sendResponse({ mnemonic: mnemonicString });
      } else if (message.type === 'GET_AND_STORE_ACCOUNTS') {
        const accounts = await getAndStoreAccounts(message.seed);
        sendResponse({ accounts: accounts });
      } else if (message.type === 'GET_ACCOUNTS') {
        const accounts = await accountsStorage.getAccounts();
        sendResponse({ accounts: accounts });
      } else {
        sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error during message processing:', error);
      sendResponse({ error: `Error: ${error}` });
    }
  })();

  return true;
});

function fromSompi(value: number | string | bigint): number {
  return Number(BigInt(value) / SOMPI_MULTIPLIER);
}

function toSompi(value: number | string | bigint): bigint {
  return BigInt(Math.round(Number(value) * Number(SOMPI_MULTIPLIER)));
}

async function generateMnemonic(): Promise<string> {
  const mnemonic = Mnemonic.random(24);
  return mnemonic.phrase;
}

// Helper to progressively return accounts
async function getAndStoreAccounts(seed: string, numAccounts: number = 16) {

  const networkType = NetworkType.Testnet;
  const mnemonic = new Mnemonic(seed);
  const xPrv = new XPrv(mnemonic.toSeed());
  const accounts = [];
  const SCANNING_WINDOW = 64;
  const MAX_SCANS = 1024;
  const DISCOVERY_WINDOW_LIMIT = 4;

  const utxoProcessor = new kaspa.UtxoProcessor({
    networkId: 'testnet-10',
    rpc: rpcClient,
  });

  console.log('Starting UTXO Processor...');
  await utxoProcessor.start();

  for (let accountIndex = 0; accountIndex < numAccounts; accountIndex++) {
    console.log(`Processing account #${accountIndex}...`);
    const xpub = PublicKeyGenerator.fromMasterXPrv(xPrv.intoString('kprv'), false, BigInt(accountIndex));

    let lastUsedReceiveIndex = -1;
    let lastUsedChangeIndex = -1;
    let receiveAddresses: string[] = [];
    let changeAddresses: string[] = [];
    let balanceFound = false;
    let emptyWindows = 0;

    // Scan addresses within multiple windows
    for (let i = 0; i < MAX_SCANS && !balanceFound; i += SCANNING_WINDOW) {
      console.log(`Scanning addresses for account #${accountIndex}, window: ${i} to ${i + SCANNING_WINDOW}`);

      const receivePubKeys = xpub.receivePubkeys(i, SCANNING_WINDOW);
      const changePubKeys = xpub.changePubkeys(i, SCANNING_WINDOW);

      const currentReceiveAddresses = receivePubKeys.map(key => createAddress(key, networkType).toString());
      const currentChangeAddresses = changePubKeys.map(key => createAddress(key, networkType).toString());

      receiveAddresses.push(...currentReceiveAddresses);
      changeAddresses.push(...currentChangeAddresses);

      if (i === 0 && currentReceiveAddresses.length > 0) {
        console.log(`Send KAS to this address: ${currentReceiveAddresses[0]}`);
      }

      const utxoContext = new kaspa.UtxoContext({ processor: utxoProcessor });

      if (currentReceiveAddresses.length > 0 || currentChangeAddresses.length > 0) {
        console.log(`Tracking addresses in UTXO context for window: ${i}`);
        try {
          await trackAddressesWithTimeout(utxoContext, [...currentReceiveAddresses, ...currentChangeAddresses], 30000);
        } catch (error) {
          console.error(`Error tracking addresses for account #${accountIndex}, window: ${i}`, error);
          break;
        }
      } else {
        console.warn(`Skipping empty address set for window: ${i}`);
      }

      console.log('Checking balances for tracked addresses...');
      const balance = await fetchBalanceFromUtxoContext(utxoContext);
      console.log(`Balance found: ${balance}`);

      if (balance > 0) {
        balanceFound = true;

        const matureUtxos = utxoContext.getMatureRange(0, SCANNING_WINDOW);
        lastUsedReceiveIndex = getLastUsedAddressIndex(matureUtxos, currentReceiveAddresses);
        lastUsedChangeIndex = getLastUsedAddressIndex(matureUtxos, currentChangeAddresses);

        console.log(`Balance found for account #${accountIndex}, stopping further scanning`);
        break;
      } else {
        emptyWindows++;
      }

      if (emptyWindows >= DISCOVERY_WINDOW_LIMIT) {
        console.log(`Reached discovery window limit of ${DISCOVERY_WINDOW_LIMIT} for account #${accountIndex}`);
        break;
      }

      if (i >= MAX_SCANS - SCANNING_WINDOW) {
        console.log(`Max scans reached for account #${accountIndex}, moving to next account`);
        break;
      }
    }

    if (balanceFound) {
      console.log(`Account #${accountIndex} has a balance, adding to accounts list`);
      accounts.push({
        name: `Account #${accountIndex + 1}`,
        address: receiveAddresses[0],
        receiveAddresses,
        changeAddresses,
        lastUsedReceiveIndex,
        lastUsedChangeIndex,
        balance: await fetchBalanceFromUtxoContext(new kaspa.UtxoContext({ processor: utxoProcessor })),
      });

      // Save accounts as they are scanned and update UI progressively
      chrome.runtime.sendMessage({ type: 'ACCOUNTS_UPDATED', accounts });
      await accountsStorage.saveAccounts(accounts);
    } else {
      console.log(`No balance found for account #${accountIndex}, moving to next account`);
    }
  }

  await utxoProcessor.stop();
  console.log('UTXO Processor stopped.');
  console.log('Accounts:', accounts);
  await accountsStorage.saveAccounts(accounts);
  return accounts;
}

async function fetchBalanceFromUtxoContext(utxoContext: InstanceType<typeof UtxoContext>): Promise<number> {
  console.log('Fetching balance from UTXO context...');
  const matureUtxos = utxoContext.getMatureRange(0, utxoContext.matureLength);
  let totalBalance = BigInt(0);
  matureUtxos.forEach(utxo => {
    totalBalance += utxo.amount;
  });
  console.log(`Total balance from UTXO context: ${fromSompi(totalBalance)}`);
  return fromSompi(totalBalance);
}

function getLastUsedAddressIndex(utxos: InstanceType<typeof UtxoEntryReference>[], addresses: string[]): number {
  let lastUsedIndex = -1;
  utxos.forEach(utxo => {
    const addressIndex = addresses.indexOf(utxo.address?.toString() || '');
    if (addressIndex > lastUsedIndex) {
      lastUsedIndex = addressIndex;
    }
  });
  return lastUsedIndex;
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function trackAddressesWithTimeout(utxoContext: InstanceType<typeof UtxoContext>, addresses: string[], timeoutMs: number = 60000) {
  return Promise.race([
    utxoContext.trackAddresses(addresses),
    timeout(timeoutMs).then(() => {
      throw new Error('Timeout tracking addresses');
    }),
  ]);
}

// Initialize Wasm and RPC client at startup
ensureRpcClientConnected()
  .then(() => {
    console.log('Wasm module and RPC client initialization complete.');
  })
  .catch(error => {
    console.error('Error during initialization:', error);
  });

const checkPasscodeExpiry = async () => {
  const passcodeData = await passcodeStorage.getPasscode();
  if (!passcodeData) {
    if (rpcClient && rpcClient.isConnected) {
      await rpcClient.disconnect();
    }
    console.log('Passcode has expired, RPC client disconnected.');
  } else {
    console.log('Passcode is still valid.');
  }
};

setInterval(checkPasscodeExpiry, 5 * 60 * 1000);