export const ABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "isStakeholder",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
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
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "isOwner",
        "outputs": [
            {
                "name": "",
                "type": "bool"
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
                "name": "slashAmount",
                "type": "uint256"
            },
            {
                "name": "slashedOwnerDID",
                "type": "string"
            },
            {
                "name": "slashedVehicleDID",
                "type": "string"
            },
            {
                "name": "paidDID",
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
        "constant": true,
        "inputs": [
            {
                "name": "_addr",
                "type": "address"
            }
        ],
        "name": "addrToString",
        "outputs": [
            {
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
                "name": "ownerDID",
                "type": "string"
            },
            {
                "name": "vehicleDID",
                "type": "string"
            },
            {
                "name": "lockTime",
                "type": "uint8"
            },
            {
                "name": "proof",
                "type": "bytes"
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
        "inputs": [
            {
                "name": "ownerDID",
                "type": "string"
            },
            {
                "name": "vehicleDID",
                "type": "string"
            },
            {
                "name": "withdrawAmount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
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
        "constant": false,
        "inputs": [
            {
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
        "constant": true,
        "inputs": [
            {
                "name": "ownerDID",
                "type": "string"
            }
        ],
        "name": "getVehicles",
        "outputs": [
            {
                "name": "",
                "type": "string[]"
            },
            {
                "name": "",
                "type": "uint256[]"
            },
            {
                "name": "",
                "type": "uint256[]"
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
                "name": "ownerDID",
                "type": "string"
            },
            {
                "name": "vehicleDID",
                "type": "string"
            },
            {
                "name": "lockAmount",
                "type": "uint256"
            },
            {
                "name": "lockTime",
                "type": "uint8"
            }
        ],
        "name": "lockCoins",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    }
]