export function setLoadingText() {

    document.getElementById("loading-text").style.display = "block"

    document.getElementById("dashboardLoadingText").innerHTML = "Loading Vehicles from IoTeX...";
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Retrieving DID Documents from the Arweave permaweb...";
    }, 2400);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Loading Zone DID documents from Ethereum...";
    }, 5000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Retrieving GeoJSON files from Zone DID documents...";
    }, 7800);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Assigning random routes to demo vehicles...";
    }, 11500);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Populating map with vehicles and zones...";
    }, 14000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "(Yes, we know it's slow at the moment)";
    }, 16000);

}