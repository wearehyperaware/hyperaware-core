pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;
contract ZoneRegistry {
    address admin;
    address[] registeredAddrs;

    struct DID {
        bool exist;
        bytes32 hash;
        string uri;
    }

    mapping(address => DID) DIDs;
    event Appended(address firstRegisterer);
    event CreateDID(address caller, bytes32 hash, string uri);
    event UpdateHash(address caller, bytes32 hash);
    event UpdateURI(address caller, string uri);
    event DeleteDID(address caller);

    constructor() public {
        admin = msg.sender;
    }

    //MAIN FUNCTIONS

    function register(bytes32 _hash, string memory _uri) public {
        if (DIDs[msg.sender].exist) {
            require(DIDs[msg.sender].exist, "DID does not exist");
            updateHash(_hash);
            updateURI(_uri);
        } else {
            createDID(_hash, _uri);
        }
    }

    function deregister(address _toBeDeleted) public {
        require(msg.sender == admin || _toBeDeleted == msg.sender);
        deleteDID(_toBeDeleted);
    }

    function getURI(address _addr) public view returns (string memory) {
        require(DIDs[_addr].exist, "DID does not exist");
        return DIDs[_addr].uri;
    }

    function isRegistered(address _addr) public view returns (bool) {
        return DIDs[_addr].exist;
    }

    //hope this works on the client side
    //used when checking if a tracker violated any zone
    DID[] existingDID;
    function getExistingDIDs() public returns (DID[] memory) {
        for (uint256 i = 0; i < registeredAddrs.length; i++) {
            if (DIDs[registeredAddrs[i]].exist) {
                existingDID.push(DIDs[registeredAddrs[i]]);
            }
        }
        return existingDID;
    }

    //AVAILABLE FUNCTIONS BUT NOT THAY IMPORTANT
    //get hash
    function getHash(address _addr) public view returns (bytes32) {
        require(DIDs[_addr].exist, "DID does not exist");
        return DIDs[_addr].hash;
    }

    //we dont need this if getExisitingDIDs works
    address[] existingAddrs;
    function getExistingAddrs() public returns (address[] memory) {
        for (uint256 i = 0; i < registeredAddrs.length; i++) {
            if (DIDs[registeredAddrs[i]].exist) {
                existingAddrs.push(registeredAddrs[i]);
            }
        }
        return existingAddrs;
    }

    //HELPER FUNCTIONS, DONT WORRY
    function registeredBefore(address _addr) internal view returns (bool) {
        for (uint256 i = 0; i < registeredAddrs.length; i++) {
            if (_addr == registeredAddrs[i]) return true;
        }
        return false;
    }

    function createDID(bytes32 _hash, string memory _uri) internal {
        DIDs[msg.sender] = DID(true, _hash, _uri);
        if (!registeredBefore(msg.sender)) {
            registeredAddrs.push(msg.sender);
            emit Appended(msg.sender);
        }
        emit CreateDID(msg.sender, _hash, _uri);
    }

    function updateHash(bytes32 _hash) internal {
        DIDs[msg.sender].hash = _hash;
        emit UpdateHash(msg.sender, DIDs[msg.sender].hash);
    }

    function updateURI(string memory _uri) internal {
        DIDs[msg.sender].uri = _uri;
        emit UpdateURI(msg.sender, DIDs[msg.sender].uri);
    }

    function deleteDID(address _addr) internal {
        DIDs[_addr].exist = false;
        emit DeleteDID(_addr);
    }

}
