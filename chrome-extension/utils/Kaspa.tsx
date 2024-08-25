import * as kaspa from '../public/kaspa/kaspa';

export let rpcClient: any;
let wasmInitialized = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NETWORK_UPDATED') {
    const kaspaApiUrl = message.kaspaApiUrl;
    updateRpcClient(kaspaApiUrl);
  }
});

async function initWasmModule() {
  if (!wasmInitialized) {
    try {
      await kaspa.default('/kaspa/kaspa_bg.wasm');
      wasmInitialized = true;
      console.log('Wasm initialized');
    } catch (error) {
      console.error('Error initializing Wasm module:', error);
      throw error;
    }
  }
}

async function updateRpcClient(kaspaApiUrl: string) {
  try {
    await initWasmModule(); // Ensure the Wasm module is initialized
    if (rpcClient && rpcClient.isConnected) {
      await rpcClient.disconnect();
    }
    const RpcClient = kaspa.RpcClient;
    rpcClient = new RpcClient({
      resolver: new kaspa.Resolver(),
      // url: kaspaApiUrl,
      networkId: 'testnet-10',
    });
    await rpcClient.connect();
    console.log('Connected new RPC client');
  } catch (error) {
    console.error('Error updating RPC client:', error);
    throw error;
  }
}

export async function fetchBalance(address: string): Promise<number> {
  try {
    const balanceResponse = await rpcClient.getBalanceByAddress({ address });
    const balance = Number(balanceResponse.balance) * Math.pow(10, -8); // Convert BigInt to Number and format the balance
    return balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching balance: ${error.message}`);
    } else {
      throw new Error('Unknown error fetching balance');
    }
  }
}

export async function initKaspa() {
  try {
    await initWasmModule(); // Ensure the Wasm module is initialized
    const kaspaApiUrl = 'ws://57.129.49.28:17210'; // Testnet RPC URL
    await updateRpcClient(kaspaApiUrl);
    console.log('Initialized RPC client during initKaspa');
  } catch (error) {
    console.error('Error initializing Kaspa:', error);
    throw error;
  }
}

export { kaspa };
