const Zones = artifacts.require("./ZoneRegistry");
const someHash =
    "0x6b22041934973b8dc2d68181b87f18ef085f739c793a99dd72062f97ec4e3c4f";
contract("zones create", accounts => {
    let contract;
    let dids;
    before(async () => {
        contract = await Zones.deployed();
    });

    it("Should be able to register", async () => {
        await contract.register(someHash, "uri1", {
            from: accounts[0]
        });

        await contract.register(someHash, "uri2", {
            from: accounts[1]
        });

        await contract.register(someHash, "uri3", {
            from: accounts[2]
        });

        const registedAddrs = await contract.getExistingAddrs.call({
            from: accounts[0]
        });
        assert.equal(registedAddrs.length, 3);
        assert.equal(registedAddrs[0], accounts[0]);
        assert.equal(registedAddrs[1], accounts[1]);
        assert.equal(registedAddrs[2], accounts[2]);
    });

    it("should be able to fetch info", async () => {
        let uri1 = await contract.getURI.call(accounts[0], {from: accounts[6]});
        let hash1 = await contract.getHash.call(accounts[0], {from: accounts[7]});
        assert.equal(uri1, "uri1");
        assert.equal(hash1, someHash);
    });

    it("register should be able to delete", async () => {
        await contract.register(someHash, "uri4", {
            from: accounts[3]
        });
        await contract.deregister(accounts[3], {
            from: accounts[3]
        });
        registedAddrs = await contract.getExistingAddrs.call({
            from: accounts[0]
        });
        assert.equal(registedAddrs.length, 3);
        registedAddrs.forEach(addr => {
            assert.notEqual(addr, accounts[3]);
        });
        dids = await contract.getExistingDIDs.call({
            from: accounts[0]
        });
        assert.equal(dids.length, 3);
        let count = 1;
        dids.forEach(did => {
            assert.isTrue(did.exist);
            assert.notEqual(dids.uri, "uri" + count);
            count++;
        });
    });

    it("Only admin should be able to delte other account", async () => {
        await contract.register(someHash, "uri4", {
            from: accounts[3]
        });
        try {
            await contract.deregister(accounts[3], {
                from: accounts[1]
            }); //should not be deleted!
            assert.isTrue(false);
        } catch (error) {
            console.log("error Expected!");
            await contract.register(someHash, "uri5", {
                from: accounts[4]
            });
            await contract.deregister(accounts[4], {
                from: accounts[0]
            }); // shuold be deleted
            registedAddrs = await contract.getExistingAddrs.call({
                from: accounts[0]
            });
            assert.equal(registedAddrs.length, 4);
            let account4Exist = false;
            registedAddrs.forEach(addr => {
                if (addr == accounts[3]) account4Exist = true;
                assert.notEqual(addr, accounts[4]);
            });
            assert.isTrue(account4Exist);
        }
    });

    it("can return array of structDID", async () => {
        dids = await contract.getExistingDIDs.call({
            from: accounts[0]
        });
        let counter = 1;
        dids.forEach(did => {
            assert.equal(did.uri, "uri" + counter);
            counter++;
        });
    });

    it("should check if registered address exists", async () => {
        for (let i = 0; i < dids.length; i++) {
            assert.isTrue(await contract.isRegistered.call(accounts[i]));
        }
        for (let i = dids.length; i < accounts.length; i++) {
            assert.isFalse(await contract.isRegistered.call(accounts[i]));
        }
    });
});

//test accoutns
// [ '0x21BC3bDd13C24b3db0BE7874A1d3577E11C86c4A',
//   '0x92616e28614A3f2e172c975879A3A6B2Dcd44Dbb',
//   '0x4a269d95125dA9B5bed85b3Dd8797b69541745e7',
//   '0x436ba564935ed62dEaB6E35CE858FF153Af1D3d1',
//   '0x3660A4E5bA533c73413b48EBDFa04aFc1dc58248',
//   '0x42dF9323014DB4FE9980AD906168eaB8195158A2',
//   '0x07C2f754E75C7fE9e7A0957BF68503346A46f28F',
//   '0x74422b021708E7849F7fc8f35A762849dD48e711',
//   '0x60520d506baFf1CBdD4c1198a4aE4c7f7a93665e',
//   '0x0323C88DA675E9cbd6Ee9dB76fBAc44cd6B11b2a' ]
