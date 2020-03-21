const Zone = artifacts.require("ZoneRegistry");

module.exports = function(deployer) {
  deployer.deploy(Zone);
};
