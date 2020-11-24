const fs = require('fs');

const allowTokensBuild = require('./build/contracts/AllowTokens_v1');
fs.writeFileSync('../abis/AllowTokens.json', JSON.stringify(allowTokensBuild.abi));

const bridgeBuild = require('./build/contracts/Bridge_v2');
fs.writeFileSync('../abis/Bridge.json', JSON.stringify(bridgeBuild.abi));

const validatorsBuild = require('./build/contracts/Validators_v2');
fs.writeFileSync('../abis/Validators.json', JSON.stringify(validatorsBuild.abi));

const sideTokenBuild = require('./build/contracts/SideToken_v1');
fs.writeFileSync('../abis/SideToken.json', JSON.stringify(sideTokenBuild.abi));