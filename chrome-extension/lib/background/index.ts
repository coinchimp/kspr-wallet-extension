import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { passcodeStorage } from '@extension/storage';
import { accountsStorage } from '@extension/storage';
import * as kaspa from '../../public/kaspa/kaspa';
const { PublicKeyGenerator, PrivateKeyGenerator, createAddress, NetworkType, XPrv, Mnemonic, UtxoContext, UtxoEntryReference, Transaction, TransactionOutput,
        signTransaction, Address, payToAddressScript, encryptXChaCha20Poly1305, decryptXChaCha20Poly1305, calculateTransactionMass } = kaspa;

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

let rpcClient: any = null;
let wasmInitialized = false;
const SOMPI_MULTIPLIER = BigInt(100000000);

async function setupUtxoProcessorEventListeners(utxoProcessor: any, accountIndex: number) {
  utxoProcessor.addEventListener(async (event: any) => {
    switch (event.type) {
      case 'balance':
        console.log('balance event:', event.data)
        let accountsStore = await accountsStorage.getAccounts();
        if(accountsStore){
          accountsStore[accountIndex].utxoCount = event.data.balance.matureUtxoCount;
          accountsStore[accountIndex].balance = fromSompi(event.data.balance.mature);
        }
        await accountsStorage.saveAccounts(accountsStore);
        chrome.runtime.sendMessage({ type: 'ACCOUNTS_UPDATED', accounts: accountsStore });
        break;

      case 'daa-score-change':
        break;

      default:
        console.log('Unknown event:', event);
    }
  });
}

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
        resolver: new kaspa.Resolver(),
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
      resolver: new kaspa.Resolver(),
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
      } else if (message.type === 'LOCK') {
        await lock()
        sendResponse({ lock: true });
      } else if (message.type === 'SEND') {
        const accounts = await accountsStorage.getAccounts();
        const passcodeData = await passcodeStorage.getPasscode();
        const res = await transferKAS(accounts[0].address, "kaspatest:qr0gskdc3nekflse693ukz0ckg6mqzz9nql2htvl08rw2qu0epl8s2lptp06k", 5, 1, decryptXChaCha20Poly1305(accounts[0].privateKey, passcodeData))
        console.log(res);
        sendResponse(res);
      }else {
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
  const privateKeyGen = new PrivateKeyGenerator(xPrv.intoString('kprv'), false, BigInt(0));
  const accounts = [];
  const SCANNING_WINDOW = 64;
  const MAX_SCANS = 256;
  const DISCOVERY_WINDOW_LIMIT = 4;

  const utxoProcessor = new kaspa.UtxoProcessor({
    networkId: 'testnet-10',
    rpc: rpcClient
  });

  console.log('Starting UTXO Processor...');
  await utxoProcessor.start();

  for (let accountIndex = 0; accountIndex < numAccounts; accountIndex++) {
    console.log(`Processing account #${accountIndex}...`);
    const xpub = PublicKeyGenerator.fromMasterXPrv(xPrv.intoString('kprv'), false, BigInt(accountIndex));
    const passcodeData = await passcodeStorage.getPasscode();
    const privateKey = encryptXChaCha20Poly1305(privateKeyGen.receiveKey(accountIndex).toString(), passcodeData)

    let lastUsedReceiveIndex = -1;
    let lastUsedChangeIndex = -1;
    let receiveAddresses: string[] = [];
    let changeAddresses: string[] = [];
    let balanceFound = false;
    let emptyWindows = 0;

    // Scan addresses within multiple windows
    for (let i = 0; i < MAX_SCANS && !balanceFound; i += SCANNING_WINDOW) {

      const receivePubKeys = xpub.receivePubkeys(i, SCANNING_WINDOW);
      const changePubKeys = xpub.changePubkeys(i, SCANNING_WINDOW);

      const currentReceiveAddresses = receivePubKeys.map(key => createAddress(key, networkType).toString());
      const currentChangeAddresses = changePubKeys.map(key => createAddress(key, networkType).toString());

      receiveAddresses.push(...currentReceiveAddresses);
      changeAddresses.push(...currentChangeAddresses);

      const utxoContext = new kaspa.UtxoContext({ processor: utxoProcessor });

      if (currentReceiveAddresses.length > 0 || currentChangeAddresses.length > 0) {
        try {
          await trackAddressesWithTimeout(utxoContext, [...currentReceiveAddresses, ...currentChangeAddresses], 30000);
        } catch (error) {
          console.error(`Error tracking addresses for account #${accountIndex}, window: ${i}`, error);
          break;
        }
      }

      const balance = await fetchBalanceFromUtxoContext(utxoContext);

      if (balance > 0) {
        balanceFound = true;

        const matureUtxos = utxoContext.getMatureRange(0, 1000);
        lastUsedReceiveIndex = getLastUsedAddressIndex(matureUtxos, currentReceiveAddresses);
        lastUsedChangeIndex = getLastUsedAddressIndex(matureUtxos, currentChangeAddresses);

        console.log(`Balance found for account #${accountIndex}, stopping further scanning and setting up an utxoProcessor.`);
        const utxoProcessorForAccount = new kaspa.UtxoProcessor({
          networkId: 'testnet-10',
          rpc: rpcClient
        });
        await utxoProcessorForAccount.start()
        await setupUtxoProcessorEventListeners(utxoProcessorForAccount, accountIndex);
        const utxoContextForAccount = new kaspa.UtxoContext({ processor: utxoProcessorForAccount });
        await trackAddressesWithTimeout(utxoContextForAccount, [...currentReceiveAddresses, ...currentChangeAddresses], 30000);
        accounts.push({
          name: `Account #${accountIndex + 1}`,
          address: receiveAddresses[0],
          privateKey: privateKey,
          balance: balance,
          utxoCount: matureUtxos.length,
          receiveAddresses,
          changeAddresses,
          lastUsedReceiveIndex,
          lastUsedChangeIndex,
        });

        await accountsStorage.saveAccounts(accounts);
        chrome.runtime.sendMessage({ type: 'ACCOUNTS_UPDATED', accounts });
        
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

    if (!balanceFound) {
      console.log(`No balance found for account #${accountIndex}, moving to next account`);
      if (accountIndex === 0){
        const utxoProcessorForAccount = new kaspa.UtxoProcessor({
          networkId: 'testnet-10',
          rpc: rpcClient
        });
        await utxoProcessorForAccount.start()
        await setupUtxoProcessorEventListeners(utxoProcessorForAccount, accountIndex);
        const utxoContextForAccount = new kaspa.UtxoContext({ processor: utxoProcessorForAccount });
        await trackAddressesWithTimeout(utxoContextForAccount, [...receiveAddresses, ...changeAddresses], 30000);
        accounts.push({
          name: `Account #${accountIndex + 1}`,
          address: receiveAddresses[0],
          privateKey: privateKey,
          balance: 0,
          utxoCount: 0,
          receiveAddresses,
          changeAddresses,
          lastUsedReceiveIndex,
          lastUsedChangeIndex,
        }); 

        await accountsStorage.saveAccounts(accounts);
        chrome.runtime.sendMessage({ type: 'ACCOUNTS_UPDATED', accounts: accounts });
      }
    }
  }

  await utxoProcessor.stop();
  console.log('UTXO Processor for scanning is now stopped.');
  if(accounts.length > 0){
    console.log('Accounts:', accounts);
    await accountsStorage.saveAccounts(accounts);
    chrome.runtime.sendMessage({ type: 'ACCOUNTS_UPDATED', accounts });
  }
  return accounts;
}

async function fetchBalanceFromUtxoContext(utxoContext: InstanceType<typeof UtxoContext>): Promise<number> {
  const matureUtxos = utxoContext.getMatureRange(0, utxoContext.matureLength);
  let totalBalance = BigInt(0);
  matureUtxos.forEach(utxo => {
    totalBalance += utxo.amount;
  });
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
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function trackAddressesWithTimeout(
  utxoContext: InstanceType<typeof UtxoContext>,
  addresses: string[],
  timeoutMs: number = 60000,
) {
  return Promise.race([
    utxoContext.trackAddresses(addresses),
    timeout(timeoutMs).then(() => {
      throw new Error('Timeout tracking addresses');
    }),
  ]);
}

async function transferKAS(fromAddress: string, toAddress: string, amount: number, feeRate: number, privateKey: string) {
  try {
    await ensureRpcClientConnected();

    const amountSompi = toSompi(amount);
    const utxos = (await rpcClient.getUtxosByAddresses([fromAddress])).entries.map((entry: { entry: kaspa.UtxoEntryReference }) => entry.entry);
    if (!utxos.length) throw new Error('No UTXOs available to spend.');

    const { inputs, totalInputValue, utxoEntries } = await selectUtxos(utxos, amountSompi);

    const recipientScriptPublicKey = payToAddressScript(new Address(toAddress));
    const fromScriptPublicKey = payToAddressScript(new Address(fromAddress));
    
    const outputs = [new TransactionOutput(amountSompi, recipientScriptPublicKey)];
    const feeSompiEstimate = BigInt(Math.round(2000 * feeRate));
    const totalAmountEstimate = amountSompi + feeSompiEstimate;

    if (totalInputValue < totalAmountEstimate) throw new Error('Insufficient funds for the transaction.');

    const changeSompiEstimate = totalInputValue - totalAmountEstimate;
    const outputsForMassCalculation = [...outputs, ...(changeSompiEstimate > BigInt(0) ? [new TransactionOutput(changeSompiEstimate, fromScriptPublicKey)] : [])];

    // Create unsigned transaction with mandatory fields
    const unsignedTx: kaspa.ITransaction = {
      version: 0,
      inputs,
      outputs: outputsForMassCalculation,
      lockTime: BigInt(0),
      subnetworkId: "0000000000000000000000000000000000000000",
      gas: BigInt(0),
      payload: ''
    };

    const mass = calculateMass(unsignedTx);
    const feeSompi = BigInt(Math.round(mass * feeRate));
    const totalAmountSompi = amountSompi + feeSompi;

    if (totalInputValue < totalAmountSompi) throw new Error('Insufficient funds for the transaction.');

    const changeSompi = totalInputValue - totalAmountSompi;
    if (changeSompi > BigInt(0)) outputs.push(new TransactionOutput(changeSompi, fromScriptPublicKey));

    // Check if UTXOs are being used in the mempool
    const mempoolEntriesResponse: kaspa.IGetMempoolEntriesByAddressesResponse = await rpcClient.getMempoolEntriesByAddresses({
      addresses: [fromAddress], includeOrphanPool: true, filterTransactionPool: false
    });
    const mempoolEntries = mempoolEntriesResponse.entries;

    // Extract previous outpoints from valid mempool transactions
    const utxosInMempool = mempoolEntries
      .filter((entry: kaspa.IMempoolEntry) => entry.transaction && entry.transaction.inputs)
      .map((entry: kaspa.IMempoolEntry) => entry.transaction.inputs.map((input: any) => input.previousOutpoint))
      .flat();

    const shouldReplace = inputs.some(input => utxosInMempool.includes(input.previousOutpoint));

    const transaction = new Transaction({
      version: 0,
      inputs,
      outputs,
      lockTime: BigInt(0),
      subnetworkId: "0000000000000000000000000000000000000000",
      gas: BigInt(0),
      payload: ''
    });

    const signedTx = signTransaction(transaction, [privateKey], false);
    
    let txId;
    if (shouldReplace) {
      // Submit transaction as a replacement
      const res = await rpcClient.submitTransactionReplacement(signedTx);
      txId = res.transactionId;
      console.log(`Replacement transaction submitted, txId: ${txId}`);
    } else {
      // Submit the transaction normally
      txId = await rpcClient.submitTransaction(signedTx);
      console.log(`Transaction successfully sent, txId: ${txId}`);
    }

    return { success: true, txId };

  } catch (error) {
    console.error('Error transferring KAS:', error);
    return { success: false, error };
  }
}


// Helper function to select UTXOs based on the Rust logic
async function selectUtxos(utxos: kaspa.UtxoEntryReference[], amountSompi: bigint, maxUtxos: number = 80) {
  utxos.sort((a, b) => Number(b.amount - a.amount));

  let inputs: kaspa.ITransactionInput[] = [];
  let utxoEntries: kaspa.UtxoEntryReference[] = [];
  let totalInputValue = BigInt(0);

  if (utxos.length > 1) {
    const largestUtxo = utxos[0];
    const smallestUtxo = utxos[utxos.length - 1];
    const combinedAmount = largestUtxo.amount + smallestUtxo.amount;

    if (combinedAmount >= amountSompi) {
      inputs.push(createTransactionInput(largestUtxo, BigInt(0)));
      utxoEntries.push(largestUtxo);
      totalInputValue += largestUtxo.amount;

      inputs.push(createTransactionInput(smallestUtxo, BigInt(1)));
      utxoEntries.push(smallestUtxo);
      totalInputValue += smallestUtxo.amount;
      
      return { inputs, totalInputValue, utxoEntries };
    }
  }

  for (let i = 0; i < utxos.length && inputs.length < maxUtxos; i++) {
    if (inputs.length >= maxUtxos) {
      throw new Error('Too many UTXOs, please compound or send a lower amount');
    }

    const utxo = utxos[i];

    inputs.push(createTransactionInput(utxo, BigInt(i)));
    utxoEntries.push(utxo);
    totalInputValue += utxo.amount;

    if (totalInputValue >= amountSompi) break;
  }

  if (totalInputValue < amountSompi) {
    throw new Error('Insufficient funds to send transaction');
  }

  return { inputs, totalInputValue, utxoEntries };
}

// Helper function to create transaction input from UTXO
function createTransactionInput(utxo: kaspa.UtxoEntryReference, sequence: bigint): kaspa.ITransactionInput {
  return {
    previousOutpoint: utxo.outpoint,
    sequence,
    sigOpCount: 1,
    utxo,
  };
}

// Helper function to calculate the mass of the transaction
function calculateMass(tx: kaspa.ITransaction): number {
  const mass = Number(calculateTransactionMass('testnet-10', tx, 1));
  if (mass > 100000) throw new Error(`Transaction mass (${mass}) exceeds the maximum allowed limit of 100,000.`);
  return mass;
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
    await accountsStorage.clearAccounts();
    if (rpcClient && rpcClient.isConnected) {
      await rpcClient.disconnect();
    }
    console.log('Passcode has expired, RPC client disconnected.');
  } else {
    console.log('Passcode is still valid.');
  }
};

setInterval(checkPasscodeExpiry, 5 * 60 * 1000);

async function lock() {
  await passcodeStorage.clearPasscode();
  await accountsStorage.clearAccounts();
  if (rpcClient && rpcClient.isConnected) {
    await rpcClient.disconnect();
  }  
}
