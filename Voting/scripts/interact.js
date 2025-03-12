// scripts/interact.js
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with the contract using account:", deployer.address);

    const Voting = await ethers.getContractFactory("Voting" );
   const voting = await Voting.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3"); // Replace with actual contract address

    // Get the list of party names
    const parties = await voting.getPartiesCount();
    console.log("Parties:", parties);

    // Vote for a party
    const voteTx = await voting.vote(0);    // Replace with the party index you want to vote for
    await voteTx.wait();    // Wait for the transaction to be mined         
    console.log("Voted for party 0");
    

    // Get the updated list of party names
    const updatedParties = await voting.getParty(0);    // Replace with the party index you voted for
    console.log("Updated Parties:", updatedParties);            



    // Check if the user has voted
    const hasVoted = await voting.hasVoted(deployer.address);   // Replace with the address you want to check   
    console.log("User has voted:", hasVoted);   

       // Vote for a party
       const voteTx1 = await voting.vote(0);    // Replace with the party index you want to vote for
       await voteTx1.wait();    // Wait for the transaction to be mined         
       console.log("Voted for party 0");
       
   
       // Get the updated list of party names
       const updatedParties1 = await voting.getParty(0);    // Replace with the party index you voted for
       console.log("Updated Parties:", updatedParties);    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
