// React Basic and Bootstrap
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Row, Col, Alert, Collapse} from 'reactstrap';

// Import Generic components
import Feature from './Feature';
import Price from './Price';

// Modal Video
import '../../../node_modules/react-modal-video/scss/modal-video.scss';

//Import Images
import london_3d from '../../images/london_3d.png';
import roundWhite from '../../images/shapes/round-white.png';
import Typist from "react-typist";
import Topbar from "../../components/Layout/Topbar";
import FooterLight from "../../components/Layout/FooterLight";

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            Contactvisible: false
        }
        this.openModal = this.openModal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        // Anything else here? 
        this.setState({Contactvisible: true});
    }

    openModal() {
        this.setState({isOpen: true})
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
                {/* Hero Start */}
                <section className="bg-half-295"
                         style={{backgroundImage: `url(${london_3d})`, backgroundPosition: "center center"}} id="home">
                    <div className="home-center">
                        <div className="home-desc-center">
                            <div className="container">
                                <Row className="justify-content-center row mt-md-5">
                                    <Col className="offset-lg-1 order-1 order-md-2">
                                        <div className="text-center title-heading">
                                            <h1 className="logo">Hyperaware<span className="text-custom">.</span></h1>
                                            <h1 className="heading font-weight-bold mb-3 text-center">Built For <span
                                                style={{marginLeft: '4px'}}></span>
                                                <Typist>
                                                    <span className="element text-custom">Ports.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Governments.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Companies.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Fishing.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Individuals.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Drones.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Driving.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">Compliance.</span>
                                                    <Typist.Backspace count={15} delay={600}/>
                                                    <span className="element text-custom">You.</span>
                                                </Typist>
                                            </h1>
                                            <p className="para-desc mx-auto mb-0">What is it? <span
                                                className="text-custom font-weight-bold">Hyperaware</span> is a
                                                decentralized application for governing connected devices and their data
                                                based on their physical location.

                                            </p>
                                            <div className="mt-4 pt-2">
                                                <div className="mt-4 pt-2">
                                                    <a href="/demo/dashboard" className="btn btn-primary mt-2 mr-2">View
                                                        Demo</a>
                                                    <Link to="/" className="btn btn-outline-primary mt-2 ml-1">Learn
                                                        More</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <div className="container-fluid">
                                <Row>
                                    <div className="home-shape-bottom">
                                        <img src={roundWhite} alt="" className="img-fluid mx-auto d-block"/>
                                    </div>
                                </Row>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature */}
                <Feature/>

                {/* Price */}
                <Price/>

                {/* Contact Us */}
                <section id='faq'>
                    <div className="container mb-5">
                        <Row className="justify-content-center">
                            <Col className="text-center">
                                <div id='use-cases' className="section-title mb-60">
                                    <h4 className="main-title mb-4">FAQ // Contact Us</h4>
                                    <p className="text-muted para-desc mb-0 mx-auto">Have questions? <span
                                        className="text-primary font-weight-bold">Get in touch.</span></p>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={7} md={6}>
                                {/*FAQ */}
                                <div className="px-4 pb-4">
                                    <div className="faq-content">
                                        <div className="accordion" id="accordionExample">
                                            <div className="card border rounded shadow mb-2">

                                                <Link to="#collapseOne"
                                                      className={this.state.col1 ? "faq position-relative collapsed text-primary" : "faq position-relative collapsed text-dark"}
                                                      onClick={() => this.setState({
                                                          col1: !this.state.col1,
                                                          col2: false,
                                                          col3: false
                                                      })}>
                                                    <div className="card-header bg-light p-3" id="headingOne">
                                                        <h4 className="title mb-0 faq-question"> What's the demo? </h4>
                                                    </div>
                                                </Link>
                                                <Collapse isOpen={this.state.col1}>
                                                    <div className="card-body">
                                                        <p className="text-muted mb-0 faq-ans"><span
                                                            className="text-primary font-weight">Hyperaware</span> is a fully functional decentralized 
                                                            application. With the demo you can <a href="/demo/vehicle-registration">register a vehicle</a> as a commercial 
                                                            entity, <a href="/demo/jurisdiction-registration">register
                                                            a policy zone</a> as a jurisdiction authority and view the <a href='/demo/dashboard'>interactive dashboard</a> visualizing all 
                                                            zones and vehicles.</p>
                                                    </div>
                                                </Collapse>
                                            </div>

                                            <div className="card border rounded shadow mb-2">
                                                <Link to="#collapseTwo" onClick={() => this.setState({
                                                    col2: !this.state.col2,
                                                    col5: false,
                                                    col4: false,
                                                    col1: false,
                                                    col3: false
                                                })}
                                                      className={this.state.col2 ? "faq position-relative collapsed text-primary" : "faq position-relative collapsed text-dark"}>
                                                    <div className="card-header bg-light p-3" id="headingTwo">
                                                        <h4 className="title mb-0 faq-question"> How do we demo with
                                                            real routes? </h4>
                                                    </div>
                                                </Link>
                                                <Collapse isOpen={this.state.col2}>
                                                    <div className="card-body">
                                                        <p className="text-muted mb-0 faq-ans">We randomly generate routes in our
                                                        demo to simulate how the system would function. Our deployed systems collect data
                                                        from location sensors embedded in the assets they are tracking. To ensure the privacy and 
                                                        integrity of location data, we have integrated with <a href="https://www.iotex.io/">IoTeX</a>'s 
                                                        trusted IoT device, the <a href="https://www.iotex.io/securehardware">Pebble Tracker</a> -
                                                        but we can integrate our systems with any location tracker or connected sensor.</p>
                                                    </div>
                                                </Collapse>
                                            </div>

                                            <div className="card rounded shadow mb-2">
                                                <Link to="#" onClick={() => this.setState({
                                                    col3: !this.state.col3,
                                                    col5: false,
                                                    col4: false,
                                                    col2: false,
                                                    col1: false
                                                })}
                                                      className={this.state.col3 ? "faq position-relative collapsed text-primary" : "faq position-relative collapsed text-dark"}>
                                                    <div className="card-header bg-light p-3" id="headingfive">
                                                        <h4 className="title mb-0 faq-question"> Can Hyperaware
                                                            integrate with any system? </h4>
                                                    </div>
                                                </Link>
                                                <Collapse isOpen={this.state.col3}>
                                                    <div className="card-body">
                                                        <p className="text-muted mb-0 faq-ans"><span
                                                            className="text-primary font-weight">Hyperaware</span>'s Private 
                                                            Location Analytics Engine  is agnostic to the source of location 
                                                            information - we can integrate with existing GPS trackers. For advanced
                                                            features like our Private Location Tracking we can install special devices
                                                            on your vehicles.</p>
                                                    </div>
                                                </Collapse>
                                            </div>

                                            <div className="card rounded shadow mb-2">
                                                <Link to="#" onClick={() => this.setState({
                                                    col4: !this.state.col4,
                                                    col5: false,
                                                    col3: false,
                                                    col2: false,
                                                    col1: false
                                                })}
                                                      className={this.state.col4 ? "faq position-relative collapsed text-primary" : "faq position-relative collapsed text-dark"}>
                                                    <div className="card-header bg-light p-3" id="headingfive">
                                                        <h4 className="title mb-0 faq-question"> Are special sensors
                                                            required? </h4>
                                                    </div>
                                                </Link>
                                                <Collapse isOpen={this.state.col4}>
                                                    <div className="card-body">
                                                        <p className="text-muted mb-0 faq-ans"><span
                                                            className="text-primary font-weight">Hyperaware</span> can add value to firms
                                                            and governments by integrating with existing systems. Advanced features like 
                                                            Private Location Tracking and our secure location analytics may require special 
                                                            "trusted IoT" devices to be installed. We'd love to discuss your specific use 
                                                            case to understand how we could help.</p>
                                                    </div>
                                                </Collapse>
                                            </div>

                                            <div className="card rounded shadow mb-0">
                                                <Link to="#" onClick={() => this.setState({
                                                    col5: !this.state.col5,
                                                    col4: false,
                                                    col3: false,
                                                    col2: false,
                                                    col1: false
                                                })}
                                                      className={this.state.col5 ? "faq position-relative collapsed text-primary" : "faq position-relative collapsed text-dark"}>
                                                    <div className="card-header bg-light p-3" id="headingfive">
                                                        <h4 className="title mb-0 faq-question"> How is data privacy
                                                            ensured? </h4>
                                                    </div>
                                                </Link>
                                                <Collapse isOpen={this.state.col5}>
                                                    <div className="card-body">
                                                        <p className="text-muted mb-0 faq-ans">With <span
                                                            className="text-primary font-weight">Hyperaware</span>'s Private Location Tracking system,
                                                        location information is digitally signed and encrypted on the edge sensor, inside a secure enclave.
                                                        This gives the device owner complete control over who can access their location data. Furthermore,
                                                        the <span className="text-primary font-weight">Hyperaware</span> Private Location Analytics
                                                        Engine is able to securely analyze encrypted location information, maintaining privacy while still
                                                        enabling us to prove where it is - or is not.</p>
                                                    </div>
                                                </Collapse>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col lg={5} md={6} className="mt-4 mt-sm-0 pt-2 pt-sm-0 order-2 order-md-1">
                                    <div className="title-heading ml-lg-4">
                                        <h4 className="mb-4">Contact Details</h4>
                                        <p className="text-muted">If you'd like to know more, get in touch.</p>
                                        <div className="contact-detail mt-3">
                                            <div className="icon mt-3 float-left">
                                                <i className="mdi mdi-email-variant text-muted mdi-36px mr-3"></i>
                                            </div>
                                            <div className="content mt-3 overflow-hidden d-block">
                                                <h4 className="title font-weight-bold mb-0">Email</h4>
                                                <a href="mailto:trust@hyperaware.io" className="text-primary h6">trust@hyperaware.io</a>
                                            </div>
                                        </div>

                                        <div className="contact-detail mt-3">
                                            <div className="icon mt-3 float-left">
                                                <i className="mdi mdi-map-marker-outline text-muted mdi-36px mr-3"></i>
                                            </div>
                                            <div className="content mt-3 overflow-hidden d-block">
                                                <h4 className="title font-weight-bold mb-0">Location</h4>
                                                <a href="#" className="text-primary h6">London, England</a>

                                            </div>
                                        </div>
                                    </div>
                                </Col>
                        </Row>
                    </div>
                </section>
                <FooterLight/>

            </React.Fragment>
        );
    }
}

export default Index;
