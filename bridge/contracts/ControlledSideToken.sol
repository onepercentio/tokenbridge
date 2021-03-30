pragma solidity ^0.5.0;

import "./zeppelin/token/ERC777/ERC777.sol";
import "./IERC677Receiver.sol";
import "./ISideToken.sol";

contract ControlledSideToken is ISideToken, ERC777 {
    using Address for address;
    using SafeMath for uint256;

    address public authorized;
    uint256 private _granularity;

    event Transfer(address,address,uint256,bytes);

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        address _authorizedAddr,
        address[] memory _onwerAddr,
        uint256 _newGranularity
    ) ERC777(_tokenName, _tokenSymbol, _onwerAddr) public {
        require(_authorizedAddr != address(0), "SideToken: Minter address is null");
        require(_newGranularity >= 1, "SideToken: Granularity must be equal or bigger than 1");
        authorized = _authorizedAddr;
        _granularity = _newGranularity;
    }

    modifier onlyAuthorized() {
        require(_msgSender() == authorized, "SideToken: Caller is not the minter");
        _;
    }

    function mint(
        address account,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    )
    external onlyAuthorized
    {
        _mint(_msgSender(), account, amount, userData, operatorData);
    }

    /**
     * @dev Overrides burn funcionality so only authorized wallets can burn
     * tokens. This is important because if a holder burns tokens on the 
     * side token that amount would be forever stuck on the original bridge,
     * therefore the original token total supply would be forever wrong.
     * It's also imperative that we centralize burns on the main token as
     * this side token mirrors a real-world asset with an audited inventory.
     * 
     * That's why only default operators can burn tokens and only the authorized
     * address can burn its tokens. Regular users and contracts can't.
     *
     * Also emits a {Transfer} event for ERC20 compatibility.
     */
    function burn(uint256 amount, bytes calldata data) external onlyAuthorized {
        _burn(_msgSender(), _msgSender(), amount, data, "");
    }

    /**
    * @dev ERC677 transfer token with additional data if the recipient is a contact.
    * @param recipient The address to transfer to.
    * @param amount The amount to be transferred.
    * @param data The extra data to be passed to the receiving contract.
    */
    function transferAndCall(address recipient, uint amount, bytes calldata data)
        external returns (bool success)
    {
        address from = _msgSender();

        _send(from, from, recipient, amount, data, "", false);
        emit Transfer(from, recipient, amount, data);
        IERC677Receiver(recipient).onTokenTransfer(from, amount, data);
        return true;
    }

    function granularity() public view returns (uint256) {
        return _granularity;
    }

}