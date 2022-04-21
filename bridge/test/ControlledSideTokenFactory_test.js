const SideToken = artifacts.require('./ControlledSideToken');
const SideTokenFactory = artifacts.require('./ControlledSideTokenFactory');

const utils = require('./utils');

contract('SideTokenFactory', async function (accounts) {
  const tokenCreator = accounts[0];
  const anAccount = accounts[1];
  const tokenOwner = accounts[0];

  describe('wrapper', () => {

    beforeEach(async function () {
      this.sideTokenFactory = await SideTokenFactory.new(tokenOwner);
    });

    it('should set the token owner', async function () {
      const owner = await this.sideTokenFactory.tokenOwner();
      assert.equal(tokenOwner, owner)
    });

    it('creates a new side token with correct parameters', async function () {
      let receipt = await this.sideTokenFactory.createSideToken("SIDE", "SIDE", 1);
      utils.checkRcpt(receipt);

      receipt = await this.sideTokenFactory.createSideToken("OTHERSYMBOL", "OTHERSYMBOL", 1);
      utils.checkRcpt(receipt);
    });

    it('fails to create a new side token due to wrong parameters', async function () {
      await utils.expectThrow(this.sideTokenFactory.createSideToken());
      await utils.expectThrow(this.sideTokenFactory.createSideToken("SIDE", 1));
    });

    it('fails to create a new side token due to wrong caller', async function () {
      assert.equal(await this.sideTokenFactory.primary(), tokenCreator);
      await utils.expectThrow(this.sideTokenFactory.createSideToken("SIDE", "SIDE", 1, { from: anAccount }));
    });

    it('should create a controlled side token', async function () {
      let receipt = await this.sideTokenFactory.createSideToken("SIDE", "SID", 1);
      utils.checkRcpt(receipt);
      assert.equal(receipt.logs[0].event, 'SideTokenCreated');
      let sideTokenAddress = receipt.logs[0].args[0];
      assert.isTrue(sideTokenAddress != 0);
      assert.equal(receipt.logs[0].args[1], "SID");

      let sideToken = await SideToken.at(sideTokenAddress);

      const tokenBalance = await sideToken.balanceOf(tokenCreator);
      assert.equal(tokenBalance, 0);

      const totalSupply = await sideToken.totalSupply();
      assert.equal(totalSupply, 0);

      const symbol = await sideToken.symbol();
      assert.equal(symbol, "SID");

      const name = await sideToken.name();
      assert.equal(name, "SIDE");

      let minter = await sideToken.minter();
      assert.equal(minter, tokenCreator);

      const defaultOperators = await sideToken.defaultOperators()
      assert.equal(defaultOperators[0], tokenOwner)

      receipt = await this.sideTokenFactory.createSideToken("OTHERSYMBOL", "OTHERSYMBOL", 1, { from: tokenCreator });
      utils.checkRcpt(receipt);
      assert.equal(receipt.logs[0].event, 'SideTokenCreated');
      let newSideTokenAddress = receipt.logs[0].args[0];
      assert.isTrue(newSideTokenAddress != 0);
      assert.isTrue(newSideTokenAddress != sideTokenAddress);
      assert.equal(receipt.logs[0].args[1], "OTHERSYMBOL");
    });

    it('should create mintable tokens with caller', async function () {
      await this.sideTokenFactory.transferPrimary(anAccount);
      assert.equal(await this.sideTokenFactory.primary(), anAccount);

      let receipt = await this.sideTokenFactory.createSideToken("SIDE", "SID", 1, { from: anAccount });
      let sideTokenAddress = receipt.logs[0].args[0];
      let sideToken = await SideToken.at(sideTokenAddress);

      const minter = await sideToken.minter();
      assert.equal(minter, anAccount);
    });

  })
});