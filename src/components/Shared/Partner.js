// React Basic and Bootstrap
import React, { Component } from 'react';
import {  Col } from 'reactstrap';

// Import Images 
import client1 from '../../images/client/1.png';
import client2 from '../../images/client/2.png';
import client3 from '../../images/client/3.png';
import client4 from '../../images/client/4.png';
import client5 from '../../images/client/5.png';
import client6 from '../../images/client/6.png';

class Partner extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                            <Col lg={2} md={2} className="col-6 text-center">
                                <img src={client1} height="70" alt="" />
                            </Col>

                            <Col lg={2} md={2}  className="col-6 text-center">
                                <img src={client2} height="70" alt="" />
                            </Col>

                            <Col lg={2} md={2}  className="col-6 text-center mt-4 mt-sm-0">
                                <img src={client3} height="70" alt="" />
                            </Col>

                            <Col lg={2} md={2}  className="col-6 text-center mt-4 mt-sm-0">
                                <img src={client4} height="70" alt="" />
                            </Col>

                            <Col lg={2} md={2}  className="col-6 text-center mt-4 mt-sm-0">
                                <img src={client5} height="70" alt="" />
                            </Col>

                            <Col lg={2} md={2}  className="col-6 text-center mt-4 mt-sm-0">
                                <img src={client6} height="70" alt="" />
                            </Col>
                   </React.Fragment>
        );
    }
}

export default Partner;
