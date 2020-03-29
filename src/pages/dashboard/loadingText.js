export function setLoadingText() {

    document.getElementById("loading-text").style.display = "block"

    document.getElementById("dashboardLoadingText").innerHTML = "Loading Vehicles from IoTeX DID registry...";
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Retrieving DID Documents from the Arweave permaweb...";
    }, 2000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Loading Zone DID documents from Ethereum...";
    }, 5000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Assigning random routes to demo vehicles...";
    }, 8000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Populating map with vehicles and zones...";
    }, 10000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "(Yes, we know it's slow at the moment)";
    }, 13000);
    // setTimeout(function () {
    // }, 15000);
}