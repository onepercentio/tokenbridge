pragma solidity ^0.5.0;

import "./zeppelin/ownership/Secondary.sol";
import "./ISideTokenFactory.sol";
import "./ControlledSideToken.sol";

contract ControlledSideTokenFactory is ISideTokenFactory, Secondary {

    address public tokenOwner;

    constructor (address _tokenOwner) public {
        tokenOwner = _tokenOwner;
    }

    function createSideToken(string calldata name, string calldata symbol, uint256 granularity) external onlyPrimary returns(address) {
        address[] memory owners = new address[](1);
        owners[0] = tokenOwner;

        address sideToken = address(new ControlledSideToken(name, symbol, primary(), owners, granularity));
        emit SideTokenCreated(sideToken, symbol, granularity);
        return sideToken;
    }
}