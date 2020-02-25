export const ABI = [
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
        "constant": true,
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
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "deleteStakeholder",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getEveryRegisteredVehicle",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "string",
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "getVehicles",
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
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
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
                "internalType": "uint8",
                "name": "lockTime",
                "type": "uint8"
            }
        ],
        "name": "increaseStake",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "isOwner",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
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
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
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
                "internalType": "uint8",
                "name": "lockTime",
                "type": "uint8"
            }
        ],
        "name": "registerVehicle",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
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
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
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
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]