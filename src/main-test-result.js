console.log("Grasping test result...");

const csv = require("../lib/saving-csv-file").SavingCSVFile;
const Web = require("../lib/grasping-web-info").GraspingWebInfo;

(async function() {
    await csv.Open("ubuntu")
        .then(function() {
        console.log("Open csv file success!");
    })
        .catch(function() {
        console.log("Open csv file fail!");
    });

    let platforms = "ubuntu";
    let RemoteURL = "http://brucedai.github.io/nt/test/index-local.html";
    await Web.setChromePath("/usr/bin/chromium-browser-unstable");
    await Web.setRemoteURL(RemoteURL);
    await Web.setCSVFile(csv);
    await Web.setPlatforms(platforms);
    await Web.setWebMLSwitch(false);
    await Web.CreateDriver();
    await Web.GraspTestResult();

    await csv.Close()
        .then(function() {
        console.log("Close csv file success!");
    })
        .catch(function() {
        console.log("Close csv file fail!");
    });

    await Web.Close();
})().then(_ => console.log("Test complete!"), err => console.log("ERROR: " + err));
