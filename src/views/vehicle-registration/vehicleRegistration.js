//jshint esversion:8
import React from 'react'
import Antenna from "iotex-antenna";
import {readLog} from "../helperFunctions";
import { Contract } from "iotex-antenna/lib/contract/contract";
import { ABI } from './ABI'
import Web3 from 'web3'
import contractInfo from "../did-registration/did-contract-details";
import eventABI from "./vehicleEventABIs";
import {toRau} from "iotex-antenna/lib/account/utils";
import AnimateHeight from 'react-animate-height'

let CONTRACT_ADDRESS = 'io1s3eflxnjpteqspnp3xs5nj9rwyu9cac7a5qjek';
let contract;
let antenna
let unlockedWallet

export class VehicleRegistration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vehiclePrivateKey: '',
            ownerPrivateKey: '',
            proofOwnerDID: '',
            signedMessage: {},
            lockTime: 1,
            timeUnit: 1,
            ownerDID: '',
            vehicleDID: '',
            proof: '',
            getVehiclesOwnerDID: '',
            vehicles: [],
            height: 0
        };
    }

    async componentDidMount() {
        antenna = new Antenna("http://api.testnet.iotex.one:80");

        contract = new Contract(
            ABI,
            CONTRACT_ADDRESS,
            {
                provider: antenna.iotx
            }
        );
    }

    signProof = async (e, ownerDID, vehiclePK) => {
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
        let message = `${ownerDID.split(":")[2].toLowerCase()} is the owner of the device ${did.toLowerCase()}`
        let signedMessage = await web3.eth.accounts.sign(message, vehiclePK);
        let signed = await wallet.sign(message, vehiclePK)
        console.log(Buffer.from(signed).toString('hex'))

        console.log(signedMessage)
        this.setState({signedMessage})
    }

    registerVehicle = async (e, ownerDID, vehicleDID, lockTime) => {
        e.preventDefault()
        let wallet = await antenna.iotx.accounts.privateKeyToAccount(
                    this.state.ownerPrivateKey
                );
        try {
            let actionHash = await contract.methods.registerVehicle(ownerDID, vehicleDID, lockTime, {
                amount: toRau("0.1", "iotx"),
                account: wallet,
                gasLimit: "1000000",
                gasPrice: toRau("1", "Qev")
            });
            console.log(actionHash);
            //wait till the block is mined
            window.setTimeout(async () => {
                let log = await readLog(eventABI.RegisterEvent, actionHash, antenna);
                console.log(log);
                //this.setState({didResult: {id: did, uri: arweaveURL, doc}});

            }, 11000)

        } catch (err) {
            console.log(err);
        }
    };

    getVehicles = async (e) => {
        e.preventDefault()
        try {
            let res = await antenna.iotx.readContractByMethod({
                from: "io1y3cncf05k0wh4jfhp9rl9enpw9c4d9sltedhld", // It doesn't matter who its from, only the DID (but we still need it here because of the function definition)
                contractAddress: CONTRACT_ADDRESS,
                abi: ABI,
                method: "getVehicles"
            }, this.state.getVehiclesOwnerDID);

            let vehicles = []
            // Output dids are mangled, need to find their locations inside the output string and extract them
            let regex = /did:io:/gi, result, dids = [];
            while ( (result = regex.exec(res[0][0])) ) {
                dids.push(res[0][0].substr(result.index, 49));
            }
            // Prepare info for table
            for (let i = 0; i < res[0].length ; i++) {
                let tmp = {}
                tmp['did'] = dids[i]
                tmp['amount'] = res[1][i].toString()
                tmp['expiry'] = res[2][i].toString()
                vehicles.push(tmp)
            }
            this.setState({vehicles, height:'auto'})
        } catch (err) {
            console.log(err);
        }
    }

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
                {/*<div className='card my-3'>*/}
                {/*    <div className='card-header'>Sign message to get proof of registration</div>*/}
                {/*    <div className='card-body'>*/}
                {/*        <div className="form-row">*/}
                {/*            <div className="form-group col-md">*/}
                {/*                <label htmlFor="inputOwnerDID">Owner DID</label>*/}
                {/*                <input type="text" className="form-control" id="inputOwnerDID"*/}
                {/*                       placeholder="did:io:0x9fdh74hkjfd..." onChange={(e) => this.setState({proofOwnerDID: e.target.value})}/>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*        <div className="form-row">*/}
                {/*            <div className="form-group col-md">*/}
                {/*                <label htmlFor="inputOwnerDID">Vehicle Private Key</label>*/}
                {/*                <input type="text" className="form-control" id="inputOwnerDID"*/}
                {/*                       placeholder="a5fg83031D1113aD414..." onChange={(e) => this.setState({vehiclePrivateKey: e.target.value})}/>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*        <div ><pre ><code placeholder='I authorize 0x03f3030fkdmklsd... to register the device did:io:0xfk4j389dslkfd...' aria-readonly='true'></code>{this.state.signedMessage.signature}</pre></div>*/}
                {/*        <button className='button' onClick = {e => this.signProof(e, this.state.proofOwnerDID, this.state.vehiclePrivateKey)}>Sign</button>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className='card my-3'>
                    <div className='card-header'>
                        Register a new vehicle
                    </div>
                    <div className='card-body'>
                        <form>
                            <div className="row">
                                <div className="col">
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputOwnerDID">Owner DID</label>
                                            <input type="text" className="form-control" id="inputOwnerDID"
                                                   placeholder="did:io:0x583031D1113aD414..." onChange={e => this.setState({ownerDID: e.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputEmailDID">Vehicle DID</label>
                                            <input type="text" className="form-control" id="inputEmailDID"
                                                   placeholder="did:io:0xCA35b7d915458EV..." onChange={e => this.setState({vehicleDID: e.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="lockTime">Lock Time</label>
                                            <div className="input-group">
                                                <input id="lockTime" type="text" className="form-control" placeholder="1"
                                                       aria-label="Text input with dropdown button" onChange={e => this.setState({lockTime: e.target.value})}/>
                                                <div className="input-group-append">
                                                    <select className="custom-select" required onChange={e => this.setState({timeUnit: e.target.value})}>
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
                                    <div className="form-row">
                                        <div className="form-group col-md">
                                            <label htmlFor="inputEmailDID">Owner Private Key</label>
                                            <input type="text" className="form-control" id="inputEmailDID"
                                                   placeholder="35b7d915458EVLkjdFK6Lp5f434..." onChange={e => this.setState({ownerPrivateKey: e.target.value})}/>
                                        </div>
                                    </div>
                                    {/*<div className="form-group">*/}
                                    {/*    <label htmlFor="proof">Proof of authorisation</label>*/}
                                    {/*    <textarea rows='4' type="text" className="form-control" id="proof"*/}
                                    {/*              placeholder="eb327129a2a38141d275f4d68e...6edc9be437eed250ba6f71be05620ea1a3c971367bc1c" onChange={e => this.setState({proof: e.target.value})}></textarea>*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" onClick={e => this.registerVehicle(e, this.state.ownerDID, this.state.vehicleDID, this.state.lockTime * this.state.timeUnit, this.state.proof)}>Register</button>
                        </form>
                    </div>
                </div>
                <div className='card my-3'>
                    <div className='card-header'>View registered vehicles</div>
                    <div className='card-body'>
                    <AnimateHeight duration={500} height={this.state.height}>
                        {
                            <table className="table">
                                <thead className="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Vehicle DID</th>
                                    <th scope="col">Stake Amount</th>
                                    <th scope="col">Expiry Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.vehicles.map((currentElement, i) => (
                                    <tr>
                                        <th scope="row">{i + 1}</th>
                                        <td>{currentElement.did}</td>
                                        <td>{currentElement.amount / 1e18} IOTX</td>
                                        <td>{new Date(currentElement.expiry * 1000).toLocaleString()}</td>
                                    </tr>
                                ))
                                }
                                </tbody>
                            </table>
                        }
                    </AnimateHeight>
                        <div className="form-row">
                            <div className="form-group col-md">
                                <label htmlFor="inputOwnerDID">Owner DID</label>
                                <input type="text" className="form-control" id="inputOwnerDID"
                                       placeholder="did:io:0x583031D1113aD414..." onChange={e => this.setState({getVehiclesOwnerDID: e.target.value})}/>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" onClick={this.getVehicles}>Submit</button>
                    </div>
                </div>

                </div>
        );
    }
}





