import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Footer extends Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    return (
      <React.Fragment>
     <footer className="footer">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-12 mb-0 mb-md-4 pb-0 pb-md-2">
                        <Link className="logo-footer" to="#">Hyperaware<span className="text-primary">.</span></Link>
                        <p className="mt-4 text-muted">A decentralized application to govern connected devices and their data based on their physical location.</p>
                        <p className='text-muted'>Where things happen matters.</p>
                        <ul className="list-unstyled social-icon social mb-0 mt-4">
                            <li className="list-inline-item"><Link to="#" className="rounded mr-1"><i className="mdi mdi-instagram" title="Instagram"></i></Link></li>
                            <li className="list-inline-item"><Link to="#" className="rounded"><i className="mdi mdi-twitter" title="Twitter"></i></Link></li>
                        </ul>
                    </div>
                    
                    <div className="col-lg-2 col-md-4 col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <h4 className="text-light footer-head">Company</h4>
                        <ul className="list-unstyled footer-list mt-4">
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> About Us</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Services</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Team</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Features</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> FAQ</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Blog</Link></li>
                        </ul>
                    </div>
                    
                    <div className="col-lg-3 col-md-4 col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <h4 className="text-light footer-head">Useful Links</h4>
                        <ul className="list-unstyled footer-list mt-4">
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Demo</Link></li>
                            <li><Link to="#" className="text-muted"><i className="mdi mdi-chevron-right mr-1"></i> Documentation</Link></li>
                        </ul>
                    </div>
                    <div className="col-lg-3 col-md-4 col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <h4 className="text-light footer-head">Newsletter</h4>
                        <p className="mt-4">Sign up and receive the latest tips via email.</p>
                        <form>
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="foot-subscribe form-group position-relative">
                                        <label>Write your email <span className="text-danger">*</span></label>
                                        <i className="mdi mdi-email ml-3 icons"></i>
                                        <input type="email" name="email" id="emailsubscribe" className="form-control pl-5 rounded" placeholder="Your email : " required />
                                    </div>
                                </div>
                                <div className="col-lg-12">
                                    <input type="submit" id="submitsubscribe" name="send" className="btn btn-primary w-100" value="Subscribe" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
        <hr />
        <footer className="footer footer-bar">
            <div className="container text-center">
                <div className="row align-items-center">
                    <div className="col-sm-6">
                        <div className="text-sm-left">
                            <p className="mb-0">©  {new Date().getFullYear()} Hyperaware.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        
      </React.Fragment>
    );
  }
}

export default Footer;
