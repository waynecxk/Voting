import React, { useEffect, useState } from 'react';
import './App.css';

// Your contract's ABI (this should be generated when you deploy your contract)
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "partyNames",
        "type": "string[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "partyId",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getPartiesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "partyId",
        "type": "uint256"
      }
    ],
    "name": "getParty",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "parties",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "partyId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your contract's deployed address

function App () {
  const ethers = require("ethers")
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [partyId, setPartyId] = useState(0);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        try {
          // Request the user's Ethereum accounts
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const userAccount = accounts[0];
          console.log("Connected account:", userAccount);

          // Get the network
          const network = await window.ethereum.request({ method: 'eth_chainId' });
          console.log("Connected to network:", network);

          // Initialize provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Verify contract exists at the address
          const code = await provider.getCode(contractAddress);
          if (code === '0x') {
            throw new Error(`No contract found at address ${contractAddress}. Are you connected to the right network?`);
          }
          console.log("Contract verified at address:", contractAddress);
          
          setProvider(provider);
          
          // Get signer
          const signer = await provider.getSigner();
          setSigner(signer);
          
          // Initialize contract with signer
          const ethContract = new ethers.Contract(contractAddress, contractABI, signer);
          console.log("Contract initialized:", ethContract); // Debug log
          
          // Verify contract is accessible
          try {
            const count = await ethContract.getPartiesCount();
            console.log("Initial party count:", count);
            setContract(ethContract);
          } catch (error) {
            console.error("Error accessing contract:", error);
            throw new Error(`Contract verification failed. Please ensure you're connected to the correct network where the contract is deployed.`);
          }
          
        } catch (error) {
          console.error("Error connecting to blockchain:", error);
          alert(error.message);
        }
      } else {
        alert("Please install MetaMask.");
      }
    };
    
    loadBlockchainData();
  }, []);

  // Separate useEffect for fetching parties when contract is initialized
  useEffect(() => {
    if (contract) {
      fetchParties();
    }
  }, [contract]);

  useEffect(() => {
    if (contract && signer) {
      const checkIfVoted = async () => {
        try {
          const address = await signer.getAddress();
          const hasVoted = await contract.hasVoted(address);
          setUserHasVoted(hasVoted);
        } catch (error) {
          console.error("Error checking vote status:", error);
        }
      };
      checkIfVoted();
    }
  }, [contract, signer]);

  const fetchParties = async () => {
    try {
      if (!contract || !contract.getPartiesCount) {
        console.error("Contract not properly initialized");
        return;
      }

      console.log("Contract:", contract); // Debug log
      const partyCount = await contract.getPartiesCount();
      console.log("Party count:", partyCount); // Debug log
      
      const partyData = [];
      for (let i = 0; i < partyCount; i++) {
        const party = await contract.getParty(i);
        partyData.push({
          name: party.name,
          voteCount: party.voteCount
        });
      }
      
      setParties(partyData);
    } catch (error) {
      console.error("Error fetching parties:", error);
      alert("Error fetching parties: " + error.message);
    }
  };

  const handleVote = async () => {
    if (contract && partyId >= 0) {
      try {
        const tx = await contract.vote(partyId);
        await tx.wait();
        alert('Vote successfully cast!');
        setUserHasVoted(true); // Update user voting status after voting
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert('Error voting: ' + error.message);
      }
    }
  };

  return (
    <div className="App">
      <h1>Voting DApp</h1>
      <div>
        {userHasVoted ? (
          <p>You have already voted!</p>
        ) : (
          <>
            <h3>Choose a Party</h3>
            <select onChange={(e) => setPartyId(e.target.value)}>
              {parties.map((party, index) => (
                <option key={index} value={index}>
                  {party.name} - {party.voteCount} votes
                </option>
              ))}
            </select>
            <button onClick={handleVote}>Vote</button>
          </>
        )}
      </div>

      <div>
        <h3>Parties</h3>
        <ul>
          {parties.map((party, index) => (
            <li key={index}>
              {party.name}: {party.voteCount} votes
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;