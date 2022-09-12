import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTShirt Deploy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployNFTFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTShirt = await ethers.getContractFactory("NFTShirt");
    const minter = await NFTShirt.deploy("Save My Shirt!", "SMS");

    return { minter, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("NFT Contract should deploy", async function () {
      const { minter } = await loadFixture(deployNFTFixture);

      expect(await minter.tokenCounter()).to.equal(0);
    });

    it("Minting should update token counter", async function () {
      const { minter } = await loadFixture(deployNFTFixture);
      await minter.mint("google.com");
      expect(await minter.tokenCounter()).to.equal(1);
    });

    it("Minting should assign proper owner", async function () {
      const { minter, owner, otherAccount } = await loadFixture(deployNFTFixture);
      await minter.mint("google.com");
      expect(await minter.ownerOf(0)).to.equal(owner.address);
      expect(await minter.ownerOf(0)).to.not.equal(otherAccount.address);
    });

    it("Mint should set proper uri (google.com)", async function () {
      const { minter, owner } = await loadFixture(deployNFTFixture);
      await minter.mint("google.com");
      expect(await minter.tokenURI(0)).to.equal('google.com');
    });
  });

  describe("Donations", function () {
    it("Mint with donation should increase contract balance", async function () {
      const { minter, owner } = await loadFixture(deployNFTFixture);
      const options = {value: ethers.utils.parseEther("1.0")};
      await minter.mint("google.com", options);
      expect(await minter.checkDonationBalance()).to.equal(ethers.utils.parseEther("1.0"));
    });

    it("Only owner can transferDonations", async function () {
      const { minter, owner, otherAccount } = await loadFixture(deployNFTFixture);
      expect(minter.connect(otherAccount).transferDonations(otherAccount.address, minter.checkDonationBalance())).to.be.revertedWith("Only contract owner can call this");
    });

    it("Transferring Donations properly distributes funds to new address", async function () {
      const { minter, owner, otherAccount } = await loadFixture(deployNFTFixture);
      const options = {value: ethers.utils.parseEther("1.0")};
      await minter.mint("google.com", options);
      const balanceBefore = await  ethers.provider.getBalance(otherAccount.address);
      await minter.transferDonations(otherAccount.address, ethers.utils.parseEther('0.5'));
      expect(await minter.checkDonationBalance()).to.equal(ethers.utils.parseEther('0.5'));
      expect(await (await ethers.provider.getBalance(otherAccount.address))).to.equal(balanceBefore.add((await ethers.utils.parseEther('0.5'))));
    });

    it("Trying to transfer too much fails", async function () {
      const { minter, owner, otherAccount } = await loadFixture(deployNFTFixture);
      const options = {value: ethers.utils.parseEther("1.0")};
      await minter.mint("google.com", options);
      expect(minter.transferDonations(otherAccount.address, ethers.utils.parseEther('1.5'))).to.be.reverted;
    });
    
    it("Only current owner can change owner", async function () {
      const { minter, owner, otherAccount } = await loadFixture(deployNFTFixture);
      expect(minter.connect(otherAccount).changeOwner(otherAccount.address)).to.be.reverted;
    });

    it("Change owner changes owned address", async function () {
      const { minter, owner, otherAccount } = await loadFixture(deployNFTFixture);
      await minter.changeOwner(otherAccount.address);
      expect(await minter.connect(otherAccount).changeOwner(owner.address)).to.not.be.reverted;
    });
  });
});
