// React Basic and Bootstrap
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

// Modal Video
import '../../../node_modules/react-modal-video/scss/modal-video.scss';

// import images
import database from '../../images/icon/server.svg'
import video from '../../images/icon/video.svg'
import location from '../../images/icon/intellectual.svg'


class Feature extends Component {

    constructor(props) {
        super(props);
        this.state = {
            autoplay: true,
            isOpen: false
        }
        this.openModal = this.openModal.bind(this);
    }
    openModal() {
        this.setState({ isOpen: true })
    }
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
        this.setState({ autoplay: !this.state.autoplay });
    };
    _changeIcon = () => {
        let { leftIcon, rightIcon } = this.state;
        leftIcon = leftIcon ? undefined : <span className="fa fa-glass" />;
        rightIcon = rightIcon ? undefined : <span className="fa fa-music" />;
        this.setState({ leftIcon, rightIcon });
    };

    render() {
        return (
            <React.Fragment>
                <section className="section">
                    <div className="container mb-5">
                        <Row className="justify-content-center">
                            <Col className="text-center">
                                <div id='about-us' className="section-title mb-4 pb-2">
                                    <h4 className="title mb-4">Where Things Happen Matters</h4>
                                    <p className="text-muted para-desc mb-0 mx-auto">At <span className="text-primary font-weight-bold">Hyperaware</span> we know how important it is that things remain where they should be.</p>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4} className="col-12 mt-5">
                                <div className="features text-center">
                                    <div className="image position-relative d-inline-block">
                                        <img src={database} alt="" />
                                    </div>

                                    <div className="content mt-4">
                                        <h4 className="title-2">(Optionally) Privacy Preserving</h4>
                                        <p className="text-muted mb-0">If you need to ensure confidentiality of location, but still need to prove where
                                            something <span className="text-custom">isn't</span>, <span className="text-primary font-weight-bold">Hyperaware</span> has your back.</p>
                                    </div>
                                </div>
                            </Col>

                            <Col md={4} className="col-12 mt-5">
                                <div className="features text-center">
                                    <div className="image position-relative d-inline-block">
                                        <img src={location} alt="" />
                                    </div>

                                    <div className="content mt-4">
                                        <h4 className="title-2">Tamper-Proof and Immutable</h4>
                                        <p className="text-muted mb-0"><span className="text-primary font-weight-bold">Hyperaware</span> uses <span className="text-custom">Intel SGX </span>
                                            technology and <span className="text-custom">Trusted Computing</span> to ensure that data collected is tamper-proof at the site of collection.</p>
                                    </div>
                                </div>
                            </Col>

                            <Col md={4} className="col-12 mt-5">
                                <div className="features text-center">
                                    <div className="image position-relative d-inline-block">
                                        <img src={video} alt="" />
                                    </div>

                                    <div className="content mt-4">
                                        <h4 className="title-2">Automatically Actionable</h4>
                                        <p className="text-muted mb-0">Our <span className="text-custom">Smart Contracts</span> ensure that when conditions are violated, action is taken
                                            automatically based on the agreed predefined criteria.</p>
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

export default Feature;
