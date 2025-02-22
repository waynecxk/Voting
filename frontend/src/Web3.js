import React, { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";

// Define the ABI and Contract address here (make sure to replace the contract address and ABI)
const contractAddress = "YOUR_CONTRACT_ADDRESS";  // Replace with your deployed contract address
const abi = [
  // Replace with your contract's ABI (Application Binary Interface)
  {
    "constant": true,
    "inputs": [],
    "name": "getPartiesCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "partyId",
        "type": "uint256"
      }
    ],
    "name": "getParty",
    "outputs": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "partyNames",
        "type": "string[]"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "name": "partyId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState(null);

  // Load Web3 and Ethereum account
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      window.ethereum.request({ method: "eth_requestAccounts" }).then(accounts => {
        setAccount(accounts[0]);
      });

      const contractInstance = new web3Instance.eth.Contract(abi, contractAddress);
      setContract(contractInstance);

      loadParties(contractInstance);
    } else {
      alert("Please install MetaMask!");
    }
  }, []);

  // Load parties from the contract
  const loadParties = async (contract) => {
    const partiesCount = await contract.methods.getPartiesCount().call();
    const partyList = [];
    for (let i = 0; i < partiesCount; i++) {
      const party = await contract.methods.getParty(i).call();
      partyList.push({
        name: party[0],
        voteCount: party[1]
      });
    }
    setParties(partyList);
  };

  // Handle party selection
  const selectParty = (partyId) => {
    setSelectedPartyId(partyId);
    alert(`You selected party: ${partyId}`);
  };

  // Handle vote submission
  const vote = async () => {
    if (selectedPartyId === null) {
      alert("Please select a party first!");
      return;
    }

    try {
      await contract.methods.vote(selectedPartyId).send({ from: account });
      alert("Your vote has been cast!");
      loadParties(contract);
    } catch (error) {
      console.error(error);
      alert("Error voting, make sure you haven't already voted.");
    }
  };

  return (
    <div className="App">
      <h1>Decentralized Voting DApp</h1>

      <p>Connect your Ethereum wallet and cast your vote!</p>

      <div>
        <h2>Parties:</h2>
        <div>
          {parties.map((party, index) => (
            <div key={index}>
              <button onClick={() => selectParty(index)}>
                {party.name} - Votes: {party.voteCount}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={vote}>Vote</button>

      <div>
        <h3>Selected Party ID: {selectedPartyId}</h3>
      </div>

      <div>
        <p>Account: {account}</p>
      </div>
    </div>
  );
}

export default App;
