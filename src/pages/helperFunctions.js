//Decode a log, given the abi and actionHash
import Web3 from "web3";
import Arweave from "arweave/web";
import jwk from "./ArweaveKey.json";

// Reads log emitted by smart contract
export const readLog = async (abi, actionHash, antenna) => {
    const web3 = new Web3();
    try {
        const receipt = await antenna.iotx.getReceiptByAction({
            actionHash: actionHash
        });
        console.log(receipt)
        let log = receipt.receiptInfo.receipt.logs[0];
        let decodedData = Buffer.from(log.data).toString('hex');
        console.log(decodedData)

        let decodedTopics = [];
        log.topics.forEach(element => {
            decodedTopics.push(Buffer.from(element).toString('hex'));
        });

        let decodedLog = await web3.eth.abi.decodeLog(abi, decodedData, decodedTopics);
        return decodedLog;
    } catch (err) {
        console.log(err);
    }

};

export const htmlIDFromDID = ( DID ) => {
  return DID.replace(/:/g, '-');
}

export const didFromHTMLID = ( htmlID ) => {
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

    return JSON.stringify(document, null, 2);
};

//Saves a document to Arweave and returns the url that will point to it
export const saveToArweave = async (document) => {

    // Initialize Arweave
    let arw = Arweave.init({
        host: 'arweave.net', // Hostname or IP address for a Arweave host
        port: 443, // Port
        protocol: 'https', // Network protocol http or https
        timeout: 20000, // Network request timeouts in milliseconds
        logging: false, // Enable network request logging
    });

    let arweaveURL;
    try {
        // Create new transaction
        let transaction = await arw.createTransaction({
            data: document
        }, jwk);

        // Document to be rendered as txt
        transaction.addTag('Content-Type', 'text/plain');

        // Sign transaction
        await arw.transactions.sign(transaction, jwk);

        // Submit transaction
        try {
            await arw.transactions.post(transaction);
        } catch (err) {
            console.log("Error occurred on submit: ", err);
        }

        arweaveURL = "https://arweave.net/tx/" + transaction.id + "/data.txt";
        return Promise.resolve(arweaveURL);
    } catch (err) {
        return Promise.reject(err);
    }

};
