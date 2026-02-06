//Mock implementation for log reading
// import Web3 from "web3";
// import Arweave from "arweave/web";
// import jwk from "./ArweaveKey.json";

// Mock implementation - reads log emitted by smart contract
export const readLog = async (abi, actionHash, antenna) => {
    console.log("Mock readLog called with:", { abi, actionHash });
    // Return mock log data
    return Promise.resolve({
        mockLog: "true",
        actionHash: actionHash,
        event: "MockEvent"
    });
};

export const htmlIDFromDID = (DID) => {
    return DID.replace(/:/g, '-');
}

export const didFromHTMLID = (htmlID) => {
    return htmlID.replace(/-/g, ':');
}

//Creates did document
export const generateDocument = (entity, id, creator = "", imei = "", vehicleType = "", isPrivate = false) => {
    let document
    if (entity === "Device") {
        document = {
            "@context": "https://w3id.org/did/v1",
            "id": id,
            "created": new Date(),
            "entity": entity,
            "creator": creator,
            "vehicleType": vehicleType,
            "isPrivateVehicle": isPrivate,
            "imei": imei
        };
    } else {
        document = {
            "@context": "https://w3id.org/did/v1",
            "id": id,
            "created": new Date(),
            "entity": entity,
            "creator": creator,
        };
    }
    console.log(JSON.stringify(document, null, 2))
    return JSON.stringify(document, null, 2);
};

//Saves a document to Arweave and returns the url that will point to it
export const saveToArweave = async (document) => {
    // Mock implementation for development - returns a fake URL
    console.log("Mock Arweave save:", document);
    const mockId = Math.random().toString(36).substring(7);
    const arweaveURL = `https://arweave.net/tx/${mockId}/data.txt`;
    console.log("Mock Arweave URL:", arweaveURL);
    return Promise.resolve(arweaveURL);
};
