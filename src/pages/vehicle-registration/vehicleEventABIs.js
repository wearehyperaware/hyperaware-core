module.exports = {

    RegisterEvent: [{
        "indexed": false,
        "name": "ownerDid",
        "type": "string"
    }, {
        "indexed": false,
        "name": "vehicleDid",
        "type": "string"
    }, {
            "indexed": false,
            "name": "success",
            "type": "bool"
        }],

    WithdrawEvent: [{
        "indexed": false,
        "name": "withdrawAmount",
        "type": "uint256"
    }, {
        "indexed": false,
        "name": "success",
        "type": "bool"
    }],

    SlashEvent: [{
        "indexed": false,
        "name": "slashedhDid",
        "type": "string"
    }, {
        "indexed": false,
        "name": "slashAmount",
        "type": "uint256"
    }],

    GetVehiclesEvent: [{
        "indexed": false,
        "name": "ids",
        "type": "string[]"
    }, {
        "indexed": false,
        "name": "amounts",
        "type": "uint256[]"
    }, {
        "indexed": false,
        "name": "expires",
        "type": "uint256[]"
    }]

};