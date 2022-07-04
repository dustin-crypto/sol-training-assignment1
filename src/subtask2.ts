import axios from "axios";
import assert from "assert";
import { Contract, Wallet, Signer, utils } from "ethers";
import { testnetProvider } from "./provider";
import WeatherRecordABI from "./abis/WeatherRecord.json";
import MulticallABI from "./abis/Multicall.json";

const privateKey = process.env.PRIVATE_KEY;

// off-chain weather api
const cities = ["shanghai", "london", "hongkong"];
const returnURL = (cityName: string): string => {
  return `https://goweather.herokuapp.com/weather/${cityName}`;
};

const weatherAddr = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E";
const weatherContract: Contract = new Contract(
  weatherAddr,
  WeatherRecordABI,
  testnetProvider
);

// Apply multicall
interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (example: balanceOf)
  params?: any[]; // Function params
}

const multicall = async <T = any>(
  calls: Call[],
  requireSuccess = true,
  signer: Signer
): Promise<T> => {
  try {
    const multicallAddr = "0x3bd51a07d83305CcDB66678b0aAdEf4BC61c601e";
    const multicallContract: Contract = new Contract(
      multicallAddr,
      MulticallABI,
      testnetProvider
    );
    const iface = new utils.Interface(WeatherRecordABI);

    const calldata = calls.map((call) => {
      return {
        target: call.address.toLowerCase(),
        callData: iface.encodeFunctionData(call.name, call.params),
      };
    });
    const returnData = await multicallContract
      .connect(signer)
      .callStatic.tryAggregate(requireSuccess, calldata);
    const res = returnData.map((call: any, i: number) => {
      const [result, data] = call;
      return result ? iface.decodeFunctionResult(calls[i].name, data) : null;
    });

    return res;
  } catch (e: any) {
    throw new Error(e);
  }
};

const main = async () => {
  const now = Math.floor(Date.now() / 1000);

  if (!privateKey) {
    throw new Error("missing private key in env");
  }
  const signer = new Wallet(privateKey, testnetProvider);

  let storeTemp: Record<string, number> = {};
  for (let city of cities) {
    const { data } = await axios.get(returnURL(city));
    let parsedTemperature = data.temperature.replace(/\D+/g, "");
    storeTemp = { ...storeTemp, [city as string]: parsedTemperature };

    const cityArg = utils.formatBytes32String(city);
    console.log(
      `Sending Tx => batchId: ${now}, city: ${city}, degree: ${parsedTemperature}`
    );
    const tx = await weatherContract
      .connect(signer)
      .reportWeather(now, cityArg, parsedTemperature);
    await tx.wait();
    console.log(
      `Confirmed Tx => batchId: ${now}, city: ${city}, degree: ${parsedTemperature}`
    );

    // use multiple single call to confirm the temperature of each country
    /*
    const getTemperature = await weatherContract.getWeather(now, cityArg);
    assert.equal(getTemperature, parsedTemperature);
    */
  }

  // multicall
  const data = cities.map((city) => {
    return {
      address: weatherAddr,
      name: "getWeather",
      params: [now, utils.formatBytes32String(city)],
    };
  });
  const returnData = await multicall(data, true, signer);

  cities.forEach((city, index) => {
    assert.equal(storeTemp[city], returnData[index][0]);
  });
  console.log("all temperature asserted!");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
