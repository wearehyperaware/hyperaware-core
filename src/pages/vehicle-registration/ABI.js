module.exports = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string[]",
                "name": "ids",
                "type": "string[]"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "expires",
                "type": "uint256[]"
            }
        ],
        "name": "GetVehiclesEvent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newStakeAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newExpiry",
                "type": "uint256"
            }
        ],
        "name": "IncreaseStakeEvent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "ownerDid",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "vehicleDid",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "name": "RegisterEvent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "slashedhDid",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "slashAmount",
                "type": "uint256"
            }
        ],
        "name": "SlashEvent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "withdrawAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "name": "WithdrawEvent",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_addr",
                "type": "address"
            }
        ],
        "name": "addrToString",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "allVehicles",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "deleteStakeholder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "getAllVehiclesOfOwner",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            },
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "idx",
                "type": "uint256"
            }
        ],
        "name": "getSingleVehicleOfOwner",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "getVehicleCountOfOwner",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "vehicleDID",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "lockAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lockTime",
                "type": "uint256"
            }
        ],
        "name": "increaseStake",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "isStakeholder",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "vehicleDID",
                "type": "string"
            }
        ],
        "name": "isVehicleExpired",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numberOfRegisteredVehicles",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "vehicleDID",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "lockTime",
                "type": "uint256"
            }
        ],
        "name": "registerVehicle",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "slashAmount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "slashedOwnerDID",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "slashedVehicleDID",
                "type": "string"
            }
        ],
        "name": "slash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "vehicleDID",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "withdrawAmount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]