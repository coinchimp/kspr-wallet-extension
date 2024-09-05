import * as kaspa from '../public/kaspa/kaspa';
const { PublicKeyGenerator, createAddress, NetworkType, XPrv, PrivateKeyGenerator, Mnemonic } = kaspa;

// Constants for conversion
const SOMPI_MULTIPLIER = BigInt(100000000); // 10^8 as a BigInt for precision

export let rpcClient: any;
let wasmInitialized = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NETWORK_UPDATED') {
    const kaspaNetwork = message.kaspaNetwork;
    updateRpcClient(kaspaNetwork);
  }
});

async function initWasmModule() {
  if (!wasmInitialized) {
    try {
      // Fetch and compile the WebAssembly module
      const wasmModule = await fetch('/kaspa/kaspa_bg.wasm')
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.compile(bytes));

      // Initialize the Wasm module with an object containing the module
      await kaspa.default({
        module_or_path: wasmModule,
        // Optionally, include imports or other initialization options if needed
        imports: {},
      });

      wasmInitialized = true;
      console.log('Wasm initialized');
    } catch (error) {
      console.error('Error initializing Wasm module:', error);
      throw error;
    }
  }
}

// New function to ensure Wasm module is initialized
async function ensureWasmModuleInitialized() {
  if (!wasmInitialized) {
    await initWasmModule();
  }
}

async function updateRpcClient(kaspaNetwork: string) {
  try {
    await ensureWasmModuleInitialized(); // Ensure the Wasm module is initialized
    if (rpcClient && rpcClient.isConnected) {
      await rpcClient.disconnect();
    }
    const RpcClient = kaspa.RpcClient;
    rpcClient = new RpcClient({
      resolver: new kaspa.Resolver({ urls : ["https://1.rpc-kspr.org", "https://2.rpc-kspr.org", "https://3.rpc-kspr.org"], tls : true}),
      networkId: kaspaNetwork,
    });
    await rpcClient.connect();
    console.log('Connected new RPC client');
  } catch (error) {
    console.error('Error updating RPC client:', error);
    throw error;
  }
}

export async function fetchBalance(address: string): Promise<number> {
  await ensureRpcClientConnected();
  try {
    const balanceResponse = await rpcClient.getBalanceByAddress({ address });
    return fromSompi(balanceResponse.balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching balance: ${error.message}`);
    } else {
      throw new Error('Unknown error fetching balance');
    }
  }
}

// Ensure RPC client is connected
export async function ensureRpcClientConnected() {
  if (!rpcClient || !rpcClient.isConnected) {
    console.log('RPC client not connected, initializing Kaspa...');
    await initKaspa();
  }
}

// Updated Generate a 24-word mnemonic to ensure Wasm is initialized
export async function generateMnemonic(): Promise<string> {
  await ensureWasmModuleInitialized(); // Ensure the Wasm module is initialized before generating a mnemonic
  const mnemonic = Mnemonic.random(24);
  return mnemonic.phrase;
}

// Convert value to Sompi
export function toSompi(value: number | string | bigint): bigint {
  return BigInt(Math.round(Number(value) * Number(SOMPI_MULTIPLIER)));
}

// Convert value from Sompi to Kaspa
export function fromSompi(value: number | string | bigint): number {
  return Number(BigInt(value) / SOMPI_MULTIPLIER);
}

export async function initKaspa() {
  try {
    await ensureWasmModuleInitialized(); // Ensure the Wasm module is initialized
    const kaspaNetwork = 'testnet-10'; // Network can be changed by user later
    await updateRpcClient(kaspaNetwork);
    console.log('Initialized RPC client during initKaspa');
  } catch (error) {
    console.error('Error initializing Kaspa:', error);
    throw error;
  }
}

// Function to create accounts from a seed
export async function createAccounts(seed: string) {
  try {
    await ensureWasmModuleInitialized();
    // Mocked session data for network type
    const networkType = NetworkType.Testnet;

    // Initialize the Mnemonic object using the seed
    const mnemonic = new Mnemonic(seed);

    // Generate the extended private key (XPrv) from the mnemonic
    const xPrv = new XPrv(mnemonic.toSeed());

    // Generate the extended public key (xpub)
    const xpub = PublicKeyGenerator.fromMasterXPrv(xPrv.intoString('kprv'), false, BigInt(0));

    // Generate public keys and corresponding addresses
    const compressedPublicKeys = xpub.receivePubkeys(0, 25);
    const addresses = compressedPublicKeys.map(key => createAddress(key, networkType).toString());

    // Initialize the private key generator
    // const privateKeyGenerator = new PrivateKeyGenerator(xPrv, false, BigInt(0));

    // Return the account information
    return compressedPublicKeys.map((key, index) => ({
      name: `Account #${index + 1}`,
      address: addresses[index],
      // privateKey: privateKeyGenerator.receiveKey(index).toString(),
    }));
  } catch (error) {
    console.error('Error creating accounts:', error);
    throw error;
  }
}

export { kaspa };
