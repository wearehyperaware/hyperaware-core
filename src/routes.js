import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    withRouter
} from "react-router-dom";
import { Dashboard } from "./views/dashboard/dashboard"
import { VehicleRegistration } from "./views/vehicle-registration/vehicleRegistration";
import { RegisterDID } from "./views/did-registration/registerDID";
import { RegisterJurisdiction } from "./views/jurisdiction-registry/jurisdictionRegistration";

// import { NotFound } from "./views/not_found";


export default function AppRouter() {
    return (
        <Router >
            <div >
                {/*<PageTop/>*/}
                {/*<Nav/>*/}
                <div style={{marginLeft:"15em", marginRight:"1em", maxHeight:"100vh"}}>
                    <Switch>
                        <Route exact path="/dashboard" component={withRouter(Dashboard)}/>
                        <Route exact path="/vehicle-registration" component={withRouter(VehicleRegistration)}/>
                        <Route exact path="/register-did" component={withRouter(RegisterDID)}/>
                        <Route exact path="/jurisdiction-registration" component={withRouter(RegisterJurisdiction)}/>
                        {/*<Route component={withRouter(NotFound)}/>*/}
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

//const Nav = withRouter(Sidebar);
