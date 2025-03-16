import React, { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import { contractABI } from './contract/abi';
import { contractAddress } from './contract/address';
import { partyColors } from './constants/colors';
import Modal from './components/Modal';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsIogin] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', onConfirm: null });

  // Initialize blockchain connection
  useEffect(() => {
    const loadBlockchainData = async () => {
      // Check if MetaMask is installed
      if (window.ethereum) {
      
        try{
        // Request user's wallet connection
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const userAccount = accounts[0];
          setIsIogin(true);

        // Get current network
          const network = await window.ethereum.request({ method: 'eth_chainId' });
  
        // Initialize provider and check contract existence
          const provider = new ethers.BrowserProvider(window.ethereum);
          const code = await provider.getCode(contractAddress);
          
          if (code === '0x') {
            throw new Error(`No contract found at address ${contractAddress}. Are you connected to the right network?`);
          }
          
        // Set up provider, signer, and contract
          setProvider(provider);
          const signer = await provider.getSigner();
          setSigner(signer);
          const ethContract = new ethers.Contract(contractAddress, contractABI, signer);
          
          try {
            const count = await ethContract.getPartiesCount();
            console.log("Initial party count:", count);
            setContract(ethContract);
          } catch (error) {
           setError("Error initialiizing to contract ");}
          
        } 
        catch (error) {
           setError("Error connecting to blockchain: " + error.message);
        }
      }

        else{
          alert("Please install MetaMask.");
        }

    };
    loadBlockchainData();
  }, []);

  // Fetch parties data when contract is initialized
  useEffect(() => {
    if (contract) {
      fetchParties();
    }
  }, [contract]);

  // Function to fetch all parties and their vote counts
  const fetchParties = async () => {
    if (!contract?.getPartiesCount) {
      return;
    }

    try {
      // Get total number of parties
      const partyCount = await contract.getPartiesCount();
      const partyData = [];
      let total = 0;

      // Fetch all parties in parallel for better performance
      const partyPromises = Array.from({ length: Number(partyCount) }, (_, i) => 
        contract.getParty(i)
      );
      
      const partyResults = await Promise.all(partyPromises);
      
      // Process party data
      partyResults.forEach((party, i) => {
        partyData.push({
          id: i,
          name: party.name,
          voteCount: Number(party.voteCount) 
        });
        total += Number(party.voteCount); 
      });
      
      setParties(partyData);
      setTotalVotes(total.toString());
    } catch (error) {
      // setError("Error fetching parties: " + error.message);
      setError("Please check if you are connected to the correct network and refresh the page.");
    }
  };

  // Check if current user has voted
  useEffect(() => {
    if (contract && signer) {
      const checkIfVoted = async () => {
        try {
          const address = await signer.getAddress();
          const hasVoted = await contract.hasVoted(address);
          setUserHasVoted(hasVoted);
          setIsLoading(false);
        } catch (error) {
          // setError("Error checking vote status: " + error.message);
          setError("Please check if you are connected to the correct network and refresh the page.");
        }
      };
      checkIfVoted();
    }
  }, [contract, signer]);

  // Add MetaMask event listeners
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          setError("Disconnected from MetaMask. Please connect to continue.");
          setIsIogin(false);
          window.location.reload();
      }

        // Reset states for new account
        setUserHasVoted(false);
        setSelectedParty(null);
        setParties([]);
        setTotalVotes('0');
        setIsLoading(true);
        setError(null);

        // Reinitialize blockchain connection
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const ethContract = new ethers.Contract(contractAddress, contractABI, signer);
          setIsIogin(true);
          setProvider(provider);
          setSigner(signer);
          setContract(ethContract);
          alert("New account connected: "+signer.address );
          // Fetch parties and check vote status for new account
          await fetchParties();
          const address = await signer.getAddress();
          const hasVoted = await ethContract.hasVoted(address);
          setUserHasVoted(hasVoted);
        } catch (error) {
          setError("Error connecting to blockchain: " + error.message);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when network changes
        window.location.reload();
        alert("Network changed.");
      };
      
      const handleConnect = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const ethContract = new ethers.Contract(contractAddress, contractABI, signer);
          
          setProvider(provider);
          setSigner(signer);
          setContract(ethContract);
          alert("New account connected in new network: "+signer.address );
          await fetchParties();
          const address = await signer.getAddress();
          const hasVoted = await ethContract.hasVoted(address);
          setUserHasVoted(hasVoted);
    } catch (error) {
          console.error("Error connecting to blockchain:", error);
          setError("Error connecting to blockchain: " + error.message);
        }
      };

      // Subscribe to MetaMask events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);

        window.ethereum.removeListener('connect', handleConnect);
      };
    }
    else{
      alert("Please connect MetaMask.");
    }
  }, []);

  const handleVoteClick = (partyId) => {
    setSelectedParty(partyId);
    setModalData({
      title: 'Confirm Vote',
      message: `Are you sure you want to vote for ${parties[partyId].name}?`,
      onConfirm: () => handleVote(partyId)
    });
    setShowModal(true);
  };

  const handleVote = async (partyId) => {
    if (contract && partyId >= 0) {
      try {
        setShowModal(false);
        const tx = await contract.vote(partyId);
        await tx.wait();
        setUserHasVoted(true);
        await fetchParties();
      } catch (error) {
        console.error(error);
        if (error.code === 'ACTION_REJECTED' || error.message.includes('User rejected')) {
          setSelectedParty(null);
          setModalData({
            title: 'Transaction Cancelled',
            message: 'Your vote was not recorded.',
            onConfirm: () => setShowModal(false)
          });
          setShowModal(true);
        } else {
          setError('Error voting: ' + error.message);
        }
      }
    }
  };

  const getPartyColor = (partyId) => {
    return partyColors[partyId % partyColors.length];
  };

  if (!isLogin) {
    return <div className="Login request">Please connect wallet to continue...</div>;
  }

  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Main application render
  return (
    <div className="App">
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedParty(null);
        }}
        onConfirm={modalData.onConfirm}
        title={modalData.title}
        message={modalData.message}
      />
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
            <p>Thank you for participating in the our app.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;