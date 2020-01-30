pragma solidity >= 0.6.0;

import { SMT256 } from "../SMT.sol";

contract OptimisticSMTExample {
    using SMT256 for *;

    struct Proposal {
        SMT256.OPRU opru;
        address proposer;
    }

    Proposal proposal;
    SMT256.OPRU proof;

    function propose(bytes32 prev, bytes32 next, bytes32 mergedLeaves, bytes32[] memory leaves) public {
        /// Propose an optimistic roll up without any calculation
        /// Challenge system can enforce to include correct leaves. SMT256.merge(bytes32(0), leaves);
        proposal = Proposal(SMT256.OPRU(prev, next, mergedLeaves), msg.sender);
    }

    function initProof() public {
        proof = SMT256.newOPRU(proposal.opru.prev);
    }

    function updateProof(bytes32[] memory leaves, bytes32[256][] memory siblings) public {
        proof.update(leaves, siblings);
    }

    function verifyProposal() public view returns (bool) {
        return proof.verify(
            proposal.opru.prev,
            proposal.opru.next,
            proposal.opru.mergedLeaves
        );
    }
}