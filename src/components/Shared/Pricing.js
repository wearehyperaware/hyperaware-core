// React Basic and Bootstrap
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

// import Images
import shapeLight from '../../images/shapes/shape-light.png';

class Pricing extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                <section className="section">
                    <div className="container">
                        <Row className="mt-lg-4 align-items-center">
                            <Col lg={5} md={12} className="text-center text-lg-left">
                                <div className="section-title mb-60">
                                    <h4 className="main-title mb-4">Our Comfortable Rates</h4>
                                    <p className="text-muted para-desc mx-auto mb-0">Start working with <span className="text-primary font-weight-bold">Landrick</span> that can provide everything you need to generate awareness, drive traffic, connect.</p>
                                    <Link to="#" className="btn btn-primary mt-4">Buy Now</Link>
                                </div>
                            </Col>

                            <Col lg={7} md={12}>
                                <Row className="align-items-center ml-lg-5">
                                    <Col md={6} className="col-12 pl-md-0 pr-md-0">
                                        <div className="pricing-rates starter-plan shadow bg-white pt-5 pb-5 p-4 rounded text-center">
                                            <h2 className="title text-uppercase text-primary mb-4">Starter</h2>
                                            <div className="d-flex justify-content-center mb-4">
                                                <span className="h4 mb-0 mt-2">$</span>
                                                <span className="price display-4 mb-0">39</span>
                                                <span className="h4 align-self-end mb-1">/mo</span>
                                            </div>

                                            <ul className="feature list-unstyled pl-0">
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Full Access</li>
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Source Files</li>
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Free Appointments</li>
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Enhanced Security</li>
                                            </ul>
                                            <Link to="#" className="btn btn-primary mt-4">Get Started</Link>
                                        </div>
                                    </Col>

                                    <Col md={6} className="col-12 mt-4 pt-2 mt-sm-0 pt-sm-0 pl-md-0 pr-md-0">
                                        <div className="pricing-rates bg-light pt-5 pb-5 p-4 rounded text-center">
                                            <h2 className="title text-uppercase mb-4">Professional</h2>
                                            <div className="d-flex justify-content-center mb-4">
                                                <span className="h4 mb-0 mt-2">$</span>
                                                <span className="price display-4 mb-0">59</span>
                                                <span className="h4 align-self-end mb-1">/mo</span>
                                            </div>

                                            <ul className="feature list-unstyled pl-0">
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Full Access</li>
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Enhanced Security</li>
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>Source Files</li>
                                                <li className="feature-list"><i className="mdi mdi-check text-success h5 mr-1"></i>1 Domain Free</li>
                                            </ul>
                                            <Link to="#" className="btn btn-primary mt-4">Try It Now</Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    <div className="container-fluid">
                        <Row>
                            <div className="home-shape-bottom">
                                <img src={shapeLight} alt="" className="img-fluid mx-auto d-block" />
                            </div>
                        </Row>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}
export default Pricing;