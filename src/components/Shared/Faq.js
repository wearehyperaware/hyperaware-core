// React Basic and Bootstrap
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

// Import image
import shapeDark from '../../images/shapes/shape-dark.png';

class Faq extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                <section className="section bg-light">
                    <div className="container">
                        <Row>
                            <Col md={6} className="col-12">
                                <div className="faq-container">
                                    <h4 className="question"><i className="mdi mdi-help-circle text-primary mr-2 h4"></i> How our <span className="text-primary">Landrick</span> work ?</h4>
                                    <p className="answer text-muted ml-lg-4 pl-lg-3 mb-0">Due to its widespread use as filler text for layouts, non-readability is of great importance: human perception is tuned to recognize certain patterns and repetitions in texts.</p>
                                </div>
                            </Col>

                            <Col md={6} className="col-12 mt-4 mt-sm-0 pt-2 pt-sm-0">
                                <div className="faq-container">
                                    <h4 className="question"><i className="mdi mdi-help-circle text-primary mr-2 h4"></i> What is the main process open account ?</h4>
                                    <p className="answer text-muted ml-lg-4 pl-lg-3 mb-0">If the distribution of letters and 'words' is random, the reader will not be distracted from making a neutral judgement on the visual impact</p>
                                </div>
                            </Col>

                            <Col md={6} className="col-12 mt-4 pt-2">
                                <div className="faq-container">
                                    <h4 className="question"><i className="mdi mdi-help-circle text-primary mr-2 h4"></i> How to make unlimited data entry ?</h4>
                                    <p className="answer text-muted ml-lg-4 pl-lg-3 mb-0">Furthermore, it is advantageous when the dummy text is relatively realistic so that the layout impression of the final publication is not compromised.</p>
                                </div>
                            </Col>

                            <Col md={6} className="col-12 mt-4 pt-2">
                                <div className="faq-container">
                                    <h4 className="question"><i className="mdi mdi-help-circle text-primary mr-2 h4"></i> Is <span className="text-primary">Landrick</span> safer to use with my account ?</h4>
                                    <p className="answer text-muted ml-lg-4 pl-lg-3 mb-0">The most well-known dummy text is the 'Lorem Ipsum', which is said to have originated in the 16th century. Lorem Ipsum is composed in a pseudo-Latin language which more or less corresponds to 'proper' Latin.</p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="mt-md-5 pt-md-3 mt-4 pt-2 mt-sm-0 pt-sm-0 justify-content-center">
                            <Col className="text-center">
                                <div className="section-title">
                                    <h4 className="main-title mb-4">Have Question ? Get in touch!</h4>
                                    <p className="text-muted para-desc mx-auto">Start working with <span className="text-primary font-weight-bold">Landrick</span> that can provide everything you need to generate awareness, drive traffic, connect.</p>
                                    <a href="page-contact-two" className="btn btn-primary mt-4">Contact us <i className="mdi mdi-arrow-right"></i></a>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="container-fluid">
                        <Row>
                            <div className="home-shape-bottom">
                                <img src={shapeDark} alt="" className="img-fluid mx-auto d-block" />
                            </div>
                        </Row>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}
export default Faq;