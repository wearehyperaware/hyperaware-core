pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/math/SafeMath.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/ownership/Ownable.sol";

contract VehicleRegistry is Ownable {
    using SafeMath for uint256;
    uint256 MIN_STAKE = 1000000000000000000;
    uint256 SLASH_AMOUNT = 100000000000000000;

    struct StakeInfo {
        bool exists;
        uint256 unclaimedSlashRewards;
        Vehicle[] vehicles;
    }

    struct Vehicle {
        string id;
        uint256 amount;
        uint256 expires;
    }

    string[] public allVehicles;

    mapping(string => StakeInfo) stakeholders;

    event RegisterEvent(string ownerDid, string vehicleDid, bool success);
    event WithdrawEvent(uint256 withdrawAmount, bool success);
    event SlashEvent(string slashedhDid, uint256 slashAmount);
    event GetVehiclesEvent(string[] ids, uint256[] amounts, uint256[] expires);
    event IncreaseStakeEvent(uint256 newStakeAmount, uint256 newExpiry);

    function lockCoins(string memory ownerDID, string memory vehicleDID, uint256 lockAmount, uint256 lockTime) internal {
        require(lockAmount >= MIN_STAKE, "You need to stake more than 100 tokens.");
        StakeInfo storage userInfo = stakeholders[ownerDID];
        if (compareStrings(userInfo.vehicles[userInfo.vehicles.length - 1].id, vehicleDID)) {
            userInfo.vehicles[userInfo.vehicles.length - 1].expires = block.timestamp + lockTime * 1 minutes;
            userInfo.vehicles[userInfo.vehicles.length - 1].amount = lockAmount;
        } else {
            revert("Could not lock coins, can't find correct vehicleDID");
        }
    }

    function increaseStake(string memory ownerDID, string memory vehicleDID, uint256 lockAmount, uint256 lockTime) public payable {
        StakeInfo storage userInfo = stakeholders[ownerDID];
        for (uint i = 0; i < userInfo.vehicles.length; i++) {
            if (compareStrings(userInfo.vehicles[i].id, vehicleDID)) {
                userInfo.vehicles[i].expires = block.timestamp + lockTime * 1 minutes;
                userInfo.vehicles[i].amount += lockAmount;
                emit IncreaseStakeEvent(userInfo.vehicles[i].amount, userInfo.vehicles[i].expires);
                return;
            }
        }
        revert("You do not own a vehicle with this DID");
    }

    function withdraw(string memory ownerDID, string memory vehicleDID, uint256 withdrawAmount) public {
        StakeInfo storage userInfo = stakeholders[ownerDID];
        for (uint i = 0; i < userInfo.vehicles.length; i++) {
            if (compareStrings(userInfo.vehicles[i].id, vehicleDID)) {
                require(block.timestamp >= userInfo.vehicles[i].expires, "You can't withdraw before your stake expiry date passes.");
                require(address(this).balance >= withdrawAmount);
                userInfo.vehicles[i].expires = 0;
                userInfo.vehicles[i].amount -= withdrawAmount;
                msg.sender.transfer(withdrawAmount);
                emit WithdrawEvent(withdrawAmount, true);
                return;
            }
        }
        revert("You do not own a vehicle with this DID");
    }

    function slash(uint256 slashAmount, string memory slashedOwnerDID, string memory slashedVehicleDID) public onlyOwner {
        StakeInfo storage toBeSlashedInfo = stakeholders[slashedOwnerDID];
        for (uint i = 0; i < toBeSlashedInfo.vehicles.length; i++) {
            if (compareStrings(toBeSlashedInfo.vehicles[i].id, slashedVehicleDID)) {
                toBeSlashedInfo.vehicles[i].amount -= slashAmount;
                emit SlashEvent(slashedOwnerDID, slashAmount);
                return;
            }
        }
        revert("Owner does not have a vehicle with provided DID");
    }


    function registerVehicle (string memory ownerDID, string memory vehicleDID, uint256 lockTime) public payable {
        require(msg.value >= MIN_STAKE, "You need to stake at least 1 IOTX");
        if (!this.isStakeholder(ownerDID)) {
            stakeholders[ownerDID].exists = true;
            stakeholders[ownerDID].unclaimedSlashRewards = 0;
        }
        for (uint i = 0; i < stakeholders[ownerDID].vehicles.length; i++) {
            require(!compareStrings(stakeholders[ownerDID].vehicles[i].id, vehicleDID), "This device is already registered!");
        }
        allVehicles.push(vehicleDID);
        stakeholders[ownerDID].vehicles.push(Vehicle(vehicleDID, 0, 0));
        lockCoins(ownerDID, vehicleDID, msg.value, lockTime);
        emit RegisterEvent(ownerDID, vehicleDID, true);

    }

    function isStakeholder(string memory ownerDID) public view returns (bool) {
        return stakeholders[ownerDID].exists;
    }

    function deleteStakeholder(string memory ownerDID) public {
        stakeholders[ownerDID].exists = false;
    }

    function isVehicleExpired(string memory ownerDID, string memory vehicleDID) public view returns (bool) {
        StakeInfo storage ownerInfo = stakeholders[ownerDID];
        for (uint i = 0; i < ownerInfo.vehicles.length; i++) {
            if (compareStrings(ownerInfo.vehicles[i].id, vehicleDID)) {
                return block.timestamp >= ownerInfo.vehicles[i].expires;
            }
        }
        revert("Owner does not have a vehicle with provided DID");
    }


    function getVehicles(string memory ownerDID) public returns (string[] memory, uint256[] memory, uint256[] memory) {
        string[] memory ids = new string[](stakeholders[ownerDID].vehicles.length);
        uint256[] memory amounts = new uint256[](stakeholders[ownerDID].vehicles.length);
        uint256[] memory expires = new uint256[](stakeholders[ownerDID].vehicles.length);

        for (uint i = 0; i < stakeholders[ownerDID].vehicles.length; i++) {
            Vehicle storage vehicle = stakeholders[ownerDID].vehicles[i];
            ids[i] = vehicle.id;
            amounts[i] = vehicle.amount;
            expires[i] = vehicle.expires;
        }
        emit GetVehiclesEvent(ids, amounts, expires);
        return (ids, amounts, expires);
    }

    function getEveryRegisteredVehicle() public view returns (uint256) {
        return allVehicles.length;
    }


    function compareStrings (string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }


    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }


    function addrToString(address _addr) public pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }


    function toLower(string memory _base)
    internal
    pure
    returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        for (uint i = 0; i < _baseBytes.length; i++) {
            _baseBytes[i] = _lower(_baseBytes[i]);
        }
        return string(_baseBytes);
    }

    function _lower(bytes1 _b1)
    private
    pure
    returns (bytes1) {

        if (_b1 >= 0x41 && _b1 <= 0x5A) {
            return bytes1(uint8(_b1) + 32);
        }

        return _b1;
    }


}
