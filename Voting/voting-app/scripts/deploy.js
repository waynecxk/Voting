async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get the contract factory for the Voting contract
    const Voting = await ethers.getContractFactory("Voting");

    // List of party names to pass as a constructor argument
    const partyNames = ["Party A", "Party B", "Party C"];

    // Deploy the Voting contract, passing partyNames as the constructor argument
    const voting = await Voting.deploy(partyNames);

    await voting.waitForDeployment();

    console.log("Voting contract deployed to:", voting.address);

    // const Voting = await ethers.getContractFactory("Voting");
    // const deployedContract = await ethers.deployContract("Voting", ["Party A", "Party B", "Party C"]);
    // console.log("Voting contract deployed to:", deployedContract.address);
    // const partyNames = ["Party A", "Party B", "Party C"]; // List your parties here
    // const voting = await Voting.deploy(partyNames);
    // console.log("Voting contract deployed to:", deployedContract.address);
}

// Run npx hardhat node in your terminal. Leave the process running. 
// "npx hardhat node" starts a local Ethereum network with 20 accounts, each with 10000 ETH. You can use these accounts to deploy and interact with your smart contracts.
// Open a new terminal window.
// Run npx hardhat run [script-name] --network localhost

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
