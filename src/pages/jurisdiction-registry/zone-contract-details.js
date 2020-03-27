//deployer: 0xaf6c60f9569a5957b9e8679d7178b0e15e462e72
module.exports = {
    address: "0x71C91Bd9773EEedd706C4d4e73c48f7344C10738", //<- fresh deployment | Leos -> "0xf6f64cbe7b1928fc5299f11a14cb2150efd6919d",
    abi: [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "firstRegisterer",
                type: "address"
            }
        ],
        name: "Appended",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "caller",
                type: "address"
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "hash",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "string",
                name: "uri",
                type: "string"
            }
        ],
        name: "CreateDID",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "caller",
                type: "address"
            }
        ],
        name: "DeleteDID",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "caller",
                type: "address"
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "hash",
                type: "bytes32"
            }
        ],
        name: "UpdateHash",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "caller",
                type: "address"
            },
            {
                indexed: false,
                internalType: "string",
                name: "uri",
                type: "string"
            }
        ],
        name: "UpdateURI",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "_hash",
                type: "bytes32"
            },
            {
                internalType: "string",
                name: "_uri",
                type: "string"
            }
        ],
        name: "register",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_toBeDeleted",
                type: "address"
            }
        ],
        name: "deregister",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_addr",
                type: "address"
            }
        ],
        name: "getURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        stateMutability: "view",
        type: "function",
        constant: true
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_addr",
                type: "address"
            }
        ],
        name: "isRegistered",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "view",
        type: "function",
        constant: true
    },
    {
        inputs: [],
        name: "getExistingDIDs",
        outputs: [
            {
                components: [
                    {
                        internalType: "bool",
                        name: "exist",
                        type: "bool"
                    },
                    {
                        internalType: "bytes32",
                        name: "hash",
                        type: "bytes32"
                    },
                    {
                        internalType: "string",
                        name: "uri",
                        type: "string"
                    }
                ],
                internalType: "struct ZoneRegistry.DID[]",
                name: "",
                type: "tuple[]"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_addr",
                type: "address"
            }
        ],
        name: "getHash",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function",
        constant: true
    },
    {
        inputs: [],
        name: "getExistingAddrs",
        outputs: [
            {
                internalType: "address[]",
                name: "",
                type: "address[]"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    }
]
}
