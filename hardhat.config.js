require("dotenv").config();

require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require('hardhat-deploy');
require('hardhat-deploy-ethers');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {

  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }    
    ]
  },
  namedAccounts: {
    deployer: {
      default: 0,    // wallet address 0, of the mnemonic in .env
    }
  }
};
