module.exports = {

    updateURIEvent: [{
        "indexed": false,
        "name": "didString",
        "type": "string"
    }, {
        "indexed": false,
        "name": "uri",
        "type": "string"
    }],

    updateHashEvent: [{
        "indexed": false,
        "name": "didString",
        "type": "string"
    }, {
        "indexed": false,
        "name": "hash",
        "type": "bytes32"
    }],

    createEvent: [{
        "indexed": false,
        "name": "id",
        "type": "string"
    }, {
        "indexed": false,
        "name": "didString",
        "type": "string"
    }],

    deleteEvent: [{
        "indexed": false,
        "name": "didString",
        "type": "string"
    }]


};