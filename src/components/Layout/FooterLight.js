import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

class FooterLight extends Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  // onSubscribe - handle email submission.

  render() {
    return (
      <React.Fragment>
            <footer className="footer bg-light">
            <div className="container">

                <Row>
                    <Col lg={4} className="col-12 mb-0 mb-md-4 pb-0 pb-md-2">
                        <Link className="logo-footer text-dark" to="#">Hyperaware<span className="text-primary">.</span></Link>
                        <p className="mt-4 text-muted">A decentralized application to govern connected devices and their data based on their physical location.</p>
                        <p className='text-muted'>Where things happen matters.</p>
                        <a href="mailto:trust@hyperaware.io"><p className='text-primary'>trust@hyperaware.io</p></a>

                    </Col>
                    <Col lg={1}></Col>
                    <Col lg={4} md={4} className="col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <h4 className="text-dark footer-head">Company</h4>
                        <ul className="list-unstyled footer-list mt-4">
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> About</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Use Cases</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Demo</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Documentation</Link></li>
                        </ul>
                    </Col>



                    <Col lg={3} md={4} className="col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <h4 className="text-dark footer-head">Newsletter</h4>
                        <p className="mt-4 text-muted">Sign up and receive the latest tips via email.</p>
                        <form>
                            <Row>
                                <Col lg={12}>
                                    <div className="foot-subscribe form-group position-relative">
                                        <label className="text-muted">Write your email <span className="text-danger">*</span></label>
                                        <i className="mdi mdi-email ml-3 icons"></i>
                                        <input type="email" name="email" id="emailsubscribe" className="form-control bg-light border pl-5 rounded" placeholder="Your email : " required />
                                    </div>
                                </Col>
                                <Col lg={12}>
                                    <input type="submit" id="submitsubscribe" name="send" className="btn btn-primary w-100" value="Subscribe" />
                                </Col>
                            </Row>
                        </form>
                    </Col>
                </Row>
            </div>
        </footer>
        <hr />
        <footer className="footer footer-bar">
            <div className="container text-center">
                <Row className="align-items-center">
                    <Col sm={6}>
                        <div className="text-sm-left">
                            <p className="mb-0">©  {new Date().getFullYear()} Hyperaware.</p>
                        </div>
                    </Col>
                </Row>
            </div>
        </footer>
      </React.Fragment>
    );
  }
}

export default FooterLight;
