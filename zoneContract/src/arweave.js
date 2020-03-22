//document is a string
//returns url
const saveToArweave = async document => {
    // Initialize Arweave
    let arw = Arweave.init();
    let jwk = await $.getJSON("../ArweaveKey.json");
    let arweaveURL;
    try {
        // Create new transaction
        let transaction = await arw.createTransaction(
            {
                data: document
            },
            jwk
        );

        // Document to be rendered as txt
        transaction.addTag("Content-Type", "text/plain");

        // Sign transaction
        await arw.transactions.sign(transaction, jwk);

        // Submit transaction
        try {
            await arw.transactions.post(transaction);
        } catch (err) {
            console.log("Error occurred on submit: ", err);
        }

        arweaveURL = "https://arweave.net/tx/" + transaction.id + "/data.txt";
        console.log(arweaveURL);
        return Promise.resolve(arweaveURL);
    } catch (err) {
        return Promise.reject(err);
    }
};

const readDocument = async url => {
    try {
        let document = await $.get(url);
        return document;
    } catch (err) {
        return Promise.reject(err);
    }
};

window.saveToArweave = saveToArweave;
window.readDocument = readDocument;
