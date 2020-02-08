import React from 'react'
import Antenna from "iotex-antenna";
import {
    Contract
} from "iotex-antenna/lib/contract/contract";
import Web3 from "web3";
import contractInfo from "./did-contract-details";
import eventABI from "./did-event-abis";
import {readLog, generateDocument, saveToArweave} from "../helperFunctions";

let unlockedWallet;
let contract;
let antenna;
export class RegisterDID extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            privateKey: '',
            didHash: '',
            didURI: '',
            pebbleIMEI: '',
            vehicleType: 'Car (petrol)',
            pebblePrivateKey: '',
            creatorDID: '',
            showModal: false,
            didResult: {},
            vehicleDidResult: {},
            entity: ''
        };
    }

    async componentDidMount() {
            //connect to the test network
            antenna = new Antenna("http://api.testnet.iotex.one:80");

            //USER'S IOTEX PRIVATE KEY
            //did:io:0xd29694ef9654e7296ebbfcfd7f5aba2050fc0b80
            unlockedWallet = await antenna.iotx.accounts.privateKeyToAccount(
                "450a9968f2fb740a3eee34a870d79c5c991159d86d6600b5e924b81cdd23c57b"
            );

            //connect to the DIDsmartcontract
            contract = new Contract(contractInfo.abi, contractInfo.contractAddress, {
                provider: antenna.iotx
            });
            this.remindDID("eec04109aab7af268a1158b88717bd6f62026895920aeb296d4150a7a309dec8")
    };


//returns the account details of the user
getAccountDetails = async () => {
        return await antenna.iotx.getAccount({
            address: unlockedWallet.address
        });
    };

//returns the didString of the caller
 remindDID = async (privateKey) => {
     unlockedWallet = await antenna.iotx.accounts.privateKeyToAccount(
         privateKey
     );
    try {
        let did = await antenna.iotx.readContractByMethod({
            from: unlockedWallet.address,
            contractAddress: contractInfo.contractAddress,
            abi: contractInfo.abi,
            method: "remindDIDString"
        });
        console.log(did);
        return did;
    } catch (err) {
        console.log(err);
    }

};


//returns timestamp
 getTimeStamp = async (actionHash) => {
    try {
        const action = await antenna.iotx.getActions({
            byHash: {
                actionHash: actionHash,
                checkingPending: true
            }
        });

        console.log(JSON.stringify(action.actionInfo[0].timestamp));
        return JSON.stringify(action.actionInfo[0].timestamp);
    } catch (err) {
        console.log(err);
    }

};


//given the documentHash, uri, imei(optional), createsDID
// and returns the actionHash(the address of the transaction)
//emits evnet
createDID = async (e, entity, privateKey) => {
    e.preventDefault();
    let wallet = await antenna.iotx.accounts.privateKeyToAccount(
        privateKey
    );
    let did = await antenna.iotx.readContractByMethod({
        from: wallet.address,
        contractAddress: contractInfo.contractAddress,
        abi: contractInfo.abi,
        method: "remindDIDString"
    });
    let doc = generateDocument(entity, did);
    let arweaveURL = await saveToArweave(doc);
    let docHash = Web3.utils.keccak256(doc);

    try {
        let actionHash = await contract.methods.createDID(docHash, arweaveURL, "", {
            account: wallet,
            gasLimit: "1000000",
            gasPrice: "1000000000000"
        });
        console.log(actionHash);
        //wait till the block is mined
        window.setTimeout(async () => {
            //READ LOG
            //IF YOU READ LOG too early before the createDID's transaction is approved, we get an err,
            let log = await readLog(eventABI.createEvent, actionHash, antenna);
            console.log("LOG when new did is created: ", log);
            this.setState({didResult: {id: did, uri: arweaveURL, doc}});
            return log.didString;

        }, 11000)

    } catch (err) {
        console.log(err);
    }

};


    createVehicleDID = async (e, vehicleType, imei) => {
        e.preventDefault();
        let pebbleWallet = await antenna.iotx.accounts.privateKeyToAccount(
            this.state.pebblePrivateKey
        );
        let did = await antenna.iotx.readContractByMethod({
            from: pebbleWallet.address,
            contractAddress: contractInfo.contractAddress,
            abi: contractInfo.abi,
            method: "remindDIDString"
        });
        let doc = generateDocument("Device", this.state.creatorDID, imei, vehicleType, did);
        let arweaveURL = await saveToArweave(doc);
        let docHash = Web3.utils.keccak256(doc);
        console.log(docHash);

        try {
            let actionHash = await contract.methods.createDID(docHash, arweaveURL, imei, {
                account: pebbleWallet,
                gasLimit: "1000000",
                gasPrice: "1000000000000"
            });
            //wait till the block is mined
            window.setTimeout(async () => {
                //READ LOG
                //IF YOU READ LOG too early before the createDID's transaction is approved, we get an err,
                let log = await readLog(eventABI.createEvent, actionHash, antenna);
                console.log("LOG when new did is created: ", log);
                this.setState({vehicleDidResult: {id: did, uri: arweaveURL, doc}});
                return log.didString;

            }, 11000)

        } catch (err) {
            console.log(err);
        }

    };

