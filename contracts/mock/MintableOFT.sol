// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {LZEndpointMock} from "@layerzerolabs/solidity-examples/contracts/mocks/LZEndpointMock.sol";
import {OFT} from "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";

contract MintableOFT is OFT {
    constructor(string memory _name, string memory _symbol, address _lzEndpoint) OFT(_name, _symbol, _lzEndpoint) {
        _mint(msg.sender, 1000 ether);
    }
}