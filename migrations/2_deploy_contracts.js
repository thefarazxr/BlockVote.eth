//From: https://trufflesuite.com/docs/truffle/getting-started/running-migrations.html

var Election = artifacts.require("./Election.sol");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(Election);
};