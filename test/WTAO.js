const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("WTAO", function () {
  async function deployWTAOFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const WTAO = await ethers.getContractFactory("WTAO");
    const wtao = await WTAO.deploy();

    const ONE_TAO = ethers.parseEther("1.0");

    return { wtao, owner, otherAccount, ONE_TAO };
  }

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      const { wtao } = await loadFixture(deployWTAOFixture);

      expect(await wtao.name()).to.equal("Wrapped TAO");
      expect(await wtao.symbol()).to.equal("WTAO");
      expect(await wtao.decimals()).to.equal(18);
    });

    it("Should start with zero total supply", async function () {
      const { wtao } = await loadFixture(deployWTAOFixture);
      expect(await wtao.totalSupply()).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should accept deposits and mint WTAO", async function () {
      const { wtao, owner, ONE_TAO } = await loadFixture(deployWTAOFixture);

      await expect(wtao.deposit({ value: ONE_TAO }))
        .to.emit(wtao, "Deposit")
        .withArgs(owner.address, ONE_TAO);

      expect(await wtao.balanceOf(owner.address)).to.equal(ONE_TAO);
      expect(await wtao.totalSupply()).to.equal(ONE_TAO);
    });

    it("Should accept deposits via receive function", async function () {
      const { wtao, owner, ONE_TAO } = await loadFixture(deployWTAOFixture);

      await expect(
        owner.sendTransaction({
          to: wtao.target,
          value: ONE_TAO,
        })
      )
        .to.emit(wtao, "Deposit")
        .withArgs(owner.address, ONE_TAO);

      expect(await wtao.balanceOf(owner.address)).to.equal(ONE_TAO);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow withdrawals and burn WTAO", async function () {
      const { wtao, owner, ONE_TAO } = await loadFixture(deployWTAOFixture);

      // First deposit
      await wtao.deposit({ value: ONE_TAO });

      // Then withdraw
      await expect(wtao.withdraw(ONE_TAO))
        .to.emit(wtao, "Withdrawal")
        .withArgs(owner.address, ONE_TAO);

      expect(await wtao.balanceOf(owner.address)).to.equal(0);
      expect(await wtao.totalSupply()).to.equal(0);
    });

    it("Should revert withdrawal with insufficient balance", async function () {
      const { wtao, ONE_TAO } = await loadFixture(deployWTAOFixture);

      await expect(wtao.withdraw(ONE_TAO)).to.be.revertedWith(
        "Insufficient balance"
      );
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { wtao, owner, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );

      // Deposit first
      await wtao.deposit({ value: ONE_TAO });

      // Transfer to other account
      await expect(wtao.transfer(otherAccount.address, ONE_TAO))
        .to.emit(wtao, "Transfer")
        .withArgs(owner.address, otherAccount.address, ONE_TAO);

      expect(await wtao.balanceOf(owner.address)).to.equal(0);
      expect(await wtao.balanceOf(otherAccount.address)).to.equal(ONE_TAO);
    });

    it("Should fail transfer with insufficient balance", async function () {
      const { wtao, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );

      await expect(
        wtao.transfer(otherAccount.address, ONE_TAO)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Allowances", function () {
    it("Should handle approvals correctly", async function () {
      const { wtao, owner, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );

      await expect(wtao.approve(otherAccount.address, ONE_TAO))
        .to.emit(wtao, "Approval")
        .withArgs(owner.address, otherAccount.address, ONE_TAO);

      expect(
        await wtao.allowance(owner.address, otherAccount.address)
      ).to.equal(ONE_TAO);
    });

    it("Should handle transferFrom with allowance", async function () {
      const { wtao, owner, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );

      // Deposit tokens first
      await wtao.deposit({ value: ONE_TAO });

      // Approve otherAccount
      await wtao.approve(otherAccount.address, ONE_TAO);

      // Transfer using otherAccount
      await expect(
        wtao
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, ONE_TAO)
      )
        .to.emit(wtao, "Transfer")
        .withArgs(owner.address, otherAccount.address, ONE_TAO);

      expect(await wtao.balanceOf(otherAccount.address)).to.equal(ONE_TAO);
      expect(
        await wtao.allowance(owner.address, otherAccount.address)
      ).to.equal(0);
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      const { wtao, owner, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );

      await wtao.deposit({ value: ONE_TAO });

      await expect(
        wtao
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, ONE_TAO)
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("Basic security checks", function () {
    it("Should revert if non-existent balance is withdrawn", async function () {
      const { wtao, otherAccount } = await loadFixture(deployWTAOFixture);
      await expect(wtao.connect(otherAccount).withdraw(1)).to.be.revertedWith(
        "Insufficient balance"
      );
    });

    it("Should revert if user tries to transfer more than balance", async function () {
      const { wtao, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );
      await expect(
        wtao.connect(otherAccount).transfer(otherAccount.address, ONE_TAO)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert if user tries to transferFrom more than allowance", async function () {
      const { wtao, owner, otherAccount, ONE_TAO } = await loadFixture(
        deployWTAOFixture
      );
      await wtao.deposit({ value: ONE_TAO });
      await expect(
        wtao
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, ONE_TAO)
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("Overflow and extreme value checks", function () {
    it("Should allow approving maximum uint and transferring tokens", async function () {
      const { wtao, owner, otherAccount } = await loadFixture(
        deployWTAOFixture
      );
      await wtao.deposit({ value: ethers.parseEther("1000") });

      const maxUint = ethers.MaxUint256;
      await wtao.approve(otherAccount.address, maxUint);

      await wtao
        .connect(otherAccount)
        .transferFrom(
          owner.address,
          otherAccount.address,
          ethers.parseEther("500")
        );
      expect(await wtao.balanceOf(otherAccount.address)).to.equal(
        ethers.parseEther("500")
      );
    });

    it("Should not allow withdrawing more than deposited, even with large uint approvals", async function () {
      const { wtao, owner, otherAccount } = await loadFixture(
        deployWTAOFixture
      );
      await wtao.deposit({ value: ethers.parseEther("1000") });

      const maxUint = ethers.MaxUint256;
      await wtao.approve(otherAccount.address, maxUint);

      await expect(
        wtao
          .connect(otherAccount)
          .transferFrom(
            owner.address,
            otherAccount.address,
            ethers.parseEther("9999999")
          )
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
