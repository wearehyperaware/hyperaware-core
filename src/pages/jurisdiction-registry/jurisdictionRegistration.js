// Libraries
import mapboxgl from "mapbox-gl";
import connect from "socket.io-client";
import * as turf from "@turf/turf";
import d3 from "d3";
import axios from "axios";
import GJV from "geojson-validation";
import geojsonMerge from "@mapbox/geojson-merge";
import Web3 from "web3";
import Arweave from "arweave/web";
import zoneContract from "./zone-contract-details.js";
import { without } from "lodash";
import ZoneCard from "./ZoneCard";

// React Components
import React from "react";
import Topbar from "../../components/Layout/Topbar";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import AnimateHeight from "react-animate-height";

mapboxgl.accessToken = "pk.eyJ1IjoiamdqYW1lcyIsImEiOiJjazd5cHlucXUwMDF1M2VtZzM1bjVwZ2hnIn0.Oavbw2oHnexn0hiVOoZwuA";
// let socket
// if (process.env.NODE_ENV === 'production') {
    // socket = connect(window.location.hostname)
// } else {
    // socket = connect('http://localhost:3001');
// }

export var map;

export class RegisterJurisdiction extends React.Component {
  constructor(props) {
    super(props);

    // let provider = ethers.getDefaultProvider('ropsten');
    // let zoneRegistryContract = new ethers.Contract(zoneContract.contractAddress, zoneContract.abi, provider)

    this.state = {
      didDoc: {
        "@context": "https://www.w3.org/ns/did/v1",
        id: "",
        authentication: [],
        service: []
      },
      zones: [],
      zoneName: "",
      zoneAdmin: "",
      zoneBeneficiary: "",
      zoneCharge: "",
      zoneCurrency: "",
      zoneGeojson: {},
      newZoneCt: 0,
      // provider: provider,
      zoneRegistryContract: null,
      metamask: null,
      admin: "0xaf6c60f9569a5957b9e8679d7178b0e15e462e72",
      someHash:
        "0x6b22041934973b8dc2d68181b87f18ef085f739c793a99dd72062f97ec4e3c4f",
      methods: null,
      isAddressRegistered: false
    };

    this.deleteZone = this.deleteZone.bind(this);
    this.truncateAddress = this.truncateAddress.bind(this);
    this.zoomToZone = this.zoomToZone.bind(this);
  }
  async componentDidMount() {
    //modern dapp browser
    if (window.ethereum) {
      this.state.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else {
      // Non-dapp browsers…
      console.log(
        "Ethereum browser not detected.You should consider trying MetaMask!"
      );
    }

    // Dismiss loading bar
    document.getElementById("pageLoader").style.display = "block";
    setTimeout(function() {
      document.getElementById("pageLoader").style.display = "none";
    }, 1000);

    // Navbar scrolling
    document.body.classList = "";
    document.getElementById("topnav").classList.add("bg-white");
    window.addEventListener("scroll", this.scrollNavigation, true);

    // Set up and add map:
    var screenWidth = document.documentElement.clientWidth;
    var screenHeight = document.documentElement.clientHeight;

    // map loads with different zoom / center depending on the type of device
    var zoom = 3.4;
    var center = [24.56900802672635, 51.27714197030792];

    map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/light-v10",
      zoom,
      center
    });

    window.map = map;

    // Log in with metamask

    //https://arweave.net/tx/HU-KapDMU0NF5LXXgq_3N7BNNkS1DsxpaMOjBkUCfKk/data.txt
    //sample dod doc on awreave
    /********************** MAIN LOGIC on SUBMIT (pseudocode) ********************************/
    try {
      await this.initContract();
      let selectedAddress = this.state.web3.eth.currentProvider.selectedAddress;

      let exists = await this.isRegistered(selectedAddress);

      this.setState(state => {
        return { isAddressRegistered: exists };
      });

      if (exists) {
        //fetch existing docuemnt from contract and read from arweave
        let documentURI = await this.getURI(selectedAddress);

        let DIDdocument = await this.readDocument(documentURI);
        //console.log(DIDdocument);
        this.state.didDoc = DIDdocument;
        let zones = DIDdocument.service;

        // Get geojson
        zones = await Promise.all(
          zones.map(async zone => await this.fetchGeojson(zone))
        );

        zones.map(zone => this.addGeojsonToMap(zone));
        this.setState({ 
            zones: zones,
         }); // = [...this.state.zones, DIDdocument.service];

        //console.log(DIDdocument);
        //update based on DIDdocument
        //do sth e.g.) let updatedDIDdocument = DIDdocument.service.push(...)
        let updatedDIDdocument = {};

        // save to areweave
        // let updatedDocumentURI = await this.saveToArweave(
        //     JSON.stringify(updatedDIDdocument, null, 2)
        // );
        // //save to contract
        // await this.register(
        //     this.state.web3.utils.keccak256(updatedDocumentURI),
        //     updatedDocumentURI
        // );
        this.zoomToAllZones();
      } else {
        console.log("ELSE executed");
        this.state.didDoc.id = "did:hypr:" + selectedAddress;
        // //load submitted GEOJSON
        // let geoJson = await $.getJSON("../data/countries/FRA.json");
        // console.log(geoJson);
        // let geoURI = await saveToArweave(JSON.stringify(geoJson, null, 2));
        // //create new DIDdoc based on the geoURI and save to areweave
        // let newDIDdocument = await $.getJSON("../data/DIDdocument.json");
        // let newDocumentURI = await saveToArweave(
        //     JSON.stringify(newDIDdocument, null, 2)
        // );
        // //save to contract
        // await register(web3.utils.keccak256(newDIDdocument), newDocumentURI);
        // console.log("new did registerd!");
      }
    } catch (err) {
      console.log(err);
    }

