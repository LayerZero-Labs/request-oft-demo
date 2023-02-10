// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {NonblockingLzApp} from "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

contract TokenRequester is NonblockingLzApp {
    constructor(address _endpoint) NonblockingLzApp(_endpoint) {}

    function estimateFees(uint16 dstChainId, bytes calldata adapterParams, bytes calldata callbackAdapterParameters) public view returns (uint nativeFee, uint zroFee) {
        // Only the payload format matters when estimating fee, not the actual data
        bytes memory payload = abi.encode(0, address(this), address(this), callbackAdapterParameters);
        return lzEndpoint.estimateFees(dstChainId, address(this), payload, false, adapterParams);
    }

    // use V2 for adapterParams to pass airdrop value that will be use on destination to pay fees for OFT callback message
    function requestTokens(address to, uint amount, uint16 dstChainId, address refundAddress, bytes calldata adapterParams, bytes calldata callbackAdapterParameters) external payable {
        require(to != address(0), "Invalid to address");
        require(amount > 0, "Invalid amount");

        bytes memory payload = abi.encode(amount, to, refundAddress, callbackAdapterParameters);
        _lzSend(dstChainId, payload, payable(refundAddress), address(0), adapterParams, msg.value);
    }

    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {}
}