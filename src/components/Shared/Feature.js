// React Basic and Bootstrap
import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

class Feature extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                    <div className="container">
                        <Row>
                            {this.props.featureArray.map((feat, i) => {
                                return  <Col md={4} key={i} className="mt-5 mt-sm-0">
                                <div className={this.props.isCenter ? "features text-center" : "features" } >
                                    <div className="image position-relative d-inline-block">
                                        <img src={feat.imgUrl} alt="" />
                                    </div>
                                    <div className="content mt-4">
                                        <h4 className="title-2">{feat.title}</h4>
                                        <p className="text-muted mb-0">{feat.description}</p>
                                    </div>
                                </div>
                            </Col>
                            })
                            }
                           </Row>
                           </div>
            </React.Fragment>
        );
    }
}

export default Feature;
