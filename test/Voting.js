const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let voting;
  let owner, addr1, addr2;
  const partyNames = ["Party A", "Party B", "Party C"];

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(partyNames);
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy the contract and initialize parties", async function () {
      const partiesCount = await voting.getPartiesCount();
      expect(partiesCount).to.equal(partyNames.length);

      for (let i = 0; i < partyNames.length; i++) {
        const party = await voting.getParty(i);
        expect(party.name).to.equal(partyNames[i]);
        expect(party.voteCount).to.equal(0);
      }
    });
  });

  describe("Voting", function () {
    it("Should allow a user to vote for a party", async function () {
      await voting.connect(addr1).vote(0);
      const party = await voting.getParty(0);
      expect(party.voteCount).to.equal(1);
    });

    it("Should not allow a user to vote twice", async function () {
      await voting.connect(addr1).vote(0);
      await expect(voting.connect(addr1).vote(0))
        .to.be.revertedWith("You have already voted.");
    });

    it("Should emit a 'Voted' event when voting", async function () {
      await expect(voting.connect(addr1).vote(1))
        .to.emit(voting, "Voted")
        .withArgs(addr1.address, 1);
    });

    it("Should not allow voting for an invalid party", async function () {
      await expect(voting.connect(addr1).vote(5))
        .to.be.revertedWith("Invalid party selection.");
    });
  });

  describe("Edge cases", function () {
    it("Should handle multiple voters voting for different parties", async function () {
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);

      const partyA = await voting.getParty(0);
      const partyB = await voting.getParty(1);
      
      expect(partyA.voteCount).to.equal(1);
      expect(partyB.voteCount).to.equal(1);
    });
  });
});
