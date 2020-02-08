pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/math/SafeMath.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/ownership/Ownable.sol";

contract VehicleRegistry is Ownable {
    using SafeMath for uint256;
    uint256 MIN_STAKE = 100;
    uint256 SLASH_AMOUNT = 20;

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

    mapping(string => StakeInfo) stakeholders;

    event RegisterEvent(string ownerDid, string vehicleDid, bool success);
    event WithdrawEvent(uint256 withdrawAmount, bool success);
    event SlashEvent(string slashedhDid, uint256 slashAmount);
    event GetVehiclesEvent(string[] ids, uint256[] amounts, uint256[] expires);

    function lockCoins(string memory ownerDID, string memory vehicleDID, uint256 lockAmount, uint8 lockTime) public payable {
        require(lockAmount > MIN_STAKE, "You need to stake more than 100 tokens.");
        StakeInfo storage userInfo = stakeholders[ownerDID];
        if (compareStrings(userInfo.vehicles[userInfo.vehicles.length - 1].id, vehicleDID)) {
            userInfo.vehicles[userInfo.vehicles.length - 1].expires = block.timestamp + lockTime * 1 minutes;
            userInfo.vehicles[userInfo.vehicles.length - 1].amount = lockAmount;
        } else {
            revert("Could not lock coins, can't find correct vehicleDID");
        }
    }

    function withdraw(string memory ownerDID, string memory vehicleDID, uint256 withdrawAmount) public {
        StakeInfo storage userInfo = stakeholders[ownerDID];
        for (uint i = 0; i < userInfo.vehicles.length; i++) {
            if (compareStrings(userInfo.vehicles[i].id, vehicleDID)) {
                require(block.timestamp >= userInfo.vehicles[i].expires, "You can't withdraw before your stake expiry date passes.");
                require(address(this).balance > withdrawAmount);
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


    function registerVehicle (string memory ownerDID, string memory vehicleDID, uint8 lockTime, bytes memory proof) public payable {
        require(msg.value >= MIN_STAKE, "You need to stake at least 100 wei");
        require(checkValidProof(proof, vehicleDID), "Invalid signature provided for this did.");
        if (!this.isStakeholder(ownerDID)) {
            stakeholders[ownerDID].exists = true;
            stakeholders[ownerDID].unclaimedSlashRewards = 0;
        }
        for (uint i = 0; i < stakeholders[ownerDID].vehicles.length; i++) {
            require(!compareStrings(stakeholders[ownerDID].vehicles[i].id, vehicleDID), "This device is already registered!");
        }

        stakeholders[ownerDID].vehicles.push(Vehicle(vehicleDID, 0, 0));
        this.lockCoins(ownerDID, vehicleDID, msg.value, lockTime);
        emit RegisterEvent(ownerDID, vehicleDID, true);

    }

    function isStakeholder(string memory ownerDID) public view returns (bool) {
        return stakeholders[ownerDID].exists;
    }

    function deleteStakeholder(string memory ownerDID) public {
        stakeholders[ownerDID].exists = false;
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

    function compareStrings (string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }


    function checkValidProof(bytes memory proof, string memory did) internal returns (bool) {
        bytes memory message = abi.encodePacked(toLower(addrToString(msg.sender)), " is the owner of the device ", toLower(did));
        bytes32 hashedMessage = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", uint2str(message.length), message));
        return compareStrings(toLower(addrToString(recover(hashedMessage, proof))), toLower(substring(did, 7, 49)));
    }

    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
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


    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        // Check the signature length
        if (signature.length != 65) {
            return (address(0));
        }

        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (281): 0 < s < secp256k1n ÷ 2 + 1, and for v in (282): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return address(0);
        }

        if (v != 27 && v != 28) {
            return address(0);
        }

        // If the signature is valid (and not malleable), return the signer address
        return ecrecover(hash, v, r, s);
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
