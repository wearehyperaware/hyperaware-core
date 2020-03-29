// React Basic and Bootstrap
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Row, Col} from 'reactstrap';
import Topbar from "../components/Layout/Topbar";

export class Documentation extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        document.body.classList = "";
        document.getElementById('topnav').classList.add('bg-white');
        window.addEventListener("scroll", this.scrollNavigation, true);

        // Dismiss loading bar
        document.getElementById("pageLoader").style.display = "block";
        setTimeout(function () {
            document.getElementById("pageLoader").style.display = "none";
        }, 1000);
    }

    // Make sure to remove the DOM listener when the component is unmounted.
    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollNavigation);
    }

    scrollNavigation = () => {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        if (top > 80) {
            document.getElementById('topnav').classList.add('nav-sticky');
        } else {
            document.getElementById('topnav').classList.remove('nav-sticky');
        }
    }

    render() {

        return (
            <React.Fragment>
                <Topbar/>
                <section className="bg-half bg-light">
                    <div className="home-center">
                        <div className="home-desc-center">
                            <div className="container">
                                <Row className="justify-content-center">
                                    <Col lg={12} className="text-center">
                                        <div className="page-next-level">
                                            <h4 className="title"> Documentation </h4>
                                            <ul className="page-next d-inline-block bg-white shadow p-2 pl-4 pr-4 rounded mb-0">
                                                <li><Link to="/"
                                                          className="text-uppercase font-weight-bold text-dark">Home</Link>
                                                </li>
                                                <li><Link to="#"
                                                          className="text-uppercase font-weight-bold text-dark">Demo</Link>
                                                </li>
                                                <li>
                                                    <span
                                                        className="text-uppercase text-primary font-weight-bold">Documentation</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <Row>
                            <Col>
                                <h1><span
                                    className="text-primary font-weight-bold">Hyperaware.</span></h1>
                                <h3 className="mt-4 pt-2">Introduction</h3>
                                <p>
                                    <span className="text-primary font-weight-bold">Hyperaware</span> is a decentralised application
                                    for governing connected devices and their data based on physical location. Our system leverages
                                    trusted computing, decentralised identity, a Private Location Analytics Engine and smart contracts
                                    to provide a decentralised and fully trusted system.
                                </p>
                                <p>
                                    <span className="text-primary font-weight-bold">Hyperaware</span> is formed of a number of custom-built
                                    software architectures. Notably, the <span className="text-primary font-weight-bold">Hyperaware</span> Private Location 
                                    Analytics Engine uses Intel SGX technology to securely analyze encrypted location data. With this technology 
                                    we are able to enforce policies based on a device's location <em>without ever revealing the exact location of the device.</em> Note that for the sake of clarity we do
                                    reveal the location of vehicles when they enter zones in this demo, because permanently hidden vehicles are not suited to a visual demonstration.</p><p> Crucially,
                                    the system works everywhere in the world - it transcends physical jurisdiction.
                                    We believe there are significant applications of this technology in military, shipping and logistics, insurance, fisheries and other sectors.
                                </p>
                                <p>
                                    Additionally, <span className="text-primary font-weight-bold">Hyperaware</span> has written smart contracts to enable 
                                    sophisticated policy enforcement based on a vehicle's location on Earth. With our smart contracts we can levy congestion
                                    charges based on <strong>how long</strong> a vehicle is inside a particular zone - and even on the <strong>vehicle type</strong>. We 
                                    envision a smart city where payments and notifications are automated using <span className="text-primary font-weight-bold">Hyperaware</span> technology.                                 
                                </p>
                                <p>
                                    With <span className="text-primary font-weight-bold">Hyperaware</span>, everyone can be sure 
                                    that everyone else is playing by the rules, while keeping strategic information secret.
                                </p>
                                <p>So, how does it work?</p>
                                <h3 className="mt-4 pt-2">DID Creation</h3>
                                <p><span
                                    className="text-primary font-weight-bold">Hyperaware</span> uses <a href='https://www.w3.org/TR/did-core/' target="_blank"> decentralised identifiers</a> to
                                      enable users to control their own data. Vehicle owners need to register a DID document 
                                     using an IoTeX address, which can be created on our <a href="/demo/tools">Tools</a> page.
                                </p>
                                <p>Register a decentralised identifier (or DID - which will look like "did:io:0x9655...")
                                    for your company with your IoTeX address and corresponding private key on 
                                    the <a href="/demo/register-did">Register DID</a> page. Then, with the DID that is 
                                    registered, create <em>another</em> DID for
                                    each vehicle you want to register. You will need these two DIDs to register 
                                    the vehicle on <span
                                    className="text-primary font-weight-bold">Hyperaware</span>'s smart contracts.</p>
                                    <p>In this way vehicle owners control the information coming of off each vehicle's IoTeX Pebble Tracker.
                                        Because the Pebble Tracker has a secure element onboard, it can sign and encrypt location information 
                                        at the edge - information that is fully controlled by the owner. In this way private location data 
                                        can stay private - the owner is 'self sovereign'.
                                    </p>
                                <h3 className="mt-4 pt-2">Vehicle Registration</h3>
                                    <p>With the owner DID and vehicle DID created in the step above, register your 
                                    vehicle on the <a href="/demo/vehicle-registration">Register vehicle</a> page. You will need to stake some IoTeX
                                    with the registration - the accounts generated on our Tools page are given 2 IOTX for the demo, which is enough to register 1 vehicle. (This is running
                                        on a testnet so the currency has no value).</p>

                                <p>Ensure you enter the DID
                                    for the owner and the vehicle in the correct fields, because otherwise the DID documents will not be correctly fetched. Enter the owner DID into the 'View Registered Vehicles' field
                                        after registering to check if it worked.
                                    </p>
                                <p> <strong>The minimum stake amount is 1 IOTX - if you do any less, the transaction will fail.</strong></p>
                                <p><strong>Note:</strong> Arweave will take around 6-10 minutes to have the document mined and ready to be queried on the permaweb, so you might not see your vehicle on the dashboard until that time elapses.</p>
                                <h3 className="mt-4 pt-2">Jurisdiction Registration</h3>
                                    <p>
                                    <span
                                    className="text-primary font-weight-bold">Hyperaware</span> also uses decentralised identifiers
                                    to enable Jurisdictions to control their Zones. This means they have full autonomy over the borders they register, 
                                    and the policies that vehicles have to comply with when they enter that Zone.  
                                    </p>
                                    <p>
                                        To register a Zone, create a GeoJSON file that represents the boundaries of the 
                                        polygon. (A handy tool for this is <a href="http://geojson.io/">geojson.io</a> - draw a polygon, then copy-paste
                                        the JSON into a text editor and save it.)
                                    </p>
                                    <p><span
                                        className="text-primary font-weight-bold">Hyperaware</span> will deploy the GeoJSON files and a DID document 
                                        controlling them to the Arweave permaweb, then register that DID on the <span
                                        className="text-primary font-weight-bold">Hyperaware</span> Zone Registry, running on Ethereum's Ropsten testnet.
                                        Then, when you load the Dashboard, registered zones are visualized on the interactive map.
                                    </p>
                                    <p>
                                        To register Zones, log onto the <a href="/demo/jurisdiction-registration">Jurisdiction Registration</a> page with <a href="https://metamask.io/" target="_blank">Metamask</a>. (Your Metamask account will need
                                        to have test ether on the Ropsten testnet - you can get some at a faucet, <a href="https://faucet.ropsten.be/" target="_blank">here</a>.) A map and form 
                                        interface should load, enabling you to upload the JSON file (with GeoJSON), input Zone information 
                                        and policies. 
                                    </p>
                                    <p>
                                        Once you've added (or removed) the Zones, click "Register zones." This will deploy geometries and the DID document 
                                        to Arweave, then register the DID on Ethereum. 
                                    </p>
                                    <p>
                                        <strong>Note:</strong> Arweave will take around 6-10 minutes to have the document mined and ready to be queried on the permaweb, so you may not see your Zones appear on the dashboard until that time elapses.
                                    </p>
                                    <p>
                                        If you have any questions please email trust@hyperaware.io for personalised support.
                                    </p>

                            </Col>
                        </Row>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

export default Documentation;
