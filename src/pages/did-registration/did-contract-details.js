module.exports = {
    contractAddress: "io1zyksvtuqyxeadegsqsw6vsqrzr36cs7u2aa0ag",
    abi: [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "did",
                    "type": "string"
                },
                {
                    "name": "uri",
                    "type": "string"
                }
            ],
            "name": "updateURI",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "did",
                    "type": "string"
                }
            ],
            "name": "deleteDID",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "did",
                    "type": "string"
                }
            ],
            "name": "getHash",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "remindDIDString",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
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
                    "name": "did",
                    "type": "string"
                },
                {
                    "name": "hash",
                    "type": "bytes32"
                }
            ],
            "name": "updateHash",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "did",
                    "type": "string"
                }
            ],
            "name": "getURI",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
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
                    "name": "hash",
                    "type": "bytes32"
                },
                {
                    "name": "uri",
                    "type": "string"
                },
                {
                    "name": "imei",
                    "type": "string"
                }
            ],
            "name": "createDID",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "imei",
                    "type": "string"
                }
            ],
            "name": "getDocumentUriFromIMEI",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "id",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "didString",
                    "type": "string"
                }
            ],
            "name": "CreateDID",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "didString",
                    "type": "string"
                },
                {
                    "indexed": false,
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
                    "name": "didString",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "uri",
                    "type": "string"
                }
            ],
            "name": "UpdateURI",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "didString",
                    "type": "string"
                }
            ],
            "name": "DeleteDID",
            "type": "event"
        }
    ]
};