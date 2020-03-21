module.exports = {
    contractAddress: "0x26decD988682044Abf9F1d65Ab8402994e7952f1",
    abi: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "firstRegisterer",
                    "type": "address"
                }
            ],
            "name": "Appended",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "caller",
                    "type": "address"
                }
            ],
            "name": "DeleteDID",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "toBeDeleted",
                    "type": "address"
                }
            ],
            "name": "deregister",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getAddrs",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "_hash",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "_uri",
                    "type": "string"
                }
            ],
            "name": "register",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "caller",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "hash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "uri",
                    "type": "string"
                }
            ],
            "name": "Register",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "caller",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bytes32",
                    "name": "hash",
                    "type": "bytes32"
                }
            ],
            "name": "UpdateHash",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "caller",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "uri",
                    "type": "string"
                }
            ],
            "name": "UpdateURI",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "getHash",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_addr",
                    "type": "address"
                }
            ],
            "name": "getURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};