    // let ethereumAccount = "";

    // if (!window.ethereum) {
    //     // More robust error handling here - can't access registry
    //     // until signed in with metamask
    //     alert('Please sign in with metamask');
    // } else {
    //     ethereumAccount = window.ethereum;
    // }

    // let didURI = await this.accountRegistered(ethereumAccount),
    //     didDoc = {};

    // if (!didURI) {
    //     // Create new DID

    // } else {
    //     console.log(didURI);

    //     didDoc = await axios.get(didURI)
    //     console.log(didDoc.data)

    // }
  }

  fetchGeojson = async zone => {
    let geojson = await axios.get(zone.serviceEndpoint);
    zone.geojson = geojson.data;
    return zone;
  };

  //address and abi already loaded
  initContract = async () => {
    this.state.zoneRegistryContract = new this.state.web3.eth.Contract(
      zoneContract.abi,
      zoneContract.address
    );
    // for testing purposes

    this.state.methods = this.state.zoneRegistryContract.methods;
    this.state.someHash =
      "0x6b22041934973b8dc2d68181b87f18ef085f739c793a99dd72062f97ec4e3c4f";
    this.state.admin = "0xaf6c60f9569a5957b9e8679d7178b0e15e462e72";
    this.state.metamask = this.state.web3.eth.currentProvider;
  };

  /********************** MAIN CONTRACT FUNCTIONS ****************/
  //checks if a given address is registered, return boolean
  isRegistered = async address => {
    let value = await this.state.methods.isRegistered(address).call({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    this.state.isAddressRegistered = value;
    return value;
  };

  //given the hash and uri, registers a DID.
  //if already registered it updates, otherwise create a new one
  register = async (hash, uri) => {
    let receipt = await this.state.methods.register(hash, uri).send({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    window.registerReceipt = receipt;
    return receipt;
  };
  //deletes did of the specified address
  //the creater and the admin has the right
  deregister = async address => {
    let receipt = await this.state.methods.deregister(address).send({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    window.deregisterReceipt = receipt;
    return receipt;
  };
  //retrieves an uri of the given address
  getURI = async address => {
    let value = await this.state.methods.getURI(address).call({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    window.returnedURI = value;
    return value;
  };

  //returns an array of EXISITING DIDs struct {exists(bool), hash(byte32), }
  getExistingDIDs = async () => {
    let value = await this.state.methods.getExistingDIDs().call({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    window.returnedDIDs = value;
    return value;
  };

  /********************* AVAILABLE FUNCTIONS BUT NOT THAT IMPORTANT *************************/

  getHash = async address => {
    let value = await this.state.methods.getHash(address).call({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    window.returnedHash = value;
  };

  getExistingAddrs = async () => {
    let value = await this.state.methods.getExistingAddrs().call({
      from: this.state.metamask.selectedAddress,
      gasPrice: "80000000000"
    });
    window.returnedAddresses = value;
  };

  accountRegistered = async account => {
    let uri = await this.state.zoneRegistryContract.getURI();
    console.log(uri);
    if (uri) {
      return uri;
    } else {
      return null;
    }

    // Check URI
  };

  readDocument = async url => {
    try {
      let document = await axios.get(url);
      return document.data;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  // saveToArweave = async (document) => {
  //     // Initialize Arweave
  //     let arw = Arweave.init();
  //     let jwk = await $.getJSON("../ArweaveKey.json");
  //     let arweaveURL;
  //     try {
  //         // Create new transaction
  //         let transaction = await arw.createTransaction(
  //             {
  //                 data: document
  //             },
  //             jwk
  //         );

  //         // Document to be rendered as txt
  //         transaction.addTag("Content-Type", "text/plain");

  //         // Sign transaction
  //         await arw.transactions.sign(transaction, jwk);

  //         // Submit transaction
  //         try {
  //             await arw.transactions.post(transaction);
  //         } catch (err) {
  //             console.log("Error occurred on submit: ", err);
  //         }

  //         arweaveURL = "https://arweave.net/tx/" + transaction.id + "/data.txt";
  //         console.log(arweaveURL);
  //         return Promise.resolve(arweaveURL);
  //     } catch (err) {
  //         return Promise.reject(err);
  //     }
  // };

  addGeojsonToMap = async zone => {
    let id, geojson;

    if (typeof zone.geojson != "undefined") {
      geojson = zone.geojson;
      id = zone.id.split("#")[1];
      zone.layerId = id;
    } else {
      geojson = zone;
      id = "layer-" + String(this.state.newZoneCt);
    }

    map.addSource("zone-" + id, {
      type: "geojson",
      data: geojson
    });

    // put underneath labels

    map.addLayer({
      id: "zone-border-" + id,
      source: "zone-" + id,
      type: "line",
      paint: {
        "line-opacity": 1,
        "line-color": "#2443ac",
        "line-width": [
          "interpolate",
          ["exponential", 0.5],
          ["zoom"],
          3,
          1,
          7,
          2,
          15,
          3,
          22,
          5
        ]
      }
    });

    map.addLayer({
      id: "zone-fill-" + id,
      source: "zone-" + id,
      type: "fill",
      paint: {
        "fill-opacity": 0.3,
        "fill-color": "#2443ac"
      }
    });
  };

  zoomToZone = geojson => {
    map.fitBounds(turf.bbox(geojson), {
      padding: {
        top: 150,
        bottom: 50,
        left: 50,
        right: 500
      }
    }
    );
  };

  loadGeojson = async event => {
    let geojson = await processFile(event.target.files[0]);

    // Test geojson validity
    // If error, set form to invalid and return
    if (GJV.valid(geojson)) {
      console.log("VALID GEOJSON");

      if (geojson.type === "FeatureCollection") {
        if (
          geojson.features[0].type === "Feature" &&
          geojson.features[0].geometry.type === "Polygon"
        ) {
          console.log("great!!");
        } else if (geojson.features[0].type === "Polygon") {
          geojson = {
            type: "FeatureCollection",
            features: {
              type: "Feature",
              geometry: geojson.features[0]
            }
          };
          console.log("Great!");
        } else {
          d3.select("#geojson-input").classed("is-invalid", true);

          alert(
            "Please upload a valid GeoJSON polygon geometry. Go to geojson.io to create one if you'd like."
          );

          return;
        }
      } else if (
        geojson.type === "Feature" &&
        geojson.geometry.type === "Polygon"
      ) {
        geojson = {
          type: "FeatureCollection",
          features: [geojson]
        };
      } else if (geojson.type === "Polygon") {
        geojson = {
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: geojson }]
        };
      } else {
        d3.select("#geojson-input").classed("is-invalid", true);

        alert(
          "Please upload a valid GeoJSON polygon geometry. Go to geojson.io to create one if you'd like."
        );

        return;
      }
    } else {
      d3.select("#geojson-input").classed("is-invalid", true);

      alert(
        "Please upload a valid GeoJSON polygon geometry. Go to geojson.io to create one if you'd like, or geojsonlint.com to test validity."
      );

      return;
    }

    // Add geojson layer to map:
    // this.state.zoneName;

    // // Fetch the 2-letter country code from Mapbox geocoder
    // let centroid = turf.centroid(geojson);
    // let mbURI = "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    //     String(centroid.geometry.coordinates.join('%2C')) +
    //     ".json?access_token=" + mapboxgl.accessToken +
    //     "&cachebuster=1585391923576&autocomplete=true&types=country&limit=1"

    // console.log(mbURI)

    // let geocode = await fetch(mbURI, { mode: 'no-cors' }); // <- something wrong here

    // geocode = geocode.json();
    // console.log(geocode)
    // let countryCode = geocode.features[0].properties.short_code;
    // geojson.properties.countryCode = countryCode;

    this.addGeojsonToMap(geojson);

    this.state.newZoneCt += 1;

    //console.log("geojson", JSON.stringify(geojson));
    map.fitBounds(turf.bbox(geojson), {
      padding: {
        top: 150,
        bottom: 50,
        left: 50,
        right: 500
      }
    }); // <- figure out padding

    this.setState({ zoneGeojson: geojson });

    d3.select("#geojson-input")
      .classed("is-invalid", false)
      .classed("is-valid", true)
      .attr("disabled", true);

    function readFileAsync(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsText(file);
      });
    }

        async function processFile(file) {
            try {
                let contents = await readFileAsync(file);
                return JSON.parse(contents);
            } catch (err) {
                console.log(err);
            }
        }
    };

    truncateAddress = address => {
        return address.substr(0, 7) + "..." + address.substr(address.length - 8, 8);
    };

    deregisterZone = async (zoneID) => {
        //fetch existing docuemnt from contract and read from arweave
        let oldDoc = this.state.didDoc;
        //delete serviceEndpoint with the given id
        let matched = false;

        /*
            TODO:
            pop up a modal or something to indicate the zone is being deregistered
         */

        oldDoc.service = oldDoc.service.filter(endpoint => {
            if (endpoint.id === zoneID) {
                matched = true;
            } else {
                return endpoint.id !== zoneID;
            }
        });
        if (!matched) {
            console.log("Zone not found!");
            return;
        }
        let newDoc = oldDoc;
        let newURI = await this.saveToArweave(JSON.stringify(newDoc, null, 2));
        let newHash = this.state.web3.utils.keccak256(JSON.stringify(newDoc));

        console.log("deleting zone")
        await this.register(newHash, newURI);
        console.log("zone DELETED");
    };

    deleteZone = async zone => {

        // if (zone.serviceEndpoint){
        //     await this.deregisterZone(zone.id)
        // }

        let tempZones = this.state.zones;

        tempZones = without(tempZones, zone);

        this.setState({ zones: tempZones });

        let layerId = zone.layerId; 
        console.log("Layer ID for deleted zone: " + layerId);

        map.removeLayer("zone-border-" + layerId);
        map.removeLayer("zone-fill-" + layerId);


        this.clearForm();
    };

  // isValidGeojson = (geojson) => {
  //     return true;
  // }
  // On Add zone. form submit
  addZoneFromForm = async event => {
    event.preventDefault();

    // Build service object
    let zoneObject = {
      id: this.state.didDoc.id + "#" + this.kebabify(this.state.zoneName),
      name: this.state.zoneName,
      serviceEndpoint: null,
      geojson: this.state.zoneGeojson,
      layerId: "layer-" + String(this.state.newZoneCt - 1),
      policies: {
        beneficiary: this.state.zoneBeneficiary,
        chargePerMinute: this.state.zoneCharge,
        currency: this.state.currency
      }
    };

    // Update this.state.zones by appending service object to .service
    // Check if object is not in zones.
    // if (this.state.zones.contains(zoneObject)) {
      // let zones;
      // if (this.state.zones.length > 0) {
        let zones = [...this.state.zones, zoneObject];
      // } else {
      //   zones = [zoneObject];
      // }
    await this.setState({ zones });

    // Zoom to bounding box including all zones
    this.zoomToAllZones();

    // Alert - 'Zone added. To publish zones, click "Register zones"'
    // Clear form
    this.clearForm();
  };

  kebabify = str => {
    return str
      .trim()
      .split(" ")
      .join("-")
      .toLowerCase();
  };

  clearForm = () => {
    document.getElementById("zone-form").reset();

    d3.selectAll(".is-valid").classed("is-valid", false);

    d3.selectAll(".is-invalid").classed("is-invalid", false);

    d3.select("#geojson-input").attr("disabled", null);

    this.resetNewZoneStateVariables();

    console.log("Form cleared");
  };

  resetForm = event => {
    event.preventDefault();

    // reset state variables"

    map.removeLayer("zone-border-layer-" + String(this.state.newZoneCt - 1));
    map.removeLayer("zone-fill-layer-" + String(this.state.newZoneCt - 1));

    this.clearForm();
  };

  resetNewZoneStateVariables = () => {
    this.setState({
      zoneName: "",
      zoneAdmin: "",
      zoneBeneficiary: "",
      zoneCharge: "",
      zoneCurrency: "",
      zoneGeojson: {}
    });
  };

  registerDID = async event => {
    event.preventDefault();
    // Pop up modal explaining what is happening.
    // We will need to tell the user to wait for
    // arweave deploy to complete before they can sign the metamask tx

    // For each zone in this.state.didDoc.service:
    let zones = await Promise.all(
      this.state.zones.map(async zone => {
        let zoneToDeploy = zone;

        if (!zoneToDeploy.serviceEndpoint) {
          let geojsonURI = await this.saveToArweave(
            JSON.stringify(zone.geojson)
          );
          zoneToDeploy.serviceEndpoint = geojsonURI;
          delete zoneToDeploy.layerId;
        }

        delete zoneToDeploy.geojson;

        return zoneToDeploy;
      })
    );

    // Once DID doc is built, write doc to arweave, returning didDocArweaveURI
    let didDocToRegister = this.state.didDoc;
    this.state.didDoc.service = zones;

    let didURI = await this.saveToArweave(JSON.stringify(didDocToRegister));

    // Register didDocArweaveURI on Ethereum DID registry with metamask signature
    let didHash = this.state.web3.utils.keccak256(
      JSON.stringify(didDocToRegister)
    );
    // console.log("REGISTER ON ETHEREUM:", didHash, didURI)
    this.register(didHash, didURI);
  };

  zoomToAllZones = () => {
    let zonesGeometries = this.state.zones.map(zone => {
      return zone.geojson;
    });

    let zonesBbox = turf.bbox(geojsonMerge.merge(zonesGeometries));
    map.fitBounds(zonesBbox, {
      padding: {
        left: 100,
        bottom: 75,
        top: 150,
        right: 500
      }
    });
  };

  scrollNavigation = () => {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top > 80) {
      document.getElementById("topnav").classList.add("nav-sticky");
    } else {
      document.getElementById("topnav").classList.remove("nav-sticky");
    }
  };

  saveToArweave = async document => {
    // Initialize Arweave
    let arw = Arweave.init();
    // let jwk = await axios.get("../ArweaveKey.json");
    let jwk = {
      kty: "RSA",
      ext: true,
      e: "AQAB",
      n:
        "qmuBH3Yv3hUUy51gn7lWneraru1Fv8Uq7s5g7qo2xfNApnAn7ZBYLozMVidGrEZrBCHgxnnaK2UXjfxCt5LcOCIKV9yvaplx_Xmw6V6KMV2KULejHCsxldSaaqZg70AJWJf3K6sN5K8yOw8zsipgpyOyKpQIp0HvzYKUfe8EM-UgqTRK7WnlOBrDjm43HbB9tBbx1qZrmG_QaiC2KbdLDGz6yIOP58GNc1gc9fUulUL0iVbbdcsguvh9FZqBtYlXA5MF2d5FGSvdBUkcdBrXTKKmIkSn8PZ7fwLndTCnGytoWTAnLyz9mblYRuNtwrMeAD7j13wtq5EVYViv841pWtrm_vnpZVACuaxsnZ4EOXqqhtg_9hAtrHQzhHuMQC356T3n_jjfk5EE6gXs2Cwoa2b5R342UP32qM9P0dYXW9jkqt5RGBmlukpqsJRkXMAAkpVWUeBBjnelt-KAjexOrSwLZoTjsja5mseHQpJ3S9Ysjg5dtJOTNWCcdzXwXaJ_TVI9LBqW5h-48YzLuZKTeGKGvko1wiBIWWb8daM53Ft1Qh2BgYPCOYuZCgan2j_ho76sJxKbGOeENZuH_XaUXC7NPJQFxmtNnXnsalSU1u3XaH3Y4WqTEux2PZi0apxjSjkLNsNY68Za4sALR-W0yosjhGVvwnlN8nKJHKPrSqc",
      d:
        "P9QX_pKjhwhaS5DcObaPDIKD-XSA5TyRwfOmNn2mGinrkur66W1gub6eYb5AKBIPzvJpX60P26T3V4Sd8Gee9584RIQxZzmligxkCGQSWj7wqR6-hrRe1AFW_I7oS3OujHIOb1qXz4kWxSwCbr6UiMVD29KqEwsNJ-m6eBhneJBe1UDyt00sPwE3MUdyeTo7OpJFbeHS9rsaUkWCNMmj4DmJDETKR0ElG4hrAGweUGVNdYsEk2_LCHw9TTQbVMTlxD7yuBEZzD2zgGFLuOi8rsVUeA1C4WtQAdgynJ_mVrTBVnZEltTA_yx-Nb7Ew2GW4PytFW47JMEoQteWvx-9z18k9Th2VNS3iSHPacqNQhCVUzahagMARfL7egWyyvIqfPwgAjZJveQgMRuPiWlt6B51ORRfv191HOG4UycLYk62s145vIb1MEYkLuwMaydsaVqsJ7-YnU-t079vUnWL_18UTSdxTwiUUoOt3WfnkEb3mUeZZUuMKD0p5mqrXC91Zo-CZRmeZ3LUuzgScqRimkt2_3F-DqjClyI54eakKYN3D10It1DkvlDEdb67kU6MAYRV3Ot52rpaTJTtnH3rm7IcGv4Rbw2krPWa0rALq7Qn_j_pevL21WhjuqU7AhhecYLZNPjBbMI39nRWflDV_5sCxorQLlzkG9ajhwApByE",
      p:
        "1JJ0glcj2Fru4T2pGEY4-l9CrQjaraDQ40aZewjFkM1DSedWNUo_fTCaMrW6CmQy6dwKHazPELlpWQs1WuYuWMbeSfTm1QY9zKZ4GJwxGMvAswI85W8yui7GknVPQ3uFU2nzvfTNs7Z_-F7LFeY1EDlj0zsRGDp9OyuGYbt9heWAqhnxWifVo6bWxM_NmAlS9MsFqYYNZltNeauo7GZSSkD2SBCxSFKSD76i4AydHL2TRep2UKneTPsxwjNj91anAexx3-Tddvood16HrX6gI1Livi3Tyx-Jj8ezDQRkvR7UfPwVhYOrz3ZbLZxKViayc0DP9Ph3Gt1H_4rLm0CWOQ",
      q:
        "zTx8pMxAJHIlGSXdaUekiU-2GZqYw0pUPfSFXZ5mpGBoZHZ77687seV8kdukSR0AGoWEh9jrav3qxD8YbkZghSIDAuZ1IqWgdXW9H0ewS7666EHo2Fv0UbI6s5zXG3sZ4WUPSIYn2FoobhPIy-yi5agSGxF7vGkt3AmhqfLuju6hyFARzkS1vGsRHXzdCPtW_QpkH6NgeBUjZ88JKFGBBLQxl6f13ZIptdp1zVaCOGyMSTR78zPkOagAX6NjqlWS_Z03-yX3i1i1CyZ8OhiILxTBvVW1_YwwEtnFS3ziWym9tHAqtjnQr7xej3uKaAY8deRmKRm6_na_vPx2v_Pn3w",
      dp:
        "OHNcNXDmuAIOBgrV6PhdEUBS-JitWgam8nRBNgcyUC3yfKHOpwA8tAZALM9NxIyvaKNinFbT9mEGtPrhBG60SCcnyQQceN3bc4mRwxdXgno5hlBF07ggBIl_ek1k60rWMTyl2gA00FDa0x55WCt2VASpmeLJu2Fs-FWqrjGYOAKmlIWnLoX9miQoTMPSmVmAijmQG2DaFiCRBoqrpXvWxplRzfmA2u_ykfPSVSWEY6mEfsCxAuLZgiADKsty9LAyUbR02TxyA7KTJIAaD9zcsgTE6jRJVlvdsC0cQ4yzI_YX_8kB_h7ldYa81_P1WcOVCD5h-3AwURYKlLZLM8OHIQ",
      dq:
        "DYJ_yfFP_5Yr7v3ZF0cKA6flmsXcbG6GIRXpeYIly4g1FvfdrKdiTJGIo6lLpSxth1FmqfKTfJV-ULC-kPO9AsZ8YEJ_T2qLp2-6pUZ4ymOhtgwwoZ1b9cy_pHcciciOqZGXcfSyxsEYjDZtL09CYc-wcWuzM3HQ_Pz9UUyWe34l1CPBKEzJkb-SfthrTF4PGdUHRjXg8caicADm32qODZs28H6z5oPqjvf0bTHWnJQ4n9D-n8G4sjrm22TL-LhtVph0yOl05A1QzY0Y_FIFFORO5IGx2yDRQUxoelGcLNgQjsIbbadcn1TM_LDrKXHPpQsF1orFDl8OvAf6YSRTDQ",
      qi:
        "mSKGlhQQ8vwrPjVyfoCftK77bVTQOTMBAVXalQH6Z9Cw_Nr6Q08w9CoHjmHppFROZK4LK8SbOQQY9HrO2Zur3WbVf9rpgB3OY_bPwcaXrpnj_z3nD1yyFubNvSpLbJCdaY3PYRijwdL0TX-xB1-MIyi3mKZKPDH3wjA6PSmJAHlhUL0VTe1yAUrEtFphKL9qMavb35NZPaGVDlJ3MQ5aN2nyAAG82mDHx_JNljAKy2W1Vy-Qag6xcZ74qCBraZA1Uwcs0sZRTMnoRN8koAyHVhk5XgYBnoL7MeA5vsbFJhwR8GYg8X_n-7M14sF07ZHhg3foART4KRb_KTlzLw7DWw"
    };

    let arweaveURL;

    try {
      // Create new transaction
      let transaction = await arw.createTransaction(
        {
          data: document
        },
        jwk
      );

      // Document to be rendered as txt
      transaction.addTag("Content-Type", "text/plain");

      // Sign transaction
      await arw.transactions.sign(transaction, jwk);

      // Submit transaction
      try {
        await arw.transactions.post(transaction);
      } catch (err) {
        console.log("Error occurred on submit: ", err);
      }

      arweaveURL = "https://arweave.net/tx/" + transaction.id + "/data.txt";
      console.log(arweaveURL);

      return Promise.resolve(arweaveURL);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  render() {
    return (
      <div>
        <Topbar />
        <div
          ref={el => (this.mapContainer = el)}
          className="map"
          id="map"
        ></div>
        <div ref={this.overlay} className="overlay" id="overlay" />

        <Col
          lg={7}
          style={{
            width: "550px",
            marginTop: "110px",
            marginLeft: "66.5%",
            marginBottom: "40px"
          }}
        >
          <div
            className="studio-home bg-white shadow mt-4 "
            style={{ paddingTop: "16px", paddingLeft: "8px" }}
          >
            <h2 className="d-flex" style={{ marginLeft: 40 }}>
              Zone Registry<span className="text-primary">.</span>
            </h2>

            <AnimateHeight duration={500} height={this.state.heightZonesCard}>
              <div>
                <div
                  className="card"
                  style={{ marginLeft: "40px", marginBottom: "3rem" }}
                >
                  <div className="card-header">Register new zone.</div>
                  <div className="card-body">
                    {/* <Form>
                                    <Form.File 
                                        id="custom-file"
                                        label="Custom file input"
                                        custom
                                    />
                                </Form> */}
                    <form id="zone-form">
                      <div className="row">
                        <div className="col-lg">
                          <div className="form-row">
                            <div className="form-group col-md">
                              <label htmlFor="inputOwnerDID">Zone name</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="London Congestion Zone"
                                onChange={event =>
                                  this.setState({
                                    zoneName: event.target.value
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group col-md">
                              <label htmlFor="inputOwnerDID">
                                Zone geometry
                              </label>
                              <input
                                type="file"
                                id="geojson-input"
                                className="form-control "
                                placeholder="Valid geojson of zone polygon"
                                onChange={event => this.loadGeojson(event)}
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group col-md">
                              <label htmlFor="inputOwnerDID">
                                Zone administrator
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Transport for London"
                                onChange={event =>
                                  this.setState({
                                    zoneAdmin: event.target.value
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md">
                              <label htmlFor="inputOwnerDID">
                                Beneficiary IoTeX address
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="io435df3531zd315713aD414..."
                                onChange={event =>
                                  this.setState({
                                    zoneBeneficiary: event.target.value
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group col-6">
                              <label htmlFor="inputOwnerDID">
                                Charge / minute{" "}
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="0.70"
                                onChange={event =>
                                  this.setState({
                                    zoneCharge: event.target.value
                                  })
                                }
                              />
                            </div>
                            <div className="form-group col-6">
                              <label htmlFor="inputOwnerDID">Currency</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="GBP"
                                onChange={event =>
                                  this.setState({
                                    zoneCurrency: event.target.value
                                  })
                                }
                              />
                            </div>
                          </div>

                          <button
                            className="btn btn-outline-primary"
                            onClick={e => this.addZoneFromForm(e)}
                          >
                            Add zone.
                          </button>
                          <button
                            className="btn btn-outline-danger float-right"
                            onClick={e => this.resetForm(e)}
                          >
                            Reset form.
                          </button>
                        </div>
                        {/* {this.state.createSelfDidLoading ? (
                                                <div className='col-6 d-flex justify-content-center'>
                                                    <div className='mb-4'>
                                                        <Loader/>
                                                    </div>
                                                </div>) : <div></div>}
                                            {
                                                this.state.createSelfDidLoaded ? (
                                                    <div className="col-6">
                                                        <div>
                                                            <div>DID: {this.state.didResult.id}</div>
                                                            <div>DID Document URI: {this.state.didResult.uri}</div>
                                                            <div>DID Document: <code>
                                                                <pre>{this.state.didResult.doc}</pre>
                                                            </code></div>
                                                        </div>
                                                    </div>
                                                ) : <div></div>
                                            } */}
                      </div>
                    </form>
                  </div>
                </div>
                <h4 className="d-flex" style={{ marginLeft: 40 }}>
                  Zones<span className="text-primary">.</span>
                </h4>
                {!this.state.zones
                  ? this.state.isAddressRegistered && (
                      <Alert variant="primary">
                        <Spinner
                          animation="border"
                          role="status"
                          variant="light"
                        ></Spinner>
                        Fetching zone geometries from the permaweb...
                      </Alert>
                    )
                  : this.state.zones.map(zone => {
                      return (
                        <ZoneCard
                          zone={zone}
                          deleteZone={this.deleteZone}
                          truncateAddress={this.truncateAddress}
                          zoomToZone={this.zoomToZone}
                          key={ zone.id.split('#')[1]}
                        />
                      );
                    })}
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{
                  marginLeft: "40px",
                  marginTop: "30px"
                }}
                onClick={e => this.registerDID(e)}
              >
                Register zones.
              </button>
            </AnimateHeight>
          </div>
        </Col>
      </div>
    );
  }
}

//
// import React from 'react'
// import Antenna from "iotex-antenna";
// import {
//     Contract
// } from "iotex-antenna/lib/contract/contract";
// import Web3 from "web3";
// import contractInfo from "../did-registration/did-contract-details";
// import eventABI from "../did-registration/did-event-abis";
// import {readLog, generateDocument, saveToArweave} from "../helperFunctions";
//
// // const GJV = require('geojson-validation'); // << geojson validator
//
//
// let unlockedWallet;
// let contract;
// let antenna;
// export class RegisterJurisdiction extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             arweavePrivateKey: '',
//             tezosPrivateKey: '',
//             didHash: '',
//             didURI: '',
//             creatorDID: '',
//             showModal: false,
//             congestionCharge: ''
//         };
//     }
//
//     async componentDidMount() {
//
//         // vvv This will need to be updated to connect to the Tezos contract
//             //connect to the test network
//             antenna = new Antenna("http://api.testnet.iotex.one:80");
//
//             //USER'S IOTEX PRIVATE KEY
//             //did:io:0xd29694ef9654e7296ebbfcfd7f5aba2050fc0b80
//             unlockedWallet = await antenna.iotx.accounts.privateKeyToAccount(
//                 "450a9968f2fb740a3eee34a870d79c5c991159d86d6600b5e924b81cdd23c57b"
//             );
//
//             //connect to the DIDsmartcontract
//             contract = new Contract(contractInfo.abi, contractInfo.contractAddress, {
//                 provider: antenna.iotx
//             });
//             this.remindDID("eec04109aab7af268a1158b88717bd6f62026895920aeb296d4150a7a309dec8")
//     };
//
//
// //returns the account details of the user
// getAccountDetails = async () => {
//         return await antenna.iotx.getAccount({
//             address: unlockedWallet.address
//         });
//     };
//
// //returns the didString of the caller
//  remindDID = async (privateKey) => {
//      unlockedWallet = await antenna.iotx.accounts.privateKeyToAccount(
//          privateKey
//      );
//     try {
//         let did = await antenna.iotx.readContractByMethod({
//             from: unlockedWallet.address,
//             contractAddress: contractInfo.contractAddress,
//             abi: contractInfo.abi,
//             method: "remindDIDString"
//         });
//         console.log(did);
//         return did;
//     } catch (err) {
//         console.log(err);
//     }
//
// };
//
//
// //returns timestamp
//  getTimeStamp = async (actionHash) => {
//     try {
//         const action = await antenna.iotx.getActions({
//             byHash: {
//                 actionHash: actionHash,
//                 checkingPending: true
//             }
//         });
//
//         console.log(JSON.stringify(action.actionInfo[0].timestamp));
//         return JSON.stringify(action.actionInfo[0].timestamp);
//     } catch (err) {
//         console.log(err);
//     }
//
// };
//
//
// //given the documentHash, uri, imei(optional), createsDID
// // and returns the actionHash(the address of the transaction)
// //emits evnet
// createDID = async (e, entity, privateKey) => {
//     e.preventDefault();
//     let wallet = await antenna.iotx.accounts.privateKeyToAccount(
//         privateKey
//     );
//     let did = await antenna.iotx.readContractByMethod({
//         from: wallet.address,
//         contractAddress: contractInfo.contractAddress,
//         abi: contractInfo.abi,
//         method: "remindDIDString"
//     });
//     let doc = generateDocument(entity, did);
//     let arweaveURL = await saveToArweave(doc);
//     let docHash = Web3.utils.keccak256(doc);
//
//     try {
//         let actionHash = await contract.methods.createDID(docHash, arweaveURL, "", {
//             account: wallet,
//             gasLimit: "1000000",
//             gasPrice: "1000000000000"
//         });
//         console.log(actionHash);
//         //wait till the block is mined
//         window.setTimeout(async () => {
//             //READ LOG
//             //IF YOU READ LOG too early before the createDID's transaction is approved, we get an err,
//             let log = await readLog(eventABI.createEvent, actionHash, antenna);
//             console.log("LOG when new did is created: ", log);
//             this.setState({didResult: {id: did, uri: arweaveURL, doc}});
//             return log.didString;
//
//         }, 11000)
//
//     } catch (err) {
//         console.log(err);
//     }
//
// };
//
//
//     createVehicleDID = async (e, vehicleType, imei) => {
//         e.preventDefault();
//         let pebbleWallet = await antenna.iotx.accounts.privateKeyToAccount(
//             this.state.pebblePrivateKey
//         );
//         let did = await antenna.iotx.readContractByMethod({
//             from: pebbleWallet.address,
//             contractAddress: contractInfo.contractAddress,
//             abi: contractInfo.abi,
//             method: "remindDIDString"
//         });
//         let doc = generateDocument("Device", this.state.creatorDID, imei, vehicleType, did);
//         let arweaveURL = await saveToArweave(doc);
//         let docHash = Web3.utils.keccak256(doc);
//         console.log(docHash);
//
//         try {
//             let actionHash = await contract.methods.createDID(docHash, arweaveURL, imei, {
//                 account: pebbleWallet,
//                 gasLimit: "1000000",
//                 gasPrice: "1000000000000"
//             });
//             //wait till the block is mined
//             window.setTimeout(async () => {
//                 //READ LOG
//                 //IF YOU READ LOG too early before the createDID's transaction is approved, we get an err,
//                 let log = await readLog(eventABI.createEvent, actionHash, antenna);
//                 console.log("LOG when new did is created: ", log);
//                 this.setState({vehicleDidResult: {id: did, uri: arweaveURL, doc}});
//                 return log.didString;
//
//             }, 11000)
//
//         } catch (err) {
//             console.log(err);
//         }
//
//     };
//
// //given didString and the updated documentHash,
// //updates hash of the did and returns the actionHash
// //emits event
// updateHash = async (didString, documentHash) => {
//     try {
//         let actionHash = await contract.methods.updateHash(didString, documentHash, {
//             account: unlockedWallet,
//             gasLimit: "1000000",
//             gasPrice: "1000000000000"
//         });
//         return actionHash;
//     } catch (err) {
//         console.log(err);
//     }
// };
//
// //same as above but updates uri
// updateURI = async (didString, documentURI) => {
//     try {
//         let actionHash = await contract.methods.updateURI(didString, documentURI, {
//             account: unlockedWallet,
//             gasLimit: "1000000",
//             gasPrice: "1000000000000"
//         });
//         return actionHash;
//     } catch (err) {
//         console.log(err);
//     }
// };
//
// //deleteDID only if it was sent by the owner
// //returns the actionHash if successful
// //emits event
// deleteDID = async (didString) => {
//     try {
//         let actionHash = await contract.methods.deleteDID(didString, {
//             account: unlockedWallet,
//             gasLimit: "1000000",
//             gasPrice: "1000000000000"
//         });
//         return actionHash;
//     } catch (err) {
//         console.log(err);
//     }
// };
//
// //given the didstring, returns hash
// getHash = async (didString) => {
//     try {
//         let hash = await antenna.iotx.executeContract({
//             from: unlockedWallet.address,
//             contractAddress: contractInfo.contractAddress,
//             abi: contractInfo.abi,
//             method: "getHash"
//         }, didString);
//
//         return "0x" + hash.toString('hex');
//     } catch (err) {
//         console.log(err);
//     }
// };
//
// //given the didstring, returns hash
// getURI = async (didString) => {
//     let uri = await antenna.iotx.readContractByMethod({
//         from: unlockedWallet.address,
//         contractAddress: contractInfo.contractAddress,
//         abi: contractInfo.abi,
//         method: "getURI"
//     }, didString);
//     return uri.toString('hex');
// };
//
// //get document from IMEI
// //assuming imei is all uniquie
// getDocUriFromImei = async (imei) => {
//     try {
//         let uri = await antenna.iotx.executeContract({
//             from: unlockedWallet.address,
//             contractAddress: contractInfo.contractAddress,
//             abi: contractInfo.abi,
//             method: "getDocumentUriFromIMEI"
//         }, imei);
//         return uri.toString('hex');
//     } catch (err) {
//         console.log(err);
//     }
// };
//
//     render() {
//         return (
//             <div className='container'>
//                 <button onClick={e => this.setState({showModal: true})}></button>
//                 <div className='card my-3'>
//                     <div className='card-header'><h3>Create a DID for yourself or your company</h3>
//                     </div>
//                     <div className='card-body'>
//                         <form>
//                             <div className="row">
//                                 <div className="col">
//                                     <div className="form-row">
//                                         <div className="form-group col-md">
//                                             <label htmlFor="inputOwnerDID">Entity (Individual, Corporate (Company name))</label>
//                                             <input type="text" className="form-control"
//                                                    placeholder="Individual" onChange={event => this.setState({entity: event.target.value})}/>
//                                         </div>
//                                     </div>
//                                     <div className="form-row">
//                                         <div className="form-group col-md">
//                                             <label htmlFor="inputOwnerDID">Private Key</label>
//                                             <input type="text" className="form-control"
//                                                    placeholder="dc435df3531zd315713aD414..." onChange={event => this.setState({privateKey: event.target.value})}/>
//                                         </div>
//                                     </div>
//                                     <button className="btn btn-primary" onClick={e => this.createDID(e, this.state.entity, this.state.privateKey)}>Register</button>
//
//                                 </div>
//                                 <div className="col">
//                                     <div>
//                                         <div>DID: {this.state.didResult.id}</div>
//                                         <div>DID Document URI: {this.state.didResult.uri}</div>
//                                         <div>DID Document: <code><pre>{this.state.didResult.doc}</pre></code></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//
//                 <div className='card my-3'>
//                     <div className='card-header'><h3>Create a DID for a vehicle</h3>
//                     </div>
//                     <div className='card-body'>
//                         <form>
//                             <div className="row">
//                                 <div className="col">
//                                     <div className="form-row">
//                                         <div className="form-group col-md">
//                                             <label htmlFor="inputEmailDID">Creator's DID</label>
//                                             <input type="text" className="form-control"
//                                                    placeholder="did:io:0x9ddj383jalk..." onChange={event => this.setState({creatorDID: event.target.value})}/>
//                                         </div>
//                                     </div>
//                                     <div className="form-row">
//                                         <div className="input-group mb-3">
//                                             <div className="input-group-prepend">
//                                                 <label className="input-group-text"
//                                                        htmlFor="inputGroupSelect01">Vehicle Type</label>
//                                             </div>
//                                             <select className="custom-select" id="inputGroupSelect01" onChange={e => this.setState({vehicleType: e.target.value})}>
//                                                 <option selected value='Car (petrol)' >Car (petrol)</option>
//                                                 <option value="Car (diesel)">Car (diesel)</option>
//                                                 <option value="Car (electric)">Car (electric)</option>
//                                                 <option value="Lorry">Lorry</option>
//                                                 <option value="Ship">Ship</option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                     <div className="form-row">
//                                         <div className="form-group col-md">
//                                             <label htmlFor="inputEmailDID">Pebble IMEI</label>
//                                             <input type="text" className="form-control"
//                                                    placeholder="990000862471854" onChange={event => this.setState({pebbleIMEI: event.target.value})}/>
//                                         </div>
//                                     </div>
//                                     <button className="btn btn-primary" onClick={e => this.createVehicleDID(e, this.state.vehicleType, this.state.pebbleIMEI)}>Register</button>
//
//                                 </div>
//                                 <div className="col">
//                                     <div className="form-group">
//                                         <label>Vehicle Private Key</label>
//                                         <textarea rows='7' type="text" className="form-control" id="proof"
//                                                   placeholder="0xeb327129a2a38141d275f4d68e...6edc9be437eed250ba6f71be05620ea1a3c971367bc1c" onChange={e => this.setState({pebblePrivateKey: e.target.value})}></textarea>
//                                     </div>
//                                 </div>
//                             </div>
//                         </form>
//                         <div>
//                             <div>DID: {this.state.vehicleDidResult.id}</div>
//                             <div>DID Document URI: {this.state.vehicleDidResult.uri}</div>
//                             <div>DID Document: <code><pre>{this.state.vehicleDidResult.doc}</pre></code></div>
//                         </div>
//                     </div>
//                 </div>
//
//             </div>
//         );
//     }
// }
