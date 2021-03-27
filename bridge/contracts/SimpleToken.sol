pragma solidity ^0.5.0;

import "./zeppelin/token/ERC20/ERC20.sol";
import "./zeppelin/token/ERC20/ERC20Detailed.sol";

contract SimpleToken is ERC20, ERC20Detailed {
    constructor(string memory name, string memory symbol, uint8 decimals)
        ERC20Detailed(name, symbol, decimals) public
    {
        _mint(msg.sender, 1000000000000000000000000000000000000000);
    }

}