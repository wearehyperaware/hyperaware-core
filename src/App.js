import React, {Component} from 'react';
import {Route, Switch, BrowserRouter as Router, withRouter} from 'react-router-dom';

// Import Css
import './Apps.scss';
import './css/materialdesignicons.min.css';

// Include Routes 
import {Dashboard} from "./pages/dashboard/dashboard";
import {VehicleRegistration} from "./pages/vehicle-registration/vehicleRegistration";
import {RegisterDID} from "./pages/did-registration/registerDID";
import {RegisterJurisdiction} from "./pages/jurisdiction-registry/jurisdictionRegistration";
import {Documentation} from './pages/Documentation'
import {Tools} from './pages/tools/Tools'

// Root Include
const Root = React.lazy(() => import('./pages/landing'));

class App extends Component {

    render() {

        return (
            <React.Fragment>
                <Router>
                    <React.Suspense fallback={<div></div>}>
                        <Switch>
                            <Route exact path="/" component={Root}/>
                            <Route path="/demo/dashboard" component={Dashboard}/>
                            <Route path="/demo/vehicle-registration" component={VehicleRegistration}/>
                            <Route path="/demo/register-did" component={RegisterDID}/>
                            <Route path="/demo/jurisdiction-registration" component={RegisterJurisdiction}/>
                            <Route path="/demo/docs" component={Documentation}/>
                            <Route path="/demo/tools" component={Tools}/>
                        </Switch>
                    </React.Suspense>
                </Router>
            </React.Fragment>
        );
    }
}

export default withRouter(App);