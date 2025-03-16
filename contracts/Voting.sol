// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    struct Party {
        string name;
        uint voteCount;
    }

    // A mapping to store if the address has voted
    mapping(address => bool) public hasVoted;

    Party[] public parties;

    // Event that is emitted once a vote is cast
    event Voted(address indexed voter, uint indexed partyId);

    constructor(string[] memory partyNames) {
        for (uint i = 0; i < partyNames.length; i++) {
            parties.push(Party({
                name: partyNames[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint partyId) public {
        require(!hasVoted[msg.sender], "You have already voted."); //this is an important line to prevent double voting
        require(partyId < parties.length, "Invalid party selection."); //this is an important line to prevent invalid party selection

        hasVoted[msg.sender] = true;
        parties[partyId].voteCount++;
        emit Voted(msg.sender, partyId); //emit an event to notify the frontend
    }

    function getPartiesCount() public view returns (uint) {
        return parties.length;
    }

    function getParty(uint partyId) public view returns (string memory name, uint voteCount) {
        require(partyId < parties.length, "Invalid party ID.");
        Party storage party = parties[partyId];
        return (party.name, party.voteCount);
    }
}
