// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOFTCore} from "@layerzerolabs/solidity-examples/contracts/token/oft/IOFTCore.sol";
import {NonblockingLzApp} from "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "hardhat/console.sol";

contract TokenSender is NonblockingLzApp {
    address public immutable oft;

    constructor(address _endpoint, address _oft) NonblockingLzApp(_endpoint) {
        require(_oft != address(0), "Invalid oft address");
        oft = _oft;
    }

    function _nonblockingLzReceive(uint16 srcChainId, bytes memory, uint64, bytes memory payload) internal virtual override {
        (uint amount, address to, address refundAddress, bytes memory adapterParams) = abi.decode(payload, (uint, address, address, bytes));

        if (IERC20(oft).balanceOf(address(this)) >= amount) {
            // received from airdrop
            uint fees = address(this).balance;
            IOFTCore(oft).sendFrom{value: fees}(address(this), srcChainId, abi.encodePacked(to), amount, payable(refundAddress), address(0), adapterParams);
        }
    }

    // allow this contract to receive ether
    receive() external payable {}
}