import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { passcodeStorage } from '@extension/storage';
import { accountsStorage } from '@extension/storage';
import * as kaspa from '../../public/kaspa/kaspa';
const { PublicKeyGenerator, createAddress, NetworkType, XPrv, Mnemonic } = kaspa;

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

let rpcClient: any = null;
let wasmInitialized = false;
const SOMPI_MULTIPLIER = BigInt(100000000);
// GEO Balancing not working well for now
// const testnetRpcUrls = ["https://1.rpc-kspr.org", "https://2.rpc-kspr.org", "https://3.rpc-kspr.org"];
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
      throw error; // Ensure we propagate the error to stop further execution if Wasm fails
    }
  }
}

async function ensureRpcClientConnected() {
  try {
    if (!rpcClient || !rpcClient.isConnected) {
      console.log('RPC client not connected, initializing...');
      await ensureWasmModuleInitialized(); // Ensure Wasm is initialized

      rpcClient = new kaspa.RpcClient({
        resolver: new kaspa.Resolver({
          urls: testnetRpcUrls,
          tls: true,
        }),
        networkId: 'testnet-10',
      });

      // Attempt to connect to the RPC client
      console.log('Attempting to connect to RPC client with URLs:', testnetRpcUrls);
      await rpcClient.connect();
      console.log('RPC client connected on: testnet-10');
    } else {
      console.log('RPC client already connected.');
    }
  } catch (error) {
    console.error('Error during RPC client connection:', error);
    return { connected: false, error: 'RPC connection failed' }; // Return a meaningful error
  }
  return { connected: true }; // Return success if connected
}

async function updateRpcClient(networkId: string) {
  try {
    if (rpcClient && rpcClient.isConnected) {
      console.log(`Disconnecting existing RPC client on network ${networkId}`);
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

    console.log('Attempting to connect to RPC client with network:', networkId);
    await rpcClient.connect();
    console.log('RPC client connected on:', networkId);
  } catch (error) {
    console.error('Error connecting RPC client on:', networkId, error);
    throw error; // Propagate error to caller
  }
}

// Background message handler for extension-wide access
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    console.log('Message received:', message.type);
    try {
      await ensureRpcClientConnected(); // Ensure the RPC client is connected

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

  return true; // Ensure the sendResponse callback remains open for async responses
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

async function getAndStoreAccounts(seed: string) {
  try {
    const networkType = NetworkType.Testnet;
    const mnemonic = new Mnemonic(seed);
    const xPrv = new XPrv(mnemonic.toSeed());
    const xpub = PublicKeyGenerator.fromMasterXPrv(xPrv.intoString('kprv'), false, BigInt(0));
    const compressedPublicKeys = xpub.receivePubkeys(0, 10);
    const addresses = compressedPublicKeys.map(key => createAddress(key, networkType).toString());
    const accounts = compressedPublicKeys.map((key, index) => ({
      name: `Account #${index + 1}`,
      address: addresses[index],
    }));
    await accountsStorage.saveAccounts(accounts);
    return accounts;
  } catch (error) {
    console.error('Error creating accounts:', error);
    throw error;
  }
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
