import React from 'react'
import {readLog, generateDocument, saveToArweave} from "../helperFunctions";
import Footer from "../../components/Layout/Footer";
import Topbar from "../../components/Layout/Topbar";
import {Spinner} from "react-bootstrap";

// Mock implementations
const mockAntenna = {
    iotx: {
        accounts: {
            privateKeyToAccount: (privateKey) => ({
                address: `io1${privateKey.slice(0, 40)}`,
                sign: () => Promise.resolve(Buffer.from('mock-signature', 'hex'))
            })
        }
    }
};

const mockContract = {
    methods: {
        addDID: () => Promise.resolve("0xmockhash"),
        remindDIDString: () => Promise.resolve("did:io:0xmockdid")
    }
};

const mockToRau = (amount, unit) => `${amount}000000000000000000`;

let unlockedWallet = { address: "io1mockwallet" };
let contract = mockContract;
let antenna = mockAntenna;

function Loader() {
    return (
        <div>
            <div className='mb-4 d-flex justify-content-center'>
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
            <div>This should take around 10 seconds.</div>
        </div>

    );
}

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
            entity: 'Individual',
            isPrivateVehicle: false,
            createSelfDidLoaded: false,
            createSelfDidLoading: false,
            createVehicleDidLoaded: false,
            createVehicleDidLoading: false,
        };
    }

    async componentDidMount() {
        // Dismiss loading bar
        document.getElementById("pageLoader").style.display = "block";
        setTimeout(function () {
            document.getElementById("pageLoader").style.display = "none";
        }, 1000);
        // Navbar
        document.body.classList = ""
        document.getElementById('topnav').classList.add('bg-white');
        window.addEventListener("scroll", this.scrollNavigation, true);

        //connect to mock network
        antenna = mockAntenna;

        //connect to mock DID smart contract
        contract = mockContract;

    };

    scrollNavigation = () => {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        if (top > 80) {
            document.getElementById('topnav').classList.add('nav-sticky');
        } else {
            document.getElementById('topnav').classList.remove('nav-sticky');
        }
    }

    // Make sure to remove the DOM listener when the component is unmounted.
    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollNavigation);
    }

//returns mock account details
    getAccountDetails = async () => {
        return Promise.resolve({
            address: unlockedWallet.address,
            balance: "1000000000000000000"
        });
    };

//returns mock DID string
    remindDID = async (privateKey) => {
        unlockedWallet = await antenna.iotx.accounts.privateKeyToAccount(privateKey);
        try {
            let did = `did:io:0x${privateKey.slice(0, 40)}`;
            console.log(did);
            return did;
        } catch (err) {
            console.log(err);
        }
    };


//given the documentHash, uri, imei(optional), createsDID
// and returns the actionHash(the address of the transaction)

    createDID = async (e, entity, privateKey) => {
        e.preventDefault();
        await this.setState({createSelfDidLoading: true})
        let wallet = await antenna.iotx.accounts.privateKeyToAccount(privateKey);
        let did = `did:io:0x${privateKey.slice(0, 40)}`;
        let doc = generateDocument(entity, did);
        let arweaveURL = await saveToArweave(doc);
        let docHash = `0x${Math.random().toString(36).substring(7)}`; // Mock hash

        try {
            let actionHash = await contract.methods.addDID(docHash, arweaveURL, "");
            console.log(actionHash);
            window.setTimeout(async () => {
                let log = await readLog({}, actionHash, antenna);
                console.log("LOG when new did is created: ", log);
                await this.setState({
                    didResult: {id: did, uri: arweaveURL, doc},
                    createSelfDidLoaded: true,
                    createSelfDidLoading: false,
                    createSelfDidError: null
                });
                return did;
            }, 3000) // Reduced delay for demo

        } catch (err) {
            this.setState({createSelfDidLoading: false})
            console.log(err)
        }
    };


    createVehicleDID = async (e, vehicleType, imei) => {
        e.preventDefault();
        await this.setState({createVehicleDidLoading: true})

        let pebbleWallet = await antenna.iotx.accounts.privateKeyToAccount(this.state.pebblePrivateKey);
        let did = `did:io:0x${this.state.pebblePrivateKey.slice(0, 40)}`;
        let doc = generateDocument("Device", did, this.state.creatorDID, imei, vehicleType, this.state.isPrivateVehicle);
        let arweaveURL = await saveToArweave(doc);
        let docHash = `0x${Math.random().toString(36).substring(7)}`; // Mock hash

        try {
            let actionHash = await contract.methods.addDID(docHash, arweaveURL, imei);
            //wait till the block is mined
            window.setTimeout(async () => {
                let log = await readLog({}, actionHash, antenna);
                console.log("Event log: ", log);
                this.setState({
                    vehicleDidResult: {id: did, uri: arweaveURL, doc},
                    createVehicleDidLoaded: true,
                    createVehicleDidLoading: false
                });
                return did;
            }, 3000) // Reduced delay for demo

        } catch (err) {
            this.setState({createVehicleDidLoading: false})
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
            let actionHash = await contract.methods.updateURI(didString, documentURI);
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
            let actionHash = await contract.methods.deleteDID(didString);
            return actionHash;
        } catch (err) {
            console.log(err);
        }
    };

