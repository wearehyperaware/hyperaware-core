import React from 'react'
import Alert from "react-bootstrap/Alert";

export default class ZoneCard extends React.Component{
    render() {
        return (
            <div /*onClick={ this.flyToZone(zone.geojson) }*/
                    id={ (this.props.zone.serviceEndpoint ?  this.props.zone.id.split('#')[1] : String(this.props.zone.layerId) ) + '-card' }
                    data-zoneid = { this.props.zone.serviceEndpoint ? this.props.zone.id.split('#')[1] : String(this.props.zone.layerId)  }
                    className="zone-card event-schedule d-flex bg-white rounded p-3 border"
                    style={{
                        marginLeft: '40px',
                        marginTop: '5px',
                        marginRight: '20px',
                        marginBottom: '20px'
                    }}
            >
                <div className="row">
                    <div 
                        className="float-left col-2"
                        onClick = {e => this.props.zoomToZone(this.props.zone.geojson)}
                    >
                        <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled">
                            <li className="day font-weight-bold mb-2">UK</li>
                            {/* <- fix this */}
                        </ul>
                    </div>
                    <div 
                        className="content col-8"
                        onClick = {e => this.props.zoomToZone(this.props.zone.geojson)}
                    >
                        <h4 className="text-dark title"
                            style={{marginBottom: '0px'}}>{ this.props.zone.name }</h4>
                        
                        <p className="text-muted location-time">
                            <span className="text-dark h6">Beneficiary: </span><a
                            target="_blank"
                            rel="noopener noreferrer"
                            href= {"https://iotxplorer.io/address/" + this.props.zone.policies.beneficiary }>{ this.props.truncateAddress(this.props.zone.policies.beneficiary) }</a>
                            <br/>
                            <span
                                className="text-dark h6">Charge: </span>{ this.props.zone.policies.currency} { this.props.zone.policies.chargePerMinute } / minute
                            <br/>
                        </p>
                        {this.props.zone.serviceEndpoint ? 
                        <Alert variant = "primary">
                        Registered
                        </Alert> 
                        : 
                        <Alert variant = "warning">
                            To be registered
                        </Alert>
                        }
                    </div>
                    <div className="floatRight col-2">
                        <ul className="date text-center text-primary mr-md-4 mr-3 mb-0 list-unstyled"> 
                            <li className={"delete-zone "+ this.props.zone.layerId+"-delete" }
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



