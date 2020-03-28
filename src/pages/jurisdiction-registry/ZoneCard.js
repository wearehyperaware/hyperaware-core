import React from 'react'
import Alert from "react-bootstrap/Alert";

export default class ZoneCard extends React.Component{
    render() {
        return (
            <div /*onClick={ this.flyToZone(zone.geojson) }*/
                    id={ (this.props.zone.serviceEndpoint ?  this.props.zone.id.split('#')[1] : String(this.props.zone.layerId) ) + '-card' }
                    data-zoneid = { this.props.zone.serviceEndpoint ? this.props.zone.id.split('#')[1] : String(this.props.zone.layerId)  }
                    key={ this.props.zone.id.split('#')[1]}
                    className="zone-card event-schedule d-flex bg-white rounded p-3 border"
                    style={{
                        marginLeft: '40px',
                        marginTop: '5px',
                        marginRight: '20px',
                        marginBottom: '20px'
                    }}
<<<<<<< HEAD
            >
                <div className="row">
                    <div 
                        className="float-left col-2"
                        onClick = {e => this.props.zoomToZone(this.props.zone.geojson)}
                    >
=======
                    onClick = {e => this.props.zoomToZone(this.props.zone.geojson)}>
                <div className="row">
                    <div className="float-left col-2">
>>>>>>> 18653848e118f62db5ba089e9aa5aeaf691a33f9
                        <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                            <li className="day font-weight-bold mb-2">UK</li>
                            {/* <- fix this */}
                        </ul>
                    </div>
<<<<<<< HEAD
                    <div 
                        className="content col-8"
                        onClick = {e => this.props.zoomToZone(this.props.zone.geojson)}
                    >
=======
                    <div className="content col-8">
>>>>>>> 18653848e118f62db5ba089e9aa5aeaf691a33f9
                        <h4 className="text-dark title"
                            style={{marginBottom: '0px'}}>{ this.props.zone.name }</h4>
                        {this.props.zone.serviceEndpoint ? 
                        <Alert variant = "primary">
                        Registered
                        </Alert> 
                        : 
                        <Alert variant = "danger">
                            To be registered
                        </Alert>
                        }
                        <p className="text-muted location-time">
                            <span className="text-dark h6">Beneficiary: </span><a
                            target="_blank"
                            href= {"https://iotxplorer.io/address/" + this.props.zone.policies.beneficiary }>{ this.props.truncateAddress(this.props.zone.policies.beneficiary) }</a>
                            <br/>
                            <span
                                className="text-dark h6">Charge: </span>{ this.props.zone.policies.currency} { this.props.zone.policies.chargePerMinute } / minute
                            <br/>
                        </p>
        
                    </div>
                    <div className="floatRight col-2">
                        <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled"> 
                            <li className="delete-zone" 
                            onClick= {e => this.props.deleteZone(this.props.zone)}
                            style={{
                                fontSize: '18px',
                                width: '30px',
                                height: '30px',
                                borderRadius: '30px',
                                /* background: #e9edfa; */
                                lineHeight: '25px',
                                border: '2px solid #ffffff',
                                boxShadow: '0px 0px 2px 0.25px #4466d8',
                                cursor: 'pointer'
                                }}
                            >
                                x
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

}



