export function setLoadingText() {
    document.getElementById("dashboardLoadingText").innerHTML = "Loading Vehicles from Smart Contract...";
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Retrieving DID Documents from Arweave...";
    }, 2000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Loading Zones from Smart Contract...";
    }, 5000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Assigning random routes to vehicles...";
    }, 8000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "Populating map with vehicles and zones...";
    }, 10000);
    setTimeout(function () {
        document.getElementById("dashboardLoadingText").innerHTML = "(Yes, we know it's slow at the moment)";
    }, 13000);
    setTimeout(function () {
        document.getElementById("pageLoader").style.display = "none";
    }, 15000);
}