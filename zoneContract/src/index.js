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

  //https://arweave.net/tx/HU-KapDMU0NF5LXXgq_3N7BNNkS1DsxpaMOjBkUCfKk/data.txt
  //sample dod doc on awreave
  /********************** MAIN LOGIC on SUBMIT (pseudocode) ********************************/
  try {
    await initContract();
    let selectedAddress = web3.eth.currentProvider.selectedAddress;
    let exists = await isRegistered(selectedAddress);
    console.log(exists);
    if (exists) {
      //fetch existing docuemnt from contract and read from arweave
      let documentURI = await getURI(selectedAddress);
      console.log(documentURI);
      let DIDdocument = await readDocument(documentURI);
      //update based on DIDdocument
      //do sth e.g.) let updatedDIDdocument = DIDdocument.service.push(...)
      let updatedDIDdocument = {};
      // save to areweave
      let updatedDocumentURI = await saveToArweave(
        JSON.stringify(updatedDIDdocument, null, 2)
      );
      //save to contract
      await register(
        web3.utils.keccak256(updatedDocumentURI),
        updatedDocumentURI
      );
      console.log("did updated!");
    } else {
      //load submitted GEOJSON
      let geoJson = await $.getJSON("../data/countries/FRA.json");
      console.log(geoJson);
      let geoURI = await saveToArweave(JSON.stringify(geoJson, null, 2));
      //create new DIDdoc based on the geoURI and save to areweave
      let newDIDdocument = await $.getJSON("../data/DIDdocument.json");
      let newDocumentURI = await saveToArweave(
        JSON.stringify(newDIDdocument, null, 2)
      );
      //save to contract
      await register(web3.utils.keccak256(newDIDdocument), newDocumentURI);
      console.log("new did registerd!");
    }
  } catch (err) {
    console.log(err);
  }
});

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
