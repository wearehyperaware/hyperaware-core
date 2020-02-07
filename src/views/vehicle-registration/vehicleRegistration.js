//jshint esversion:8
import React from 'react'
import Antenna from "iotex-antenna";
import {readLog} from "../helperFunctions";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { ABI } from './ABI'
import Web3 from 'web3'
import contractInfo from "../did-registration/did-contract-details";
import eventABI from "../did-registration/did-event-abis";

let CONTRACT_ADDRESS = 'io1ftqh5ra9sder46nug7ed6g39azejwa2q520083';
let unlockedWallet;
let contract;
let antenna
export class VehicleRegistration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ownerIotexAddress: '',
            vehiclePrivateKey: '',
            signedMessage: {}
        };
    }

    async componentDidMount() {
        antenna = new Antenna("http://api.testnet.iotex.one:80");

        unlockedWallet = await antenna.iotx.accounts.privateKeyToAccount("eec04109aab7af268a1158b88717bd6f62026895920aeb296d4150a7a309dec8")
        contract = new Contract(
            ABI,
            CONTRACT_ADDRESS,
            {
                provider: antenna.iotx
            }
        );
    }

    signProof = async (e, ownerAddress, vehiclePK) => {
        e.preventDefault()
        let web3 = new Web3()
        let did

        let wallet = await antenna.iotx.accounts.privateKeyToAccount(
            vehiclePK
        );
        try {
                did = await antenna.iotx.readContractByMethod({
                from: wallet.address,
                contractAddress: contractInfo.contractAddress,
                abi: contractInfo.abi,
                method: "remindDIDString"
            });
        } catch (err) {
            console.log(err);
        }
        let message = `${ownerAddress.toLowerCase()} is the owner of the device ${did.toLowerCase()}`
        let signedMessage = await web3.eth.accounts.sign(message, vehiclePK);
        console.log(signedMessage)
        this.setState({signedMessage})
    }

    registerVehicle = async (ownerDID, vehicleDID, lockTime, proof) => {
        try {
            let actionHash = await contract.methods.registerVehicle(ownerDID, vehicleDID, lockTime, proof, {
                account: unlockedWallet,
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
                //this.setState({didResult: {id: did, uri: arweaveURL, doc}});
                return log.didString;

            }, 11000)

        } catch (err) {
            console.log(err);
        }
    };

    withdrawStake = async (ownerDID, vehicleDID, withdrawAmount) => {
        try {
            let actionHash = await contract.methods.updateHash(ownerDID, vehicleDID, withdrawAmount, {
                account: unlockedWallet.address,
                gasLimit: "500000000",
                gasPrice: "1"
            });
            return actionHash;
        } catch (err) {
            console.log(err);
        }
    };

    listRegisteredVehicles = async (ownerDID) => {
        try {
            let actionHash = await contract.methods.updateHash(ownerDID, {
                account: unlockedWallet.address,
                gasLimit: "500000000",
                gasPrice: "1"
            });
            return actionHash;
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        return (
            <div className='container'>
                <div className='card my-3'>
                    <div className='card-header'>Sign message to get proof of registration</div>
                    <div className='card-body'>
                        <div className="form-row">
                            <div className="form-group col-md">
                                <label htmlFor="inputOwnerDID">Owner IoTeX Address</label>
                                <input type="text" className="form-control" id="inputOwnerDID"
                                       placeholder="io1flfje583031D1113aD414..." onChange={(e) => this.setState({ownerIotexAddress: e.target.value})}/>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md">
                                <label htmlFor="inputOwnerDID">Vehicle Private Key</label>
                                <input type="text" className="form-control" id="inputOwnerDID"
                                       placeholder="did:io:0x583031D1113aD414..." onChange={(e) => this.setState({vehiclePrivateKey: e.target.value})}/>
                            </div>
                        </div>
                        <div ><pre ><code placeholder='I authorize 0x03f3030fkdmklsd... to register the device did:io:0xfk4j389dslkfd...' aria-readonly='true'></code>{this.state.signedMessage.signature}</pre></div>
                        <button className='button' onClick = {e => this.signProof(e, this.state.ownerIotexAddress, this.state.vehiclePrivateKey)}>Sign</button>
                    </div>
                </div>
                <div className='card'>
                    <div className='card-body'>
                        <form>
                            <div className="row">
                                <div className="col">
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputOwnerDID">Owner DID</label>
                                            <input type="text" className="form-control" id="inputOwnerDID"
                                                   placeholder="did:io:0x583031D1113aD414..."/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputEmailDID">Vehicle DID</label>
                                            <input type="text" className="form-control" id="inputEmailDID"
                                                   placeholder="did:io:0xCA35b7d915458EV..."/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="lockTime">Lock Time</label>
                                            <div className="input-group">
                                                <input id="lockTime" type="text" className="form-control" placeholder="1"
                                                       aria-label="Text input with dropdown button"/>
                                                <div className="input-group-append">
                                                    <select className="custom-select" required>
                                                        <option value="1">Minutes</option>
                                                        <option value="60">Hours</option>
                                                        <option value="1440">Days</option>
                                                        <option value="10080">Weeks</option>
                                                        <option value="43800">Months</option>
                                                        <option value="525600">Years</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="proof">Proof</label>
                                        <textarea rows='7' type="text" className="form-control" id="proof"
                                                  placeholder="0xeb327129a2a38141d275f4d68e...6edc9be437eed250ba6f71be05620ea1a3c971367bc1c"></textarea>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" onClick="registerVehicle()">Register</button>
                        </form>
                    </div>
                </div>

            </div>
        );
    }
}





