// React Basic and Bootstrap
import React, { Component } from 'react';
import { Row, Col, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';

// Import Images 
import seoSVG from '../../images/illustrator/SEO_SVG.svg';
import mobileNotificationSVG from '../../images/illustrator/Mobile_notification_SVG.svg';

class HowItWorks extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Contactvisible : false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit(event) {
        event.preventDefault();
        this.setState({Contactvisible : true});
    }  

    render() {
        return (
            <React.Fragment>
             <section className="section bg-light border-bottom">
            <div className="container">
                <Row className="justify-content-center">
                    <Col className="text-center">
                        <div className="section-title mb-60">
                            <h4 className="main-title mb-4">How It Work ?</h4>
                            <p className="text-muted para-desc mb-0 mx-auto">Start working with <span className="text-primary font-weight-bold">Landrick</span> that can provide everything you need to generate awareness, drive traffic, connect.</p>
                        </div>
                    </Col>
                </Row>

                <Row className="align-items-center">
                    <Col lg={5} md={6}>
                        <img src={seoSVG} alt="" />
                    </Col>

                    <Col lg={7} md={6} className="mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <div className="section-title ml-lg-5">
                            <h4 className="title mb-4">Change the way you build websites</h4>
                            <p className="text-muted">You can combine all the Landrick templates into a single one, you can take a component from the Application theme and use it in the Website.</p>
                            <ul className="list-unstyled feature-list text-muted">
                                <li><i className="mdi mdi-checkbox-marked-circle text-success h4 mr-2"></i>Digital Marketing Solutions for Tomorrow</li>
                                <li><i className="mdi mdi-checkbox-marked-circle text-success h4 mr-2"></i>Our Talented & Experienced Marketing Agency</li>
                                <li><i className="mdi mdi-checkbox-marked-circle text-success h4 mr-2"></i>Create your own skin to match your brand</li>
                            </ul>
                            <Link to="#" className="mt-3 text-primary">Find Out More <i className="mdi mdi-chevron-right"></i></Link>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="container mt-100 mt-60">
                <Row className="align-items-center">
                    <Col lg={7} md={6} className="order-2 order-md-1 mt-4 mt-sm-0 pt-2 pt-sm-0">
                        <div className="section-title">
                            <h4 className="title mb-4">Speed up your development <br /> with <span className="text-primary">Landrick.</span></h4>
                            <p className="text-muted">Using Landrick to build your site means never worrying about designing another page or cross browser compatibility. Our ever-growing library of components and pre-designed layouts will make your life easier.</p>
                            <ul className="list-unstyled feature-list text-muted">
                                <li><i className="mdi mdi-checkbox-marked-circle text-success h4 mr-2"></i>Digital Marketing Solutions for Tomorrow</li>
                                <li><i className="mdi mdi-checkbox-marked-circle text-success h4 mr-2"></i>Our Talented & Experienced Marketing Agency</li>
                                <li><i className="mdi mdi-checkbox-marked-circle text-success h4 mr-2"></i>Create your own skin to match your brand</li>
                            </ul>
                            <Link to="#" className="mt-3 text-primary">Find Out More <i className="mdi mdi-chevron-right"></i></Link>
                        </div>
                    </Col>

                    <Col lg={5} md={6} className="order-1 order-md-2">
                        <div className="p-4 rounded bg-white feature-form border ml-lg-5">
                            <img src={mobileNotificationSVG} alt="" />

                            <div className="content mt-4 pt-2">
                            <Alert color="info" isOpen={this.state.Contactvisible} toggle={()=>{ this.setState({Contactvisible : !this.state.Contactvisible}) }}>
                                            Download Successfully.
                                         </Alert>
                                <form onSubmit={this.handleSubmit}>
                                    <Row>
                                        <Col lg={12}>
                                            <div className="form-group position-relative">
                                                <label>Name : <span className="text-danger">*</span></label>
                                                <i className="mdi mdi-account ml-3 icons"></i>
                                                <input type="text" className="form-control pl-5" placeholder="Name" name="name" required="" />
                                            </div>
                                        </Col>

                                        <Col lg={12}>
                                            <div className="form-group position-relative">
                                                <label>Email : <span className="text-danger">*</span></label>
                                                <i className="mdi mdi-email ml-3 icons"></i>
                                                <input type="email" className="form-control pl-5" placeholder="Email" name="email" required />
                                            </div>
                                       </Col>

                                       <Col lg={12}>
                                            <div className="form-group position-relative">
                                                <label>Password : <span className="text-danger">*</span></label>
                                                <i className="mdi mdi-key ml-3 icons"></i>
                                                <input type="password" className="form-control pl-5" placeholder="Password" required />
                                            </div>
                                        </Col>
                                        <Col lg={12} className="mt-3 mb-0">
                                            <button type="submit" className="btn btn-primary w-100">Download</button>
                                        </Col>
                                    </Row>
                                </form>                                    
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </section>
            </React.Fragment>
        );
    }
}

export default HowItWorks;
