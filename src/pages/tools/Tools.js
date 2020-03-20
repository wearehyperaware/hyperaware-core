import React from 'react'
import Footer from "../../components/Layout/Footer";
import Topbar from "../../components/Layout/Topbar";
import AnimateHeight from "react-animate-height";
import Antenna from 'iotex-antenna'
import {toRau} from "iotex-antenna/lib/account/utils";

export class Tools extends React.Component {

    constructor(props) {
        super(props);
        let antenna = new Antenna(process.env.REACT_APP_ANTENNA_TESTNET_HOST);
        this.state = {
            accountsToCreate: 1,
            createdAccounts: [],
            height: 0,
            antenna
        };
    }


    componentDidMount() {
        // Dismiss loading bar
        document.getElementById("pageLoader").style.display = "block";
        setTimeout(function () { document.getElementById("pageLoader").style.display = "none"; }, 1000);

        // Navbar scrolling
        document.body.classList = ""
        document.getElementById('topnav').classList.add('bg-white');
        window.addEventListener("scroll", this.scrollNavigation, true);
    }

    scrollNavigation = () => {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        if(top > 80)
        {
            document.getElementById('topnav').classList.add('nav-sticky');
        }
        else
        {
            document.getElementById('topnav').classList.remove('nav-sticky');
        }
    }

    handleCreateAccounts = async (e) => {
        e.preventDefault()

        let senderWallet = this.state.antenna.iotx.accounts.privateKeyToAccount(
            process.env.REACT_APP_FAUCET_PRIVATE_KEY
        );
        let tmp = []
        let wallet
        for (let i = 0; i < this.state.accountsToCreate; i++) {
            wallet = await this.state.antenna.iotx.accounts.create()
            const actionHash = await this.state.antenna.iotx.sendTransfer({
                from: senderWallet.address,
                to: wallet.address,
                value: toRau("2", "iotx"),
                gasLimit: "100000",
                gasPrice: toRau("1", "Qev")
            });
            console.log("Sent 2 IOTX to", wallet.address, ". Hash: ", actionHash)
            tmp.push(wallet)
        }
        this.setState({createdAccounts: tmp, height: 'auto'})
    }

    render() {
        return (
            <React.Fragment>
                <Topbar />
                <div className='container'>
                    <div className='card' style={{marginTop: '100px', marginBottom: '3rem'}}>
                        <div className='card-header'>Create IoTeX Accounts
                        </div>
                        <div className='card-body'>
                            <form className='form-group'>
                                    <div className="input-group mb-3">
                                        <select className="custom-select form-control" id="inputGroupSelect01" onChange={e => this.setState({accountsToCreate: e.target.value})}>
                                            <option defaultValue='1' >Create 1 account</option>
                                            <option value="2">Create 2 accounts</option>
                                            <option value="3">Create 3 accounts</option>
                                            <option value="4">Create 4 accounts</option>
                                            <option value="5">Create 5 accounts</option>
                                        </select>
                                        <div className="input-group-append">
                                            <button className="btn btn-primary submitBnt"
                                                   htmlFor="inputGroupSelect01" onClick={this.handleCreateAccounts}>Create</button>
                                        </div>
                                    </div>
                                    <div>
                                        <p>Generate IoTeX testnet accounts to register DIDs and Vehicles with. Each account generated is automatically sent 2 IOTX.</p>
                                    </div>
                                    <div className="col">
                                        <AnimateHeight duration={500} height={this.state.height}>
                                            {
                                                <table className="table">
                                                    <thead className="thead-dark">
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col">Address</th>
                                                        <th scope="col">Private Key</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {this.state.createdAccounts.map((currentElement, i) => (
                                                        <tr key={currentElement.address}>
                                                            <th scope="row">{i + 1}</th>
                                                            <td>{currentElement.address}</td>
                                                            <td>{currentElement.privateKey}</td>
                                                        </tr>
                                                    ))
                                                    }
                                                    </tbody>
                                                </table>
                                            }
                                        </AnimateHeight>
                                    </div>
                            </form>
                        </div>
                    </div>

                </div>
                <Footer />
            </React.Fragment>
        )
    }
}

