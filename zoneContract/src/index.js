//jshint esversion:6
window.addEventListener("load", async () => {

  //modern dapp browser
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    await ethereum.enable();
  } else {
    // Non-dapp browsers…
    console.log(
      "Ethereum browser not detected.You should consider trying MetaMask!"
    );
  }

  //sample did doc on awreave that was saved using the logic below
  //https://arweave.net/tx/oW_bnUbTPEDfBc9PBgxmsd-sO3TXWMhpdd7L-vkR55s/data.txt
  /********************** EXAMPLE MAIN LOGIC ********************************/
  try {
    await initContract();
    let FRA = await testMapping.get("FRA")();
    // when DID is not registered(creates a new doc and add frnce);
    registerZone(FRA, "FRANCE", {
      beneficiary: "0x456789123cdef...",
      chargePerMinute: 0.15,
      currency: "EURO"
    });
    /**** wait unitl the data is saved to arweave! this time the doc will be updated based on the old doc fetched*/
    let BEL = await testMapping.get("BEL")();
    registerZone(BEL, "BERILIN", {
      beneficiary: "0x456789123cdef...",
      chargePerMinute: 0.15,
      currency: "EURO"
    });

    /** deregister zone **/
    deregisterZone(
      metamask.selectedAddress,
      "did:example:123456789abcdefghi#heathrow-restricted-airspace"
    );
    /** deregister DID **/
    deregisterDID(metamask.selectedAddress);

    /** this will return all the uris registered**/
    let dids = await getExistingDIDs();
    console.log(dids);

    /** this will return uri of the given address**/
    let uri = await getURI(metamask.selectedAddress);
    console.log(uri);
  } catch (err) {
    console.log(err);
  }
});

/****************  MAIN functions using contract and arweave  ************************/
//https://arweave.net/tx/o60cqJXhhs1EhUaaSV3iYappfph3ionxHUYakFgiUG0/data.txt
const registerZone = async (geoJson, name, policies) => {
  let selectedAddress = web3.eth.currentProvider.selectedAddress;
  //check if already registered
  let exists = await isRegistered(selectedAddress);
  //save geojsonto arweave
  console.log("mygeoJSON_URI");
  let newGeoURI = await saveToArweave(JSON.stringify(geoJson, null, 2));
  let newEndpoint = {
    id: "did:example:" + selectedAddress + "#" + name,
    name: name,
    serviceEndpoint: newGeoURI,
    policies: policies
  };
  let newDoc;
  if (exists) {
    //fetch existing docuemnt from contract and read from arweave
    let oldDocURI = await getURI(selectedAddress);
    let oldDoc = await readFromArweave(oldDocURI);
    //update based on old did and new geoURI
    oldDoc.service.push(newEndpoint);
    newDoc = oldDoc;
    console.log("updating doc...");
  } else {
    //create new DIDdoc based on new geoURI
    newDoc = await testMapping.get(selectedAddress)();
    newDoc.service.push(newEndpoint);
    console.log("creating new doc...");
  }
  let newURI = await saveToArweave(JSON.stringify(newDoc, null, 2));
  let newHash = web3.utils.keccak256(JSON.stringify(newDoc));

  await register(newHash, newURI);
  console.log("REGISTERED");
};

const deregisterZone = async (address, zoneID) => {
  let exists = await isRegistered(address);
  if (exists) {
    //fetch existing docuemnt from contract and read from arweave
    let oldDocURI = await getURI(address);
    let oldDoc = await readFromArweave(oldDocURI);
    //delete serviceEndpoint with the given id
    let matched = false;
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
    let newURI = await saveToArweave(JSON.stringify(newDoc, null, 2));
    let newHash = web3.utils.keccak256(JSON.stringify(newDoc));
    await register(newHash, newURI);
    console.log("zone DELETED");
  } else {
    console.log("did document does not exist");
  }
};

const deregisterDID = async address => {
  let exists = await isRegistered(selectedAddress);
  if (exists) {
    try {
      await deregister(address);
    } catch (err) {
      console.log(err);
      console.log("not authorized to delete!");
    }
    console.log("DID DELETED");
  } else {
    console.log("did document does not exist");
  }
};

//address and abi already loaded
const initContract = async () => {
    contract = new web3.eth.Contract(abi, address);
    // for testing purposes
    window.methods = contract.methods;
    window.someHash =
        "0x6b22041934973b8dc2d68181b87f18ef085f739c793a99dd72062f97ec4e3c4f";
    window.admin = "0xaf6c60f9569a5957b9e8679d7178b0e15e462e72";
    window.metamask = web3.eth.currentProvider;
    window.register = register;
    window.deregister = deregister;
    window.isRegistered = isRegistered;
    window.getURI = getURI;
    window.getExistingDIDs = getExistingDIDs;
};

/********************** MAIN CONTRACT FUNCTIONS ****************/
//checks if a given address is registered, return boolean
const isRegistered = async address => {
    let value = await methods.isRegistered(address).call({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.returnedBool = value;
    return value;
};

//given the hash and uri, registers a DID.
//if already registered it updates, otherwise create a new one
const register = async (hash, uri) => {
    let receipt = await methods.register(hash, uri).send({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.registerReceipt = receipt;
    return receipt;
};
//deletes did of the specified address
//the creater and the admin has the right
const deregister = async address => {
    let receipt = await methods.deregister(address).send({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.deregisterReceipt = receipt;
    return receipt;
};
//retrieves an uri of the given address
const getURI = async address => {
    let value = await methods.getURI(address).call({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.returnedURI = value;
    return value;
};

//returns an array of EXISITING DIDs struct {exists(bool), hash(byte32), }
const getExistingDIDs = async () => {
    let value = await methods.getExistingDIDs().call({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.returnedDIDs = value;
    return value;
};

/********************* AVAILABLE FUNCTIONS BUT NOT THAT IMPORTANT *************************/

const getHash = async address => {
    let value = await methods.getHash(address).call({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.returnedHash = value;
};

const getExistingAddrs = async () => {
    let value = await methods.getExistingAddrs().call({
        from: metamask.selectedAddress,
        gasPrice: "80000000000"
    });
    window.returnedAddresses = value;
};

/**************************       testing mapping      **************************/
let testMapping = new Map();
testMapping.set("0xeb8a5755f2a9bcbe686b3d841405221ef21db855", async () => {
  let res = await $.getJSON("../data/DIDdocument1.json");
  return res;
});
testMapping.set("0xaf6c60f9569a5957b9e8679d7178b0e15e462e72", async () => {
  let res = await $.getJSON("../data/DIDdocument1.json");
  return res;
});
testMapping.set("0x694c631657345f75d412e84280ab62b202617d57", async () => {
  let res = await $.getJSON("../data/DIDdocument3.json");
  return res;
});

testMapping.set("FRA", async () => {
  let res = await $.getJSON("../data/countries/FRA.json");
  return res;
});
testMapping.set("DEU", async () => {
  let res = await $.getJSON("../data/countries/DEU.json");
  return res;
});

testMapping.set("BEL", async () => {
  let res = await $.getJSON("../data/countries/BEL.json");
  return res;
});

testMapping.set("GBR", async () => {
  let res = await $.getJSON("../data/countries/GBR.json");
  return res;
});

testMapping.set("LUX", async () => {
  let res = await $.getJSON("../data/countries/LUX.json");
  return res;
});
