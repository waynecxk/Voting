async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Retrieves the contract factory for the Voting contract
    const Voting = await ethers.getContractFactory("Voting");

    // List of party names to pass as a constructor argument
    const partyNames = ["Party A", "Party B", "Party C"];

    // Deploy the Voting contract with party names
    const voting = await Voting.deploy(partyNames);

    await voting.waitForDeployment();

    console.log("MyContract deployed to:", voting); // <--- This line is crucial! It logs the contract address

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
