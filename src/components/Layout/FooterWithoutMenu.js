import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';


class FooterWithoutMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <React.Fragment>
                <footer className="footer footer-bar">
                    <div className="container text-center">
                        <Row className="align-items-center">
                            <Col sm={6}>
                                <div className="text-sm-left">
                                    <p className="mb-0">© {new Date().getFullYear()} Hyperaware.</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </footer>
            </React.Fragment>
        );
    }
}

export default FooterWithoutMenu;
