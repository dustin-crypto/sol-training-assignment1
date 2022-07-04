import { providers } from "ethers";

const mainnetRPC = "https://evm-cronos.crypto.org";
const mainnetProvider = new providers.JsonRpcProvider(mainnetRPC);

const testnetRPC = "https://cronos-testnet-3.crypto.org:8545";
const testnetProvider = new providers.JsonRpcProvider(testnetRPC);

export { mainnetProvider, testnetProvider };
