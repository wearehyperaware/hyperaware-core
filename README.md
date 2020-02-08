## Available Scripts

`npm run start` - This starts and opens up the server. Run `npm install` before the first time you run this.

This should be a working repo. Please don't introduce any breaking changes. Submit pull requests when you want to commit code.

Current working routes are:

/
/registerdid
/vehicleregistration
/jurisdictionregistration


Needed:

* Add a method to VehicleRegistry.sol which returns every registered vehicle (see line 67 in dashboard.js)
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
