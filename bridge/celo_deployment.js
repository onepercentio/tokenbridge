// deploy initial migration and erc1820
truffle deploy --reset --network alfajores --to 2
// change erc1820 addresses in Bridge_Celo, Utils and ERC777
truffle deploy --reset --network alfajores -f 3

// deploy initial migration and erc1820
truffle deploy --network celo --to 2
// change erc1820 addresses in Bridge_Celo, Utils and ERC777
truffle deploy --network celo -f 3
// deploy controlled side token factory only
truffle deploy --network celo -f 5 --to 5