# Hyperaware

Ensure you are running Node version 13.1.0.

To manage node versions, download nvm.

    NVM Windows: https://github.com/coreybutler/nvm-windows
    NVM MacOS/Linux: https://github.com/nvm-sh/nvm

Then run `nvm install 13.1.0` followed by `nvm use 13.1.0`

Then `yarn` or `npm install` to install the packages

After installing node modules you may see some errors coming from the Secureworker module. This is because your system may not have
Intel SGX configured, but they are fine to ignore because the app will run in 'Mock' mode.

In the project directory, you can then run:

`yarn run dev` or `npm run dev`

To run the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
<hr>

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

