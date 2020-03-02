import React, { Component } from 'react';

class FooterWithoutMenuLightSocialOnly extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <React.Fragment>
                <footer className="footer footer-bar bg-light">
                    <div className="container text-center">
                        <div className="row align-items-center">
                            <div className="col-sm-6">
                                <div className="text-sm-left">
                                    <p className="mb-0 text-dark">© {new Date().getFullYear()} Hyperaware.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </React.Fragment>
        );
    }
}

export default FooterWithoutMenuLightSocialOnly;