//given didString and the updated documentHash,
//updates hash of the did and returns the actionHash
//emits event
updateHash = async (didString, documentHash) => {
    try {
        let actionHash = await contract.methods.updateHash(didString, documentHash, {
            account: unlockedWallet,
            gasLimit: "1000000",
            gasPrice: "1000000000000"
        });
        return actionHash;
    } catch (err) {
        console.log(err);
    }
};

//same as above but updates uri
updateURI = async (didString, documentURI) => {
    try {
        let actionHash = await contract.methods.updateURI(didString, documentURI, {
            account: unlockedWallet,
            gasLimit: "1000000",
            gasPrice: "1000000000000"
        });
        return actionHash;
    } catch (err) {
        console.log(err);
    }
};

//deleteDID only if it was sent by the owner
//returns the actionHash if successful
//emits event
deleteDID = async (didString) => {
    try {
        let actionHash = await contract.methods.deleteDID(didString, {
            account: unlockedWallet,
            gasLimit: "1000000",
            gasPrice: "1000000000000"
        });
        return actionHash;
    } catch (err) {
        console.log(err);
    }
};

//given the didstring, returns hash
getHash = async (didString) => {
    try {
        let hash = await antenna.iotx.executeContract({
            from: unlockedWallet.address,
            contractAddress: contractInfo.contractAddress,
            abi: contractInfo.abi,
            method: "getHash"
        }, didString);

        return "0x" + hash.toString('hex');
    } catch (err) {
        console.log(err);
    }
};

//given the didstring, returns hash
getURI = async (didString) => {
    let uri = await antenna.iotx.readContractByMethod({
        from: unlockedWallet.address,
        contractAddress: contractInfo.contractAddress,
        abi: contractInfo.abi,
        method: "getURI"
    }, didString);
    return uri.toString('hex');
};

//get document from IMEI
//assuming imei is all uniquie
getDocUriFromImei = async (imei) => {
    try {
        let uri = await antenna.iotx.executeContract({
            from: unlockedWallet.address,
            contractAddress: contractInfo.contractAddress,
            abi: contractInfo.abi,
            method: "getDocumentUriFromIMEI"
        }, imei);
        return uri.toString('hex');
    } catch (err) {
        console.log(err);
    }
};

    render() {
        return (
            <div className='container'>
                <button onClick={e => this.setState({showModal: true})}></button>
                <div className='card my-3'>
                    <div className='card-header'><h3>Create a DID for yourself or your company</h3>
                    </div>
                    <div className='card-body'>
                        <form>
                            <div className="row">
                                <div className="col">
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputOwnerDID">Entity (Individual, Corporate (Company name))</label>
                                            <input type="text" className="form-control"
                                                   placeholder="Individual" onChange={event => this.setState({entity: event.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputOwnerDID">Private Key</label>
                                            <input type="text" className="form-control"
                                                   placeholder="dc435df3531zd315713aD414..." onChange={event => this.setState({privateKey: event.target.value})}/>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" onClick={e => this.createDID(e, this.state.entity, this.state.privateKey)}>Register</button>

                                </div>
                                <div className="col">
                                    <div>
                                        <div>DID: {this.state.didResult.id}</div>
                                        <div>DID Document URI: {this.state.didResult.uri}</div>
                                        <div>DID Document: <code><pre>{this.state.didResult.doc}</pre></code></div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className='card my-3'>
                    <div className='card-header'><h3>Create a DID for a vehicle</h3>
                    </div>
                    <div className='card-body'>
                        <form>
                            <div className="row">
                                <div className="col">
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputEmailDID">Creator's DID</label>
                                            <input type="text" className="form-control"
                                                   placeholder="did:io:0x9ddj383jalk..." onChange={event => this.setState({creatorDID: event.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="input-group mb-3">
                                            <div className="input-group-prepend">
                                                <label className="input-group-text"
                                                       htmlFor="inputGroupSelect01">Vehicle Type</label>
                                            </div>
                                            <select className="custom-select" id="inputGroupSelect01" onChange={e => this.setState({vehicleType: e.target.value})}>
                                                <option selected value='Car (petrol)' >Car (petrol)</option>
                                                <option value="Car (diesel)">Car (diesel)</option>
                                                <option value="Car (electric)">Car (electric)</option>
                                                <option value="Lorry">Lorry</option>
                                                <option value="Ship">Ship</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputEmailDID">Pebble IMEI</label>
                                            <input type="text" className="form-control"
                                                   placeholder="990000862471854" onChange={event => this.setState({pebbleIMEI: event.target.value})}/>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" onClick={e => this.createVehicleDID(e, this.state.vehicleType, this.state.pebbleIMEI)}>Register</button>

                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label>Vehicle Private Key</label>
                                        <textarea rows='7' type="text" className="form-control" id="proof"
                                                  placeholder="0xeb327129a2a38141d275f4d68e...6edc9be437eed250ba6f71be05620ea1a3c971367bc1c" onChange={e => this.setState({pebblePrivateKey: e.target.value})}></textarea>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div>
                            <div>DID: {this.state.vehicleDidResult.id}</div>
                            <div>DID Document URI: {this.state.vehicleDidResult.uri}</div>
                            <div>DID Document: <code><pre>{this.state.vehicleDidResult.doc}</pre></code></div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}