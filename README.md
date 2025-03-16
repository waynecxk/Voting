# Getting Started 

Contributors:
**Sebestian Siew
Wayne Chua **

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
RedHat
Ethers

## Folder explain
Artifact --> Generated after compilation of contract
Cache --> Storage of data to speed up execution
Contract --> Core of solidity framework, smart contracts goes here
Node_module --> Library and dependencies
Public --> 
Scripts --> Deployment scripts or interaction scripts
Src --> FrontEnd scripts
Tasks --> 
Test --> Test script

## Available Scripts

In the project directory, you can run:

### `npx hardhat compile`

Used in Hardhat development environment for Ethereum smart contract development.
Purpose: 
    Compiles your Solidity smart contracts
    Generates ABI (Application Binary Interface) files

Expected output: Compiled 1 Solidity file successfully



### `npx hardhat node`

Starts a local Ethereum blockchain node using Hardhat
Generates a default account of prefilled ether for tranction
Listen for RPC request (Remote Procedure Call)

Expected output:  Started HTTP and WebSocket JSON-RPC server

### PRE-REQUISITE: a metamask account is REQUIRED beyond this step! 


### `npx hardhat run ./scripts/deploy.js --network localhost`

Deploy smart contract to your local hardhat network
Usually in deploy.js, the logic are as such:
    - Retrieving contract factories (using ethers.getContractFactory()).
    - Deploying the contracts (using contractFactory.deploy()).
    - Waiting for the deployment to complete (using contract.deployed()).

Expected output: Deploying contracts with the account: ...

### manual edit line 131 in App.js to replace contractAddress using target address in console

Then execute `npm start`

Expected output: Starting the development server...

