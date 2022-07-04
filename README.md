# sol-training-assignment1

this README contains how to run the code and also answer the additional tasks

## Setup

```
yarn install
```

## Run subtask1

```
yarn subtask1
```

## Run subtask22

### uses multicall to verify the results

```
PRIVATE_KEY={privateKey} yarn subtask2
```

## Additional tasks

### Q1: If the API returns the temperature in a decimal form (like 27.5 C), how to submit this decimal number to the smart contract while keeping its precision?

```
Since Fixed Point Numbers are not fully supported in solidity yet,
we can save the temperature by multitply 10**decimals in the contract, where
decimals can be a self define number depends on our use case.
We may divide the returned temperature by 10**decimals when we query from contracts
```

### Q2: How to store a negative temperature while keeping the current smart contract interface unchanged?

```
Since the type for temperature in contract is uint32, we cannot store the exact value of a negative integer to it.
Instead, we could store the negative integer by adding 2**32-1 (the max number for uint32). For example, if we want
to store -32, we could store -32 + 2**32-1, which is 4,294,967,263. When retrieving the number, we could deduct with 2**32-1
to restore the actual negative number.
```

### Q3: During the "Step 3" in the task, it will take 3 JSON-RPC calls to read weather info for 3 cities from smart contract. Is it possbile to reduce that to only one request to get all the data back?

implemented in `src/subtask2.ts`, check out this file!
