zone registry contract and js functions to interact with it.
contract is deployed here : 0xf6f64cbe7b1928fc5299f11a14cb2150efd6919d

what each file includes....

src/arweave.js
function that reads/writes to arewaeve

data
sample DID doc and Geo File is stored here

test/ZoneRegistry.js
tests the smart contract, tested all the functions on smart contract

src/index.js
this is where all the fucnitons to interact with the smart contract is written. u can ignore gethash, getExisitngAddrs functions as its not neeeded. the main functions from the contract are used in the "MAIN LOGIC ON SUBMIT" section. for delting exisitng did docs, you can use
"deregister" the admin and the creater has the right.
"getExisitingDIDs" can be invoked when checking if a vehicle is within the polygon. it returns array of exising DIDs struct, within which the uri can be found.
