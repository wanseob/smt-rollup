import chai from 'chai';
import { OptimisticSMTExampleInstance } from '../src/types/truffle-contracts';
import { soliditySha3 } from 'web3-utils';
import fs from 'fs-extra';
import { RollUpSMT, RollUpResult } from '../src/rollUpSMT';

const expect = chai.expect;
const OptimisticSMTExample = artifacts.require('OptimisticSMTExample');

contract.only('SMT test', async accounts => {
  const location = 'testDB';
  let smtOPRU: OptimisticSMTExampleInstance;
  let tree: RollUpSMT;

  let used = Array.from(Array(110).keys())
    .slice(0, 10)
    .map(val => soliditySha3(val));
  let unused = Array.from(Array(110).keys())
    .slice(10)
    .map(val => soliditySha3(val));
  let rollUpResult: RollUpResult;
  before(async () => {
    // Initialize the test purpose database directory
    if (fs.existsSync(location)) {
      fs.removeSync(location);
    }
    fs.mkdirSync(location);
    tree = new RollUpSMT(256, location);
    await tree.rollUp(used);
    rollUpResult = await tree.rollUp(unused);
    smtOPRU = await OptimisticSMTExample.new();
  });
  after(() => {
    // Remove the test purpose database
    if (fs.existsSync(location)) {
      fs.removeSync(location);
    }
  });
  describe('propose()', async () => {
    it('should be able to propose more than 100 items at once', async () => {
      const mergedLeaves = rollUpResult.proof.leaves.reduce((merged, leaf) => {
        return soliditySha3(merged, leaf)
      }, '0')
      await smtOPRU.propose(
        rollUpResult.proof.root.toString(),
        rollUpResult.proof.nextRoot.toString(),
        mergedLeaves.toString(),
        rollUpResult.proof.leaves.map(item => item.toString())
      );
    });
  });
  describe('init()', async () => {
    it('should start an opru calculation with the proposed one', async () => {
      await smtOPRU.initProof();
    });
  });
  describe('update()', async () => {
    it('should be able to append all 100 items', async () => {
      let proofs = [];
      for (let i = 0, j = rollUpResult.proof.leaves.length, chunk = 5; i < j; i += chunk) {
        proofs.push({
          leaves: rollUpResult.proof.leaves.slice(i, i + chunk).map(nullifier => nullifier.toString()),
          siblings: rollUpResult.proof.siblings.slice(i, i + chunk).map(siblings => siblings.map(sib => sib.toString()))
        });
      }

      for (let i = 0; i < proofs.length; i++) {
        await smtOPRU.updateProof(proofs[i].leaves, proofs[i].siblings, {
          gas: 6700000
        });
      }
      const list: any = []
      proofs.forEach(element => {
        list.push(...element.leaves)
      });
      console.log(list)
    });
  });
  describe('verify()', async () => {
    it('should return true', async () => {
      let result = await smtOPRU.verifyProposal();
      expect(result).to.equal(true);
    });
  });
});
