// React Basic and Bootstrap
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import Topbar from "../components/Layout/Topbar";

export class Documentation extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount() {
        document.body.classList = "";
        document.getElementById('topnav').classList.add('bg-white');
        window.addEventListener("scroll", this.scrollNavigation, true);

        // Dismiss loading bar
        document.getElementById("pageLoader").style.display = "block";
        setTimeout(function () { document.getElementById("pageLoader").style.display = "none"; }, 1000);
    }
     // Make sure to remove the DOM listener when the component is unmounted.
     componentWillUnmount() {
        window.removeEventListener("scroll",this.scrollNavigation);
     }

    scrollNavigation = () => {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        if (top > 80) {
            document.getElementById('topnav').classList.add('nav-sticky');
        }
        else {
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
                                                <li><Link to="/" className="text-uppercase font-weight-bold text-dark">Home</Link></li>
                                                <li><Link to="#" className="text-uppercase font-weight-bold text-dark">Docs</Link></li>
                                                <li>
                                                    <span className="text-uppercase text-primary font-weight-bold">Documentation</span>
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
                                <h1>Introduction</h1>
                                <p className="text-muted h5 font-weight-normal">Get Started With <span className="text-primary font-weight-bold">Hyperaware.</span></p>
                                <h3 className="mt-4 pt-2">DID Creation</h3>
                                <h3 className="mt-4 pt-2">Vehicle Registration</h3>
                                <h3 className="mt-4 pt-2">Jurisdiction Registration</h3>

                            </Col>
                        </Row>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

export default Documentation;
