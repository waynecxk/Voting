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

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Color scheme for parties
const partyColors = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEEAD', // Cream Yellow
  '#D4A5A5', // Dusty Rose
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#2ECC71'  // Green
];

function App() {
  const ethers = require("ethers")
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [partyToVote, setPartyToVote] = useState(null);

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
          console.log("Contract initialized:", ethContract);
          
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

      console.log("Contract:", contract);
      const partyCount = await contract.getPartiesCount();
      console.log("Party count:", partyCount);
      
      const partyData = [];
      let total = 0;
      for (let i = 0; i < partyCount; i++) {
        const party = await contract.getParty(i);
        partyData.push({
          id: i,
          name: party.name,
          voteCount: party.voteCount
        });
        total += Number(party.voteCount);
      }
      
      setParties(partyData);
      setTotalVotes(total);
    } catch (error) {
      console.error("Error fetching parties:", error);
      alert("Error fetching parties: " + error.message);
    }
  };

  const handleVoteClick = (partyId) => {
    setPartyToVote(partyId);
    setShowModal(true);
  };

  const handleConfirmVote = async () => {
    if (contract && partyToVote >= 0) {
      try {
        const tx = await contract.vote(partyToVote);
        await tx.wait();
        alert('Vote successfully cast!');
        setUserHasVoted(true);
        fetchParties(); // Refresh the party data
      } catch (error) {
        console.error(error);
        alert('Error voting: ' + error.message);
      }
    }
    setShowModal(false);
    setPartyToVote(null);
  };

  const handleCancelVote = () => {
    setShowModal(false);
    setPartyToVote(null);
  };

  const getPartyColor = (partyId) => {
    return partyColors[partyId % partyColors.length];
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Voting DApp</h1>
        <div className="vote-counter">
          <p>Total Votes Cast: {totalVotes}</p>
        </div>
        <div className="bar-chart">
          {parties.map((party) => (
            <div key={party.id} className="bar-container">
              <div className="bar-label">
                <span className="color-dot" style={{ backgroundColor: getPartyColor(party.id) }}></span>
                {party.name}
              </div>
              <div className="bar-wrapper">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: totalVotes > 0 ? `${(Number(party.voteCount) / Number(totalVotes)) * 100}%` : '0%',
                    backgroundColor: getPartyColor(party.id)
                  }}
                >
                  <span className="bar-value">{party.voteCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </header>
      <main>
        {!userHasVoted ? (
          <div className="voting-section">
            <h2>Select a Party to Vote For:</h2>
            <div className="party-buttons">
              {parties.map((party) => (
                <button
                  key={party.id}
                  className={`party-button ${selectedParty === party.id ? 'selected' : ''}`}
                  onClick={() => handleVoteClick(party.id)}
                  style={{
                    borderColor: getPartyColor(party.id),
                    color: selectedParty === party.id ? 'white' : getPartyColor(party.id),
                    backgroundColor: selectedParty === party.id ? getPartyColor(party.id) : 'transparent'
                  }}
                >
                  <span className="party-name">{party.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="results-section">
            <h2>You have already voted!</h2>
            <h3>Current Results:</h3>
            <div className="results-grid">
              {parties.map((party) => (
                <div key={party.id} className="result-card" style={{
                  borderColor: getPartyColor(party.id)
                }}>
                  <h4 style={{ color: getPartyColor(party.id) }}>{party.name}</h4>
                  <p>{party.voteCount} votes</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Your Vote</h3>
            <p>Are you sure you want to vote for {parties.find(p => p.id === partyToVote)?.name}?</p>
            <div className="modal-buttons">
              <button className="modal-button confirm-button" onClick={handleConfirmVote}>
                Confirm Vote
              </button>
              <button className="modal-button cancel-button" onClick={handleCancelVote}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;