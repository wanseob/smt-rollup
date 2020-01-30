pragma solidity >= 0.6.0;

import { SMT256 } from "../SMT.sol";

contract SMTExample {
    using SMT256 for *;

    function inclusionProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[256] memory siblings
    ) public pure returns(bool) {
        return root.inclusionProof(leaf, siblings);
    }

    function nonInclusionProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[256] memory siblings
    ) public pure returns(bool) {
        return root.nonInclusionProof(leaf, siblings);
    }

    function merkleProof(
        bytes32 root,
        bytes32 leaf,
        bytes32 value,
        bytes32[256] memory siblings
    ) public pure returns(bool) {
        return root.merkleProof(leaf, value, siblings);
    }

    function rollUp(
        bytes32 root,
        bytes32[] memory leaves,
        bytes32[256][] memory siblings
    ) public pure returns (bytes32 nextRoot) {
        return root.rollUp(leaves, siblings);
    }

    function rollUpProof(
        bytes32 root,
        bytes32 nextRoot,
        bytes32[] memory leaves,
        bytes32[256][] memory siblings
    ) public pure returns (bool) {
        return root.rollUpProof(nextRoot, leaves, siblings);
    }
}