import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from "react-router";

class Topbar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            page: false,
            landing: false,
            docs: false,
            new: false,
            utility: false,
            user: false,
            work: false,
            blog: false,
            carr: false
        };
        this.toggleLine = this.toggleLine.bind(this);
    }

    toggleLine() {
        this.setState(prevState => ({isOpen: !prevState.isOpen}));
    }

    componentDidMount() {
        var matchingMenuItem = null;
        var ul = document.getElementById("top-menu");
        var items = ul.getElementsByTagName("a");
        for (var i = 0; i < items.length; ++i) {
            if (this.props.location.pathname === items[i].pathname) {
                matchingMenuItem = items[i];
                break;
            }
        }
        if (matchingMenuItem) {
            this.activateParentDropdown(matchingMenuItem);
        }
    }

    activateParentDropdown = (item) => {
        const parent = item.parentElement;
        if (parent) {
            parent.classList.add('active'); // li
            const parent1 = parent.parentElement;
            parent1.classList.add('active'); // li
            if (parent1) {
                const parent2 = parent1.parentElement;
                parent2.classList.add('active'); // li
                if (parent2) {
                    const parent3 = parent2.parentElement;
                    parent3.classList.add('active'); // li
                    if (parent3) {
                        const parent4 = parent3.parentElement;
                        parent4.classList.add('active'); // li
                    }
                }
            }
        }
    }

    render() {

        return (
            <React.Fragment>
                <header id="topnav" className="defaultscroll sticky">
                    <div className="container">
                        <div>
                            <Link className="logo" to="/">Hyperaware<span className="text-primary">.</span></Link>
                        </div>
                        {window.location.pathname === '/demo/dashboard' ? <div></div> :
                            <div className="buy-button">
                                <a href='/demo/dashboard' className="btn btn-primary">Demo</a>
                            </div>}
                        <div className="menu-extras">
                            <div className="menu-item">
                                <Link to="#" onClick={this.toggleLine}
                                      className={this.state.isOpen ? "navbar-toggle open" : "navbar-toggle"}>
                                    <div className="lines">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div id="navigation" style={{display: this.state.isOpen ? "block" : "none"}}>
                            <ul className="navigation-menu" id="top-menu">
                                <li><Link to="/">Home</Link></li>
                                <li><a href="/#about">About</a></li>
                                <li><a href="/#use-cases">Use Cases</a></li>
                                <li><a href="/#faq">FAQ</a></li>
                                <li className="has-submenu">
                                    <a href="/demo/dashboard">Demo</a>
                                    <span className="menu-arrow"></span>
                                    <ul className="submenu">
                                        <li>
                                            <ul>
                                                <li><a href='/demo/dashboard'>Dashboard</a></li>
                                                <li><Link to="/demo/register-did">DID Creation</Link></li>
                                                <li><Link to="/demo/vehicle-registration">Vehicle Registration</Link>
                                                </li>
                                                <li><Link to="/demo/jurisdiction-registration">Jurisdiction
                                                    Registration</Link></li>
                                                <li><Link to="/demo/tools">Tools</Link></li>
                                                <li><Link to="/demo/docs">Documentation</Link></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>
            </React.Fragment>
        );
    }
}

export default withRouter(Topbar);