//given the didstring, returns mock hash
    getHash = async (didString) => {
        try {
            let hash = `0x${Math.random().toString(36).substring(7)}`;
            return hash;
        } catch (err) {
            console.log(err);
        }
    };

//given the didstring, returns mock URI
    getURI = async (didString) => {
        let uri = `https://arweave.net/tx/mock${Math.random().toString(36).substring(7)}/data.txt`;
        return uri;
    };

//get mock document from IMEI
    getDocUriFromImei = async (imei) => {
        try {
            let uri = `https://arweave.net/tx/mock${imei}/data.txt`;
            return uri;
        } catch (err) {
            console.log(err);
        }
    };

    render() {
        return (
            <React.Fragment>
                <div className='container'>
                    <Topbar/>
                    <div className='card' style={{marginTop: '100px', marginBottom: '3rem'}}>
                        <div className='card-header'>Create a DID for yourself or your company
                        </div>
                        <div className='card-body'>
                            <form>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="form-row">
                                            <div className="form-group col-md">
                                                <label htmlFor="inputOwnerDID">Entity (Individual, Corporate (Company
                                                    name))</label>
                                                <input type="text" className="form-control"
                                                       placeholder="Individual"
                                                       onChange={event => this.setState({entity: event.target.value})}/>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md">
                                                <label htmlFor="inputOwnerDID">Private Key</label>
                                                <input type="text" className="form-control"
                                                       placeholder="dc435df3531zd315713aD414..."
                                                       onChange={event => this.setState({privateKey: event.target.value})}/>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary"
                                                onClick={e => this.createDID(e, this.state.entity, this.state.privateKey)}>Register
                                        </button>

                                    </div>
                                    {this.state.createSelfDidLoading ? (
                                        <div className='col-6 d-flex justify-content-center'>
                                            <div className='mb-4'>
                                                <Loader/>
                                            </div>
                                        </div>) : <div></div>}
                                    {
                                        this.state.createSelfDidLoaded ? (
                                            <div className="col-6">
                                                <div>
                                                    <div>DID: {this.state.didResult.id}</div>
                                                    <div>DID Document URI: {this.state.didResult.uri}</div>
                                                    <div>DID Document: <code>
                                                        <pre>{this.state.didResult.doc}</pre>
                                                    </code></div>
                                                </div>
                                            </div>
                                        ) : <div></div>
                                    }
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className='card my-3'>
                        <div className='card-header'>Create a DID for a vehicle
                        </div>
                        <div className='card-body'>
                            <form>
                                <div className="row">
                                    <div className="col">
                                        <div className="form-row">
                                            <div className="form-group col-md">
                                                <label htmlFor="inputEmailDID">Creator's DID</label>
                                                <input type="text" className="form-control"
                                                       placeholder="did:io:0x9ddj383jalk..."
                                                       onChange={event => this.setState({creatorDID: event.target.value})}/>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="input-group mb-3">
                                                <div className="input-group-prepend">
                                                    <label className="input-group-text"
                                                           htmlFor="inputGroupSelect01">Vehicle Type</label>
                                                </div>
                                                <select className="custom-select" id="inputGroupSelect01"
                                                        onChange={e => this.setState({vehicleType: e.target.value})}>
                                                    <option selected value='Car (petrol)'>Car (petrol)</option>
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
                                                       placeholder="990000862471854"
                                                       onChange={event => this.setState({pebbleIMEI: event.target.value})}/>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className='switch'>
                                                <input
                                                    type='checkbox'
                                                    onClick={e => {
                                                        this.setState({
                                                            isPrivateVehicle: this.state.isPrivateVehicle === false ? true : false
                                                        });
                                                    }}
                                                />
                                                <span className='slider round'/>
                                            </label>
                                            <span style={{marginLeft: "8px", marginTop: "4rem"}}>
                                          Is Private Vehicle
                                        </span>
                                        </div>
                                        <button className="btn btn-primary mb-3"
                                                onClick={e => this.createVehicleDID(e, this.state.vehicleType, this.state.pebbleIMEI)}>Register
                                        </button>

                                    </div>
                                    <div className="col">
                                        <div className="form-group">
                                            <label>Vehicle Private Key</label>
                                            <textarea rows='7' type="text" className="form-control" id="proof"
                                                      placeholder="0xeb327129a2a38141d275f4d68e...6edc9be437eed250ba6f71be05620ea1a3c971367bc1c"
                                                      onChange={e => this.setState({pebblePrivateKey: e.target.value})}></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            {this.state.createVehicleDidLoading ? (
                                <div className='d-flex justify-content-center'>
                                    <div className='mb-4'>
                                        <Loader/>
                                    </div>
                                </div>) : <div></div>}
                            {this.state.createVehicleDidLoaded ? (
                                <div>
                                    <div>DID: {this.state.vehicleDidResult.id}</div>
                                    <div>DID Document URI: {this.state.vehicleDidResult.uri}</div>
                                    <div>DID Document: <code>
                                        <pre>{this.state.vehicleDidResult.doc}</pre>
                                    </code>
                                    </div>
                                </div>
                            ) : <div></div>}

                        </div>
                    </div>

                </div>
                <Footer/>

            </React.Fragment>

        );
    }
}