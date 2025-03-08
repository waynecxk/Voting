// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    // Define the parties in the election
    struct Party {
        string name;
        uint voteCount;
    }

    // A mapping to store whether an address has voted
    mapping(address => bool) public hasVoted;

    // Array to store the list of parties
    Party[] public parties;

    // Event that will be emitted once a vote is cast
    event Voted(address indexed voter, uint indexed partyId);

    // Constructor to initialize the parties
    constructor(string[] memory partyNames) {
        for (uint i = 0; i < partyNames.length; i++) {
            parties.push(Party({
                name: partyNames[i],
                voteCount: 0
            }));
        }
    }

    // Function to allow an address to vote
    function vote(uint partyId) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(partyId < parties.length, "Invalid party selection.");

        // Mark the address as having voted
        hasVoted[msg.sender] = true;

        // Increment the vote count for the chosen party
        parties[partyId].voteCount++;

        // Emit a vote event
        emit Voted(msg.sender, partyId);
    }

    // Function to get the number of parties
    function getPartiesCount() public view returns (uint) {
        return parties.length;
    }

    // Function to get the details of a party
    function getParty(uint partyId) public view returns (string memory name, uint voteCount) {
        require(partyId < parties.length, "Invalid party ID.");
        Party storage party = parties[partyId];
        return (party.name, party.voteCount);
    }
}
