import React, { Component } from 'react';
import Layout from './components/Layout/';
import { Route, Switch, BrowserRouter as Router, withRouter } from 'react-router-dom';

// Import Css
import './Apps.scss';
import './css/materialdesignicons.min.css';

// Include Routes 
import {Dashboard} from "./pages/dashboard/dashboard";
import {VehicleRegistration} from "./pages/vehicle-registration/vehicleRegistration";
import {RegisterDID} from "./pages/did-registration/registerDID";
import {RegisterJurisdiction} from "./pages/jurisdiction-registry/jurisdictionRegistration";
import {Documentation} from './pages/Documentation'

// Root Include
const Root = React.lazy(() => import('./pages/landing'));

class App extends Component {

  render() {

    return (
      <React.Fragment>  
      <Router>
          <React.Suspense fallback={<div></div>}>
            <Switch>
            <Route path="/dashboard" component={Dashboard}/>
            <Route path="/vehicle-registration" component={VehicleRegistration}/>
            <Route path="/register-did" component={RegisterDID}/>
            <Route path="/jurisdiction-registration" component={RegisterJurisdiction}/>
            <Route path="/docs" component={Documentation} />
            <Route path="/" component={Root} />
            </Switch>
          </React.Suspense>
        </Router>
      </React.Fragment>
    );
  }
}

export default withRouter(App);