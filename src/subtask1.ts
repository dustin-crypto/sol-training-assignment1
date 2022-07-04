import { Contract, BigNumber } from "ethers";
import { mainnetProvider } from "./provider";
import BTCUSDOracleABI from "./abis/BTCUSDOracle.json";

const contractAddr = "0xb3DF0a9582361db08EC100bd5d8CB70fa8579f4B";
const oracle: Contract = new Contract(
  contractAddr,
  BTCUSDOracleABI,
  mainnetProvider
);

const main = async () => {
  const decimal: number = await oracle.decimals();
  const rawPrice: BigNumber = await oracle.latestAnswer();
  console.log(
    "latest BTCUSD price feed:",
    rawPrice.div(BigNumber.from(10).pow(decimal)).toString()
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
