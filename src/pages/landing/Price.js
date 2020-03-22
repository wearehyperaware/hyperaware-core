// React Basic and Bootstrap
import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';
import {Link} from 'react-router-dom';

// import images
import trucking from '../../images/trucking_photo.jpeg';
import drones from '../../images/drone_photo.jpeg';
import maritime from '../../images/maritime_photo.jpeg';

// RBCarousel Declare
import RBCarousel from "react-bootstrap-carousel";
import "react-bootstrap-carousel/dist/react-bootstrap-carousel.css";
import '../../css/carousel.css';

class Price extends Component {

    constructor(props) {
        super(props);
        this.state = {
            autoplay: true
        }
    }

    onSelect = (active, direction) => {
        console.log(`active=${active} && direction=${direction}`);
    };
    visibleOnSelect = active => {
        // console.log(`visiable onSelect active=${active}`);
    };
    slideNext = () => {
        this.slider.slideNext();
    };
    slidePrev = () => {
        this.slider.slidePrev();
    };
    goToSlide = () => {
        this.slider.goToSlide(4);
    };
    autoplay = () => {
        this.setState({autoplay: !this.state.autoplay});
    };
    _changeIcon = () => {
        let {leftIcon, rightIcon} = this.state;
        leftIcon = leftIcon ? undefined : <span className="fa fa-glass"/>;
        rightIcon = rightIcon ? undefined : <span className="fa fa-music"/>;
        this.setState({leftIcon, rightIcon});
    };

    render() {
        return (
            <React.Fragment>
                <section className="section" id='use-cases' style={{paddingTop: '0px'}}>
                    <div className="container mt-60">
                        <Row className="justify-content-center">
                            <Col className="text-center">
                                <div className="section-title mb-60">
                                    <h4 className="main-title mb-4">Use Cases</h4>
                                    <p className="text-muted para-desc mb-0 mx-auto">Use <span
                                        className="text-primary font-weight-bold">Hyperaware</span> to unlock value and
                                        ensure compliance in multiple industries and scenarios.</p>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col lg={9} className="text-center">
                                <div id="owl-fade" className="owl-carousel owl-theme">

                                    <RBCarousel
                                        version={4}
                                        autoplay={this.state.autoplay}
                                        pauseOnVisibility={true}
                                        onSelect={this.visibleOnSelect}
                                        slideshowSpeed={3000}
                                    >
                                        <div className="item">
                                            <div className="bg-light rounded">
                                                <Row className="align-items-center">
                                                    <Col lg={6}>
                                                        <img src={maritime} className="rounded img-fluid" alt=""/>
                                                    </Col>

                                                    <Col lg={6}>
                                                        <div className="section-title p-5">
                                                            <h4 className="title mb-4">International Maritime
                                                                Activity</h4>
                                                            <p className="text-muted para-desc mb-0">With <span
                                                                className="text-primary font-weight-bold">Hyperaware</span>,
                                                                track and securely govern maritime assets - no matter
                                                                where they are in the world.</p>

                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="bg-light rounded">
                                                <Row className="align-items-center">
                                                    <Col lg={6}>
                                                        <img src={drones} className="rounded img-fluid" alt=""/>
                                                    </Col>

                                                    <Col lg={6}>
                                                        <div className="section-title p-5">
                                                            <h4 className="title mb-4">Drone and Airspace
                                                                Management</h4>
                                                            <p className="text-muted para-desc mb-0"><span
                                                                className="text-primary font-weight-bold">Hyperaware</span> ensures
                                                                that all connected drones and UAVs have access to
                                                                accurate, up-to-date no-fly zones.</p>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="bg-light rounded">
                                                <Row className="align-items-center">
                                                    <Col lg={6}>
                                                        <img src={trucking} className="rounded img-fluid" alt=""/>
                                                    </Col>

                                                    <Col lg={6}>
                                                        <div className="section-title p-5">
                                                            <h4 className="title mb-4">International Logistics</h4>
                                                            <p className="text-muted para-desc mb-0">With <span
                                                                className="text-primary font-weight-bold">Hyperaware</span> customs
                                                                agencies can control borders more safely and
                                                                efficiently, and logistics companies know more.</p>

                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    </RBCarousel>
                                </div>
                            </Col>
                        </Row>
                        {/*<div className="container mt-100 mt-60">*/}
                        {/*    <Row className="justify-content-center">*/}
                        {/*        <Col className="text-center">*/}
                        {/*            <div className="section-title mb-4 pb-2">*/}
                        {/*                <h4 className="main-title mb-4">See everything about your <span className="text-primary">Landrick</span></h4>*/}
                        {/*                <p className="text-muted para-desc mx-auto mb-0">Start working with <span className="text-primary font-weight-bold">Landrick</span> that can provide everything you need to generate awareness, drive traffic, connect.</p>*/}
                        {/*            </div>*/}
                        {/*        </Col>*/}
                        {/*    </Row>*/}
                        {/*    <Row id="counter">*/}
                        {/*        <Col md={3}  className="col-6 mt-4 pt-2">*/}
                        {/*            <div className="counter-box text-center">*/}
                        {/*                <img src={Asset190} height="70" alt="" />*/}
                        {/*                <h2 className="mb-0 mt-3"><span className="counter-value" data-count="45000"> <CountUp start={0} end={45000} duration={8} /></span>$</h2>*/}
                        {/*                <h5 className="counter-head text-muted">Investment</h5>*/}
                        {/*            </div>*/}
                        {/*        </Col>*/}
                        {/*        <Col md={3}  className="col-6 mt-4 pt-2">*/}
                        {/*            <div className="counter-box text-center">*/}
                        {/*                <img src={Asset189} height="70" alt="" />*/}
                        {/*                <h2 className="mb-0 mt-3"><span className="counter-value" data-count="9"> <CountUp start={0} end={9} duration={8} /></span>+</h2>*/}
                        {/*                <h5 className="counter-head text-muted">Awards</h5>*/}
                        {/*            </div>*/}
                        {/*        </Col>*/}
                        {/*        <Col md={3}  className="col-6 mt-4 pt-2">*/}
                        {/*            <div className="counter-box text-center">*/}
                        {/*                <img src={Asset186} height="70" alt="" />*/}
                        {/*                <h2 className="mb-0 mt-3"><span className="counter-value" data-count="48002"> <CountUp start={0} end={48002} duration={8} /></span>$</h2>*/}
                        {/*                <h5 className="counter-head text-muted">Profitability</h5>*/}
                        {/*            </div>*/}
                        {/*        </Col>*/}
                        {/*        <Col md={3}  className="col-6 mt-4 pt-2">*/}
                        {/*            <div className="counter-box text-center">*/}
                        {/*                <img src={Asset187} height="70" alt="" />*/}
                        {/*                <h2 className="mb-0 mt-3"><span className="counter-value" data-count="11"><CountUp start={0} end={11} duration={8} /></span>%</h2>*/}
                        {/*                <h5 className="counter-head text-muted">Growth</h5>*/}
                        {/*            </div>*/}
                        {/*        </Col>*/}
                        {/*    </Row>*/}
                        {/*</div>*/}
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

export default Price;
