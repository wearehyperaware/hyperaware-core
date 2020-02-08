## Available Scripts

`npm run start` - This starts and opens up the server. Run `npm install` before the first time you run this.

This should be a working repo. Please don't introduce any breaking changes. Submit pull requests when you want to commit code.

Current working routes are:

/

/registerdid

/vehicleregistration

/jurisdictionregistration


Bug fixes required:
* Current vehicle registry contract uses uint8 for timestamp but needs to be 256 to handle >4 hours locktime
* Not able to decode array of all vehicles for some reason? (iotex library issue?)

Needed:

* Add a method to VehicleRegistry.sol which returns every single registered vehicle (see line 67 in dashboard.js)
* General styling of forms and pages to look nicer (Tony?)
* UNIT TESTS! (Someone, please)
* Error messages/error handling (anyone)
* Populate forms for jurisdiction registration and interaction and have a dashboard for each one? (John?)
* Add enclave code instead of checking in node server (will add this at the end so as to not affect anyone's dev environment)


Nice to have:

* A bulk did creation function for more rapid testing
* Add read, update and delete functionality to the registerdid page (Tony?)
* Implement loading spinners when waiting for results
* Login page so you only need to sign in with private key or keystore file once instead of repeatedly entering (see iotex web wallet implementation for inspiration) (anyone)



Some currently registered dids:
(you can't register vehicles with these as they're already registered, create new dids first)
```
io1hyqxg4wqvss8mgwxz0vyfrhl7u5ewlmjy7jjcp
8d091132fb97b0c0efac568a69f271da266d6c1ae795793fc69e4b21eaab254c
DID: did:io:0xb9006455c064207da1c613d8448efff729977f72
DID Document URI: https://arweave.net/tx/QdNYz2P7cNeuGL5rPposOS6qs1qXzwrNPtTF0pfLxwo/data.txt
DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:io:0xb9006455c064207da1c613d8448efff729977f72",
  "created": "2020-02-08T20:19:06.388Z",
  "entity": "Device",
  "creator": "did:io:0xb700007938f39018f6a7031f78e45151bcb276e2",
  "vehicleType": "Car (petrol)",
  "imei": "351756051523999"
}
io1lced05av7c6s8p685ld7aqvpepv7em4ypxpahy
df707a16c0146eed83848791ae09b3f0f916b2820e2cda31e5532f10efdf32fc
DID: did:io:0xfe32d7d3acf635038747a7dbee8181c859eceea4
DID Document URI: https://arweave.net/tx/40VBDnCrMaE_ZBZ9aFgLGWx6rCoyHW090Twv6Xydbt4/data.txt
DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:io:0xfe32d7d3acf635038747a7dbee8181c859eceea4",
  "created": "2020-02-08T20:20:21.825Z",
  "entity": "Device",
  "creator": "did:io:0x8bedf00a67fc9c935097a39de4d3238ae0c83885",
  "vehicleType": "Car (electric)",
  "imei": "156056051523999"
}
---
io18du4zkl8akqkc306v2u2jqkff8sf96xw00g5qa
462f3d0cc343b700bbdea31a7a88cc3db60147af757ed78276f7a11bcfe0511d
DID: did:io:0x3b79515be7ed816c45fa62b8a902c949e092e8ce
DID Document URI: https://arweave.net/tx/BDKEwoQWzxYj0-OPhs1HV2ngZ2fBZJ_eYwr96-JE88E/data.txt
DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:io:0x3b79515be7ed816c45fa62b8a902c949e092e8ce",
  "created": "2020-02-08T20:21:47.149Z",
  "entity": "Device",
  "creator": "did:io:0xe3aa1b66a618847beb0096520ed8b0aabc5a124e",
  "vehicleType": "Car (diesel)",
  "imei": "156022051523629"
}
io1uw4pke4xrzz8h6cqjefqak9s42795yjwxny4fh
0eccfa8fad2daf5dedb4a0c22855d0f85d4aa05ec786a24cf6c3828f0fba7e21
DID: did:io:0xe3aa1b66a618847beb0096520ed8b0aabc5a124e
DID Document URI: https://arweave.net/tx/dVZtTUXjClkq19IDFJ6BbfzhnfXIJxd_rzWne-8lI5I/data.txt
DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "created": "2020-02-07T22:03:26.083Z",
  "entity": "Individual",
  "creator": "did:io:0xe3aa1b66a618847beb0096520ed8b0aabc5a124e"
}

---
io130klqzn8ljwfx5yh5ww7f5er3tsvswy9007cq5
b82c23f467400ceb85f5f316875d638cb8d83493392425357f41faf1218ab928
DID: did:io:0x8bedf00a67fc9c935097a39de4d3238ae0c83885
DID Document URI: https://arweave.net/tx/-w3EphetWxPUMma3145IykaX414SrJZvl9H5CMAJT6A/data.txt
DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "created": "2020-02-08T20:03:14.957Z",
  "entity": "Individual",
  "creator": "did:io:0x8bedf00a67fc9c935097a39de4d3238ae0c83885"
}
---
io1kuqqq7fc7wgp3a48qv0h3ez32x7tyahzk02sj2
88c5e0f636e3dbf624bd6bb905fab91588c3fc11ba714e67882ce1e7b5041c06
DID: did:io:0xb700007938f39018f6a7031f78e45151bcb276e2
DID Document URI: https://arweave.net/tx/v59i9LMAEWZb53_G3wGhZ-ai3sPXPT4QisOotyjb6sE/data.txt
DID Document:
{
  "@context": "https://w3id.org/did/v1",
  "created": "2020-02-08T20:04:08.022Z",
  "entity": "Individual",
  "creator": "did:io:0xb700007938f39018f6a7031f78e45151bcb276e2"
}

